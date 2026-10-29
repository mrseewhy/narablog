import "dotenv/config";
import { randomBytes, randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { Pool } from "pg";
import { hashPassword } from "better-auth/crypto";

const origin = new URL(process.env.BETTER_AUTH_URL || "http://localhost:3000");
if (process.env.NODE_ENV === "production" || !["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname)) {
  throw new Error("Demo seeding is limited to a local development app origin.");
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

const credentialsPath = ".seed-credentials.json";
const accounts = [
  { id: "seed-author-ada", name: "Ada Okafor", email: "ada@naroblog.test", role: "user" },
  { id: "seed-author-tunde", name: "Tunde Bello", email: "tunde@naroblog.test", role: "user" },
  { id: "seed-admin-amina", name: "Amina Yusuf", email: "amina@naroblog.test", role: "admin" },
];
const categories = [
  { name: "Technology", slug: "technology", description: "Tools, ideas, and people shaping the digital world.", topics: [
    "Building a useful personal website", "How small teams choose their tools", "A practical guide to digital privacy",
    "What makes an app feel fast", "Learning to code with a clear goal", "Keeping your files organized",
    "Making technology more accessible", "The value of simple software", "How to evaluate a new tool", "Thoughtful habits for online work",
  ] },
  { name: "Culture", slug: "culture", description: "The art, traditions, and everyday stories that connect us.", topics: [
    "Why local stories matter", "A walk through the neighborhood market", "The music that brings people together",
    "Reading as a daily practice", "How food carries family history", "The makers behind everyday objects",
    "Finding new voices in literature", "A community festival remembered", "Why public spaces shape culture", "Passing traditions to the next generation",
  ] },
  { name: "Travel", slug: "travel", description: "Places to explore and ways to travel with curiosity.", topics: [
    "Planning a weekend away", "Seeing a familiar city with fresh eyes", "Traveling light without missing essentials",
    "A guide to slow travel", "Finding memorable local meals", "Making room for unplanned discoveries",
    "How to research a new destination", "Choosing the right time to visit", "Taking better travel notes", "Returning home with new perspective",
  ] },
  { name: "Food", slug: "food", description: "Recipes, ingredients, and the people around the table.", topics: [
    "The joy of cooking together", "A simple meal for a busy evening", "Choosing seasonal ingredients",
    "The story behind a favorite recipe", "Making breakfast worth slowing down for", "Learning from a home cook",
    "What a local market can teach us", "Keeping a useful pantry", "Sharing food with neighbors", "Small changes that improve a meal",
  ] },
  { name: "Wellness", slug: "wellness", description: "Everyday practices for a healthier, more balanced life.", topics: [
    "Building a sustainable morning routine", "Finding time for a short walk", "Rest as part of productive work",
    "Making space for quiet moments", "The basics of a better sleep schedule", "Staying connected with friends",
    "Setting realistic personal goals", "Creating a comfortable workspace", "Why small habits last", "Checking in with yourself each week",
  ] },
];

const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(73829142)");
  let credentials;
  try {
    credentials = JSON.parse(await readFile(credentialsPath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  for (const account of accounts) {
    const existing = await client.query('SELECT id, email, role FROM "user" WHERE id=$1 OR email=$2', [account.id, account.email]);
    if (existing.rowCount && (existing.rowCount !== 1 || existing.rows[0].id !== account.id || existing.rows[0].email !== account.email || existing.rows[0].role !== account.role)) {
      throw new Error(`Fixture account conflict: ${account.email}`);
    }
    if (existing.rowCount && !credentials) throw new Error("Fixture accounts exist but the local credential file is missing.");
  }
  if (!credentials) {
    credentials = Object.fromEntries(accounts.map((account) => [account.email, `Seed-${randomBytes(18).toString("base64url")}!9a`]));
    await writeFile(credentialsPath, JSON.stringify(credentials, null, 2) + "\n", { flag: "wx", mode: 0o600 });
  }
  for (const account of accounts) {
    const found = await client.query('SELECT id FROM "user" WHERE id=$1', [account.id]);
    if (found.rowCount) continue;
    const password = credentials[account.email];
    if (typeof password !== "string") throw new Error(`Missing credential for ${account.email}`);
    await client.query('INSERT INTO "user" (id, name, email, email_verified, role) VALUES ($1,$2,$3,false,$4)', [account.id, account.name, account.email, account.role]);
    await client.query('INSERT INTO account (id, account_id, provider_id, user_id, password, updated_at) VALUES ($1,$2,$3,$4,$5,now())', [randomUUID(), account.id, "credential", account.id, await hashPassword(password)]);
  }
  for (const category of categories) {
    let result = await client.query('SELECT public_id, name FROM categories WHERE lower(name)=lower($1) OR slug=$2', [category.name, category.slug]);
    if (result.rowCount > 1 || (result.rowCount === 1 && result.rows[0].name.toLowerCase() !== category.name.toLowerCase())) throw new Error(`Fixture category conflict: ${category.slug}`);
    if (!result.rowCount) {
      await client.query('INSERT INTO categories (name, slug, description) VALUES ($1,$2,$3)', [category.name, category.slug, category.description]);
      result = await client.query('SELECT public_id, name FROM categories WHERE slug=$1', [category.slug]);
    }
    const categoryId = result.rows[0].public_id;
    for (const [index, title] of category.topics.entries()) {
      const slug = `seed-${category.slug}-${index + 1}`;
      const author = accounts[(categories.indexOf(category) * 10 + index) % accounts.length];
      const paragraphs = [
        `${title} is a story about ${category.name.toLowerCase()} and the choices we make in everyday life.`,
        `Start with one observation, ask a useful question, and look for the details that are easy to miss. The best ideas often come from paying close attention to ordinary experiences.`,
        `This article is part of the NaroBlog ${category.name} collection. Explore the topic, compare perspectives, and make the next step your own.`,
      ];
      const content = paragraphs.map((paragraph) => ({ type: "paragraph", content: [{ type: "text", text: paragraph }] }));
      const publishedAt = new Date(Date.now() - (categories.indexOf(category) * 10 + index) * 86400000);
      await client.query(`INSERT INTO posts (title, slug, content, author_id, category_id, status, published_at)
        VALUES ($1,$2,$3::jsonb,$4,$5,'Published',$6) ON CONFLICT (slug) DO NOTHING`, [title, slug, JSON.stringify(content), author.id, categoryId, publishedAt]);
      const post = await client.query('SELECT category_id, status FROM posts WHERE slug=$1', [slug]);
      if (post.rowCount !== 1 || post.rows[0].category_id !== categoryId || post.rows[0].status !== "Published") throw new Error(`Fixture post conflict: ${slug}`);
    }
  }
  await client.query("COMMIT");
  console.log("Demo seed ready: 2 users, 1 admin, 5 categories, and 50 published posts.");
  console.log(`Credentials saved locally to ${credentialsPath} (not printed).`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
