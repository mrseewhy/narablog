import "dotenv/config";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFile, readdir, writeFile, unlink } from "node:fs/promises";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { Pool } from "pg";

// All mutations use a disposable schema. Existing accounts are never fixtures.
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const schema = `auth_e2e_${randomBytes(6).toString("hex")}`;
const adminPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
});
let pool, child;
let output = "";
const passed = [];
const mailOffsets = new Map();
const password = "SecurePass1!";
const cronSecret = randomBytes(24).toString("hex");
let base;
class Browser {
  cookies = new Map();
  async request(path, body, options = {}) {
    const response = await fetch(new URL(path, base), {
      method: body === undefined ? "GET" : "POST",
      redirect: "manual",
      headers: {
        ...(body === undefined
          ? {}
          : { "Content-Type": "application/json", Origin: base }),
        Cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; "),
        ...options.headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    for (const value of response.headers.getSetCookie()) {
      const [pair] = value.split(";");
      const at = pair.indexOf("=");
      if (at > 0) this.cookies.set(pair.slice(0, at), pair.slice(at + 1));
    }
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
    return {
      status: response.status,
      location: response.headers.get("location"),
      text,
      data,
      headers: response.headers,
    };
  }
}
const api = (path) => `/api/auth${path}`;
async function clearLimits() {
  await pool.query("DELETE FROM rate_limits");
}
async function mail(kind, email) {
  for (let i = 0; i < 100; i++) {
    const marker = `[Local auth email: ${kind}] To: ${email}`;
    const start = output.indexOf(marker, mailOffsets.get(marker) || 0);
    if (start >= 0) {
      const match = output
        .slice(start + marker.length)
        .match(/https?:\/\/[^\s\x1b]+/);
      if (match) {
        mailOffsets.set(
          marker,
          start + marker.length + match.index + match[0].length,
        );
        return match[0];
      }
    }
    await delay(100);
  }
  throw new Error(`No ${kind} delivery link was produced`);
}
async function signup(email) {
  const browser = new Browser();
  const result = await browser.request(api("/sign-up/email"), {
    name: "Test Account",
    email,
    password,
  });
  assert.equal(result.status, 200, "signup should succeed");
  assert.ok(result.data.token, "registration should create a session");
  return browser;
}
async function signin(browser, email, pass = password) {
  const result = await browser.request(api("/sign-in/email"), {
    email,
    password: pass,
  });
  assert.equal(result.status, 200, "valid credentials should sign in");
  return result;
}
async function step(name, fn) {
  await fn();
  passed.push(name);
  console.log(`PASS ${name}`);
}
async function action(browser, route, name, args) {
  const manifest = JSON.parse(
    await readFile(
      ".next-auth-e2e/dev/server/server-reference-manifest.json",
      "utf8",
    ),
  );
  const entry = Object.entries(manifest.node).find(
    ([, v]) => v.exportedName === name,
  );
  assert.ok(entry, `${name} must be exposed by the real page`);
  const response = await fetch(base + route, {
    method: "POST",
    redirect: "manual",
    headers: {
      Origin: base,
      "Content-Type": "text/plain;charset=UTF-8",
      "Next-Action": entry[0],
      Cookie: [...browser.cookies].map(([k, v]) => `${k}=${v}`).join("; "),
    },
    body: JSON.stringify(args),
  });
  const text = await response.text();
  return { status: response.status, text };
}
try {
  await adminPool.query(`CREATE SCHEMA "${schema}"`);
  const scoped = new URL(process.env.DATABASE_URL);
  // Neon poolers reject startup search_path. Tests use the corresponding
  // direct endpoint so every connection remains inside the isolated schema.
  if (scoped.hostname.endsWith(".neon.tech"))
    scoped.hostname = scoped.hostname.replace(/-pooler(?=\.)/, "");
  scoped.searchParams.set("options", `-c search_path=${schema}`);
  pool = new Pool({
    connectionString: scoped.toString(),
    connectionTimeoutMillis: 10000,
  });
  for (const file of (await readdir("drizzle"))
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    const sql = (await readFile(`drizzle/${file}`, "utf8")).replaceAll(
      '"public".',
      `"${schema}".`,
    );
    for (const statement of sql.split("--> statement-breakpoint"))
      if (statement.trim()) await pool.query(statement);
  }
  const socket = createServer();
  socket.listen(0, "127.0.0.1");
  await once(socket, "listening");
  const port = socket.address().port;
  await new Promise((r) => socket.close(r));
  base = `http://127.0.0.1:${port}`;
  await writeFile(
    ".next-auth-e2e.tsconfig.json",
    await readFile("tsconfig.json", "utf8"),
  );
  child = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    {
      env: {
        ...process.env,
        NODE_ENV: "development",
        DATABASE_URL: scoped.toString(),
        BETTER_AUTH_URL: base,
        BETTER_AUTH_SECRET: randomBytes(32).toString("base64"),
        CRON_SECRET: cronSecret,
        AUTH_E2E_DIST_DIR: ".next-auth-e2e",
        AUTH_E2E_TSCONFIG: ".next-auth-e2e.tsconfig.json",
        NEXT_TELEMETRY_DISABLED: "1",
        VERCEL: "",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  child.stdout.on("data", (v) => {
    output += v.toString();
  });
  child.stderr.on("data", (v) => {
    output += v.toString();
  });
  for (let i = 0; i < 120 && !output.includes("Ready in"); i++) {
    if (child.exitCode !== null)
      throw new Error("Test server exited before startup");
    await delay(500);
  }
  assert.ok(output.includes("Ready in"), "test server should become ready");
  const guest = new Browser();
  await step("protected routes reject guests before rendering", async () => {
    for (const route of [
      "/dashboard",
      "/dashboard/posts/create",
      "/admin",
      "/admin/users",
    ]) {
      const result = await guest.request(route);
      assert.equal(result.status, 307);
      assert.equal(new URL(result.location, base).pathname, "/sign-in");
      assert.ok(!result.text.includes("Welcome back"));
    }
  });
  await step("weak direct signup is rejected", async () => {
    assert.equal(
      (
        await guest.request(api("/sign-up/email"), {
          name: "Test Account",
          email: "weak@example.test",
          password: "abcdefgh",
        })
      ).status,
      400,
    );
  });
  await clearLimits();
  await step(
    "signup rejects invalid profile fields before creating users",
    async () => {
      for (const [field, value] of [
        ["website", "javascript:alert(1)"],
        ["bio", "x".repeat(301)],
        ["username", "invalid handle"],
      ]) {
        await clearLimits();
        const email = `invalid-${field}@example.test`;
        const result = await guest.request(api("/sign-up/email"), {
          name: "Test Account",
          email,
          password,
          [field]: value,
        });
        assert.equal(result.status, 400, `invalid ${field} must be rejected`);
        assert.equal(
          (await pool.query('SELECT id FROM "user" WHERE email=$1', [email]))
            .rowCount,
          0,
        );
      }
    },
  );
  await step("early login throttling", async () => {
    await clearLimits();
    let last;
    for (let i = 0; i < 6; i++)
      last = await guest.request(api("/sign-in/email"), {
        email: "unknown@example.test",
        password,
      });
    if (last.status !== 429) {
      const rows = await pool.query(
        "SELECT action,count,(expires_at < now()) AS expired FROM rate_limits",
      );
      console.log("Rate diagnostic:", JSON.stringify(rows.rows));
    }
    assert.equal(last.status, 429);
    await clearLimits();
  });
  let alice, bob, admin;
  await step("flat registration creates an active user session", async () => {
    const email = "alice@example.test";
    alice = new Browser();
    const result = await alice.request(api("/sign-up/email"), {
      name: "Alice Test",
      email,
      password,
    });
    assert.equal(
      result.status,
      200,
      `registration failed: ${result.data?.code || result.status}`,
    );
    assert.ok(result.data.token);
    assert.ok(
      result.headers
        .getSetCookie()
        .some((c) => /httponly/i.test(c) && /samesite=lax/i.test(c)),
    );
    assert.equal((await alice.request("/dashboard")).status, 200);
    const user = await pool.query(
      'SELECT role,email_verified FROM "user" WHERE email=$1',
      [email],
    );
    assert.equal(user.rows[0].role, "user");
    assert.equal(user.rows[0].email_verified, false);
  });
  await step("user cannot access admin API or admin routes", async () => {
    assert.equal((await alice.request(api("/admin/list-users"))).status, 403);
    const result = await alice.request("/admin/users");
    assert.equal(result.status, 307);
    assert.equal(new URL(result.location, base).pathname, "/dashboard");
  });
  await clearLimits();
  bob = await signup("bob@example.test");
  await signin(bob, "bob@example.test");
  admin = await signup("admin@example.test");
  await step(
    "first-admin bootstrap is controlled and repeat-safe",
    async () => {
      const run = spawn(
        process.execPath,
        [
          "--experimental-strip-types",
          "scripts/bootstrap-admin.mjs",
          "--email",
          "admin@example.test",
        ],
        {
          env: { ...process.env, DATABASE_URL: scoped.toString() },
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      run.stdout.resume();
      run.stderr.resume();
      assert.equal((await once(run, "exit"))[0], 0);
      const again = spawn(
        process.execPath,
        [
          "--experimental-strip-types",
          "scripts/bootstrap-admin.mjs",
          "--email",
          "bob@example.test",
        ],
        {
          env: { ...process.env, DATABASE_URL: scoped.toString() },
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      again.stdout.resume();
      again.stderr.resume();
      assert.equal((await once(again, "exit"))[0], 1);
    },
  );
  await clearLimits();
  await signin(admin, "admin@example.test");
  await step("admin route, self-protection, and invalid roles", async () => {
    const result = await admin.request("/dashboard");
    assert.equal(result.status, 307);
    assert.equal(new URL(result.location, base).pathname, "/admin");
    const {
      rows: [self],
    } = await pool.query('SELECT id FROM "user" WHERE email=$1', [
      "admin@example.test",
    ]);
    assert.equal(
      (
        await admin.request(api("/admin/set-role"), {
          userId: self.id,
          role: "user",
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await admin.request(api("/admin/set-role"), {
          userId: self.id,
          role: "admn",
        })
      ).status,
      400,
    );
  });
  await step("admin updates obey the same account validation", async () => {
    const {
      rows: [target],
    } = await pool.query('SELECT id FROM "user" WHERE email=$1', [
      "alice@example.test",
    ]);
    for (const data of [
      { website: "javascript:alert(1)" },
      { bio: "x".repeat(301) },
      { role: "admn" },
    ]) {
      assert.equal(
        (
          await admin.request(api("/admin/update-user"), {
            userId: target.id,
            data,
          })
        ).status,
        400,
      );
    }
    const {
      rows: [unchanged],
    } = await pool.query('SELECT role, website, bio FROM "user" WHERE id=$1', [
      target.id,
    ]);
    assert.equal(unchanged.role, "user");
    assert.equal(unchanged.website, "");
    assert.equal(unchanged.bio, "");
  });
  await step(
    "public contact form persists valid messages and rejects bad input",
    async () => {
      await clearLimits();
      await guest.request("/contact");
      const valid = {
        name: "  Ada Contact  ",
        email: "  ADA@EXAMPLE.TEST  ",
        subject: "  Real inbox enquiry  ",
        message: "  I am writing about a post on this site.  ",
        contact_extra_reference: "",
      };
      let result = await action(guest, "/contact", "createContactAction", [
        valid,
      ]);
      assert.ok(result.text.includes('"success":true'));
      const {
        rows: [saved],
      } = await pool.query(
        "SELECT public_id,name,email,subject,message,is_read FROM contacts WHERE subject='Real inbox enquiry'",
      );
      assert.equal(saved.name, "Ada Contact");
      assert.equal(saved.email, "ada@example.test");
      assert.equal(saved.is_read, false);
      assert.ok(saved.message.includes("writing about a post"));
      result = await action(guest, "/contact", "createContactAction", [
        { ...valid, subject: "Invalid", message: "short" },
      ]);
      assert.ok(result.text.includes('"success":false'));
      result = await action(guest, "/contact", "createContactAction", [
        { ...valid, subject: "Bot enquiry", contact_extra_reference: "filled" },
      ]);
      assert.ok(result.text.includes('"success":true'));
      assert.equal((await pool.query("SELECT id FROM contacts")).rowCount, 1);
      result = await action(guest, "/contact", "createContactAction", [valid]);
      assert.ok(result.text.includes("Too many requests"));
    },
  );
  await step(
    "admin inbox reads persisted messages and protects status changes",
    async () => {
      const {
        rows: [saved],
      } = await pool.query(
        "SELECT public_id FROM contacts WHERE subject='Real inbox enquiry'",
      );
      const page = await admin.request("/admin/contacts");
      assert.equal(page.status, 200);
      assert.ok(page.text.includes("Real inbox enquiry"));
      assert.ok(!page.text.includes("Replied"));
      assert.equal((await alice.request("/admin/contacts")).status, 307);
      let result = await action(
        alice,
        "/admin/contacts",
        "setContactReadAction",
        [saved.public_id, true],
      );
      assert.equal(result.status, 307);
      result = await action(admin, "/admin/contacts", "setContactReadAction", [
        saved.public_id,
        true,
      ]);
      assert.ok(result.text.includes('"success":true'));
      assert.equal(
        (
          await pool.query("SELECT is_read FROM contacts WHERE public_id=$1", [
            saved.public_id,
          ])
        ).rows[0].is_read,
        true,
      );
      result = await action(admin, "/admin/contacts", "setContactReadAction", [
        saved.public_id,
        false,
      ]);
      assert.ok(result.text.includes('"success":true'));
      assert.equal(
        (
          await pool.query("SELECT is_read FROM contacts WHERE public_id=$1", [
            saved.public_id,
          ])
        ).rows[0].is_read,
        false,
      );
      result = await action(admin, "/admin/contacts", "setContactReadAction", [
        "invalid",
        true,
      ]);
      assert.ok(result.text.includes("Invalid message"));
    },
  );
  let managedCategory;
  await step(
    "category creation rejects regular users and validates input",
    async () => {
      await admin.request("/admin/categories/create");
      const denied = await action(
        alice,
        "/admin/categories/create",
        "createCategoryAction",
        [{ name: "Unauthorized Topic" }],
      );
      assert.equal(denied.status, 307);
      assert.equal(
        (
          await pool.query(
            "SELECT id FROM categories WHERE name='Unauthorized Topic'",
          )
        ).rowCount,
        0,
      );
      const invalid = await action(
        admin,
        "/admin/categories/create",
        "createCategoryAction",
        [{ name: "!!!" }],
      );
      assert.ok(invalid.text.includes('"success":false'));
      const created = await action(
        admin,
        "/admin/categories/create",
        "createCategoryAction",
        [
          {
            name: " Module Topic ",
            description: "Initial topic",
            slug: "client-controlled",
          },
        ],
      );
      assert.ok(created.text.includes('"success":true'));
      const {
        rows: [row],
      } = await pool.query(
        "SELECT public_id,slug FROM categories WHERE name='Module Topic'",
      );
      managedCategory = row;
      assert.equal(row.slug, "module-topic");
      assert.ok(
        (await guest.request(`/categories/${row.slug}`)).text.includes(
          "Module Topic",
        ),
      );
    },
  );
  await step(
    "category edits retain URLs and invalidate public caches",
    async () => {
      const route = `/admin/categories/${managedCategory.public_id}/edit`;
      assert.equal((await admin.request(route)).status, 200);
      const result = await action(admin, route, "updateCategoryAction", [
        managedCategory.public_id,
        {
          name: "Renamed Topic",
          description: "Updated description",
          slug: "replacement-slug",
        },
      ]);
      assert.ok(result.text.includes('"success":true'));
      const {
        rows: [row],
      } = await pool.query(
        "SELECT name,slug,description FROM categories WHERE public_id=$1",
        [managedCategory.public_id],
      );
      assert.equal(row.slug, "module-topic");
      assert.equal(row.name, "Renamed Topic");
      assert.equal(row.description, "Updated description");
      const page = await guest.request(`/categories/${row.slug}`);
      assert.ok(page.text.includes("Renamed Topic"));
      assert.ok(page.text.includes("Updated description"));
    },
  );
  await step(
    "category names remain unique ignoring case after renaming",
    async () => {
      const result = await action(
        admin,
        "/admin/categories/create",
        "createCategoryAction",
        [{ name: "RENAMED TOPIC" }],
      );
      assert.ok(result.text.includes("already exists"));
      assert.equal(
        (
          await pool.query(
            "SELECT id FROM categories WHERE lower(name)='renamed topic'",
          )
        ).rowCount,
        1,
      );
    },
  );
  await step(
    "category deletion protects draft and published posts",
    async () => {
      const {
        rows: [owner],
      } = await pool.query('SELECT id FROM "user" WHERE email=$1', [
        "alice@example.test",
      ]);
      const {
        rows: [post],
      } = await pool.query(
        "INSERT INTO posts(title,slug,content,author_id,category_id,status) VALUES('Category draft','category-draft','[]',$1,$2,'Draft') RETURNING id",
        [owner.id, managedCategory.public_id],
      );
      await admin.request("/admin/categories");
      let result = await action(
        admin,
        "/admin/categories",
        "deleteCategoryAction",
        [managedCategory.public_id],
      );
      assert.ok(result.text.includes("assigned posts"));
      await admin.request("/admin/posts/create");
      result = await action(admin, "/admin/posts/create", "savePostAction", [
        {
          id: post.id,
          title: "Category published story",
          categoryId: managedCategory.public_id,
          status: "Published",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Published category content" }],
            },
          ],
        },
      ]);
      assert.ok(result.text.includes('"success":true'));
      const directory = await guest.request("/categories");
      assert.ok(directory.text.includes("1 post"));
      const page = await guest.request(`/categories/${managedCategory.slug}`);
      assert.ok(page.text.includes("Category published story"));
      result = await action(
        admin,
        "/admin/categories",
        "deleteCategoryAction",
        [managedCategory.public_id],
      );
      assert.ok(result.text.includes("assigned posts"));
      await admin.request("/admin/posts");
      result = await action(admin, "/admin/posts", "deletePostAction", [
        post.id,
      ]);
      assert.ok(result.text.includes('"success":true'));
    },
  );
  await step("empty category deletion and stale IDs fail safely", async () => {
    const result = await action(
      admin,
      "/admin/categories",
      "deleteCategoryAction",
      [managedCategory.public_id],
    );
    assert.ok(result.text.includes('"success":true'));
    assert.equal(
      (
        await pool.query("SELECT id FROM categories WHERE public_id=$1", [
          managedCategory.public_id,
        ])
      ).rowCount,
      0,
    );
    assert.ok(
      !(
        await guest.request(`/categories/${managedCategory.slug}`)
      ).text.includes("Renamed Topic"),
    );
    const stale = await action(
      admin,
      "/admin/categories",
      "deleteCategoryAction",
      [managedCategory.public_id],
    );
    assert.ok(stale.text.includes("Category not found"));
    const invalid = await action(
      admin,
      "/admin/categories",
      "deleteCategoryAction",
      ["not-a-uuid"],
    );
    assert.ok(invalid.text.includes("Invalid category"));
  });
  await step("profile updates cannot elevate role", async () => {
    assert.equal(
      (
        await alice.request(api("/update-user"), {
          name: "Alice Updated",
          role: "admin",
          emailVerified: true,
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await alice.request(api("/update-user"), {
          name: "Alice Updated",
          bio: "New bio",
        })
      ).status,
      200,
    );
    const {
      rows: [user],
    } = await pool.query('SELECT name,bio,role FROM "user" WHERE email=$1', [
      "alice@example.test",
    ]);
    assert.equal(user.name, "Alice Updated");
    assert.equal(user.bio, "New bio");
    assert.equal(user.role, "user");
  });
  await step(
    "admin user creation and role changes through server actions",
    async () => {
      await clearLimits();
      await admin.request("/admin/users/create");
      const created = await action(
        admin,
        "/admin/users/create",
        "createUserAction",
        [
          {
            name: "Invited Account",
            email: "invited@example.test",
            password,
            role: "user",
          },
        ],
      );
      assert.ok(
        created.text.includes('"success":true'),
        "admin creation action should succeed",
      );
      const {
        rows: [invited],
      } = await pool.query(
        'SELECT id,email_verified FROM "user" WHERE email=$1',
        ["invited@example.test"],
      );
      assert.equal(invited.email_verified, false);
      const invitedBrowser = new Browser();
      await signin(invitedBrowser, "invited@example.test");
      await admin.request("/admin/users");
      const promoted = await action(admin, "/admin/users", "manageUserAction", [
        invited.id,
        "role",
        "admin",
      ]);
      assert.ok(promoted.text.includes('"success":true'));
      const {
        rows: [changed],
      } = await pool.query('SELECT role FROM "user" WHERE id=$1', [invited.id]);
      assert.equal(changed.role, "admin");
    },
  );
  await step(
    "admin user pages search, filter, and clamp out-of-range pages",
    async () => {
      await pool.query(`
      INSERT INTO "user" (id, name, email, email_verified, role, banned)
      SELECT 'list-fixture-' || n, 'List member ' || n,
        'list-member-' || n || '@example.test', true,
        CASE WHEN n % 2 = 0 THEN 'admin' ELSE 'user' END,
        n % 3 = 0
      FROM generate_series(1, 27) AS n
    `);
      const first = await admin.request("/admin/users?page=1");
      assert.equal(first.status, 200);
    assert.ok(first.text.replace(/<!--.*?-->/gs, "").includes("Page 1 of 2"));
      const second = await admin.request("/admin/users?page=2");
      assert.equal(second.status, 200);
    assert.ok(second.text.replace(/<!--.*?-->/gs, "").includes("Page 2 of 2"));
      const clamped = await admin.request("/admin/users?page=99999");
    assert.ok(clamped.text.replace(/<!--.*?-->/gs, "").includes("Page 2 of 2"));
      assert.ok(!clamped.text.includes("No accounts match these filters"));
      const filtered = await admin.request(
        "/admin/users?q=List%20member%2024&role=admin&status=suspended",
      );
      assert.ok(filtered.text.includes("List member 24"));
      assert.ok(!filtered.text.includes("List member 25"));
      const literal = await admin.request("/admin/users?q=%25");
      assert.ok(literal.text.includes("No accounts match these filters"));
    },
  );
  await step(
    "user management actions enforce admin and self boundaries",
    async () => {
      const {
        rows: [self],
      } = await pool.query('SELECT id FROM "user" WHERE email=$1', [
        "admin@example.test",
      ]);
      const denied = await action(alice, "/admin/users", "manageUserAction", [
        "list-fixture-1",
        "role",
        "admin",
      ]);
      assert.equal(denied.status, 307);
      for (const args of [
        [self.id, "role", "user"],
        [self.id, "ban"],
        [self.id, "revoke"],
      ]) {
        const result = await action(
          admin,
          "/admin/users",
          "manageUserAction",
          args,
        );
        assert.ok(result.text.includes('"success":false'));
      }
      const {
        rows: [unchanged],
      } = await pool.query('SELECT role,banned FROM "user" WHERE id=$1', [
        self.id,
      ]);
      assert.equal(unchanged.role, "admin");
      assert.equal(unchanged.banned, false);
      const target = "list-fixture-1";
      let result = await action(admin, "/admin/users", "manageUserAction", [
        target,
        "role",
        "admin",
      ]);
      assert.ok(result.text.includes('"success":true'));
      assert.equal(
        (await pool.query('SELECT role FROM "user" WHERE id=$1', [target]))
          .rows[0].role,
        "admin",
      );
      result = await action(admin, "/admin/users", "manageUserAction", [
        target,
        "ban",
      ]);
      assert.ok(result.text.includes('"success":true'));
      assert.equal(
        (await pool.query('SELECT banned FROM "user" WHERE id=$1', [target]))
          .rows[0].banned,
        true,
      );
      result = await action(admin, "/admin/users", "manageUserAction", [
        target,
        "unban",
      ]);
      assert.ok(result.text.includes('"success":true'));
      assert.equal(
        (await pool.query('SELECT banned FROM "user" WHERE id=$1', [target]))
          .rows[0].banned,
        false,
      );
    },
  );
  await step(
    "session lists hide tokens and users cannot revoke other accounts",
    async () => {
      const page = await alice.request("/dashboard/profile");
      const {
        rows: [other],
      } = await pool.query(
        'SELECT id,token FROM session WHERE user_id=(SELECT id FROM "user" WHERE email=$1) LIMIT 1',
        ["bob@example.test"],
      );
      assert.ok(other);
      assert.ok(
        !page.text.includes(other.token),
        "session tokens must not be serialized into the settings page",
      );
      const result = await action(
        alice,
        "/dashboard/profile",
        "revokeSessionAction",
        [other.id, false],
      );
      assert.ok(result.text.includes("Session not found"));
      assert.equal(
        (await pool.query("SELECT id FROM session WHERE id=$1", [other.id]))
          .rowCount,
        1,
      );
    },
  );
  await step("active sessions can be revoked without ending the current session", async () => {
    await clearLimits();
    const other = new Browser();
    await signin(other, "alice@example.test");
    const otherSession = (await other.request(api("/get-session"))).data.session;
    const page = await alice.request("/dashboard/profile");
    assert.equal(page.status, 200);
    assert.ok(page.text.includes(otherSession.id));
    const result = await action(alice, "/dashboard/profile", "revokeOtherSessionsAction", []);
    assert.ok(result.text.includes('"success":true'));
    assert.equal((await other.request(api("/get-session"))).data, null);
    assert.ok((await alice.request(api("/get-session"))).data);
  });
  await step("expired sessions are hidden and removed by cleanup", async () => {
    await clearLimits();
    const other = new Browser();
    await signin(other, "alice@example.test");
    const sessionId = (await other.request(api("/get-session"))).data.session.id;
    await pool.query("UPDATE session SET expires_at=timezone('UTC', statement_timestamp()) - interval '1 minute' WHERE id=$1", [sessionId]);
    const page = await alice.request("/dashboard/profile");
    assert.equal(page.status, 200);
    assert.ok(!page.text.includes(sessionId));
    assert.equal((await other.request(api("/get-session"))).data, null);
    assert.equal((await guest.request("/api/cron/cleanup")).status, 401);
    const result = await guest.request("/api/cron/cleanup", undefined, { headers: { Authorization: `Bearer ${cronSecret}` } });
    assert.equal(result.status, 200);
    assert.equal((await pool.query("SELECT id FROM session WHERE id=$1", [sessionId])).rowCount, 0);
  });
  await step(
    "password change requires current password and revokes other sessions",
    async () => {
      const other = new Browser();
      await clearLimits();
      await signin(other, "bob@example.test");
      assert.equal(
        (
          await bob.request(api("/change-password"), {
            currentPassword: "WrongPassword1!",
            newPassword: "ChangedPass1!",
            revokeOtherSessions: true,
          })
        ).status,
        400,
      );
      assert.equal(
        (
          await bob.request(api("/change-password"), {
            currentPassword: password,
            newPassword: "ChangedPass1!",
            revokeOtherSessions: true,
          })
        ).status,
        200,
      );
      assert.equal((await other.request(api("/get-session"))).data, null);
    },
  );
  await step(
    "reset tokens expire, work once, and revoke sessions",
    async () => {
      await clearLimits();
      assert.equal(
        (
          await guest.request(api("/request-password-reset"), {
            email: "bob@example.test",
            redirectTo: "/reset-password",
          })
        ).status,
        200,
      );
      const url = new URL(await mail("reset-password", "bob@example.test"));
      const token = url.pathname.split("/").pop();
      assert.equal(
        (
          await guest.request(api("/reset-password"), {
            token,
            newPassword: "ResetPassword1!",
          })
        ).status,
        200,
      );
      assert.equal(
        (
          await guest.request(api("/reset-password"), {
            token,
            newPassword: "ResetPassword2!",
          })
        ).status,
        400,
      );
      assert.equal((await bob.request(api("/get-session"))).data, null);
      assert.equal(
        (
          await guest.request(api("/request-password-reset"), {
            email: "bob@example.test",
            redirectTo: "/reset-password",
          })
        ).status,
        200,
      );
      const expired = new URL(
        await mail("reset-password", "bob@example.test"),
      ).pathname
        .split("/")
        .pop();
      await pool.query(
        "UPDATE verification SET expires_at=now()-interval '1 minute' WHERE identifier=$1",
        [`reset-password:${expired}`],
      );
      assert.equal(
        (
          await guest.request(api("/reset-password"), {
            token: expired,
            newPassword: "ResetPassword2!",
          })
        ).status,
        400,
      );
      await clearLimits();
      await signin(bob, "bob@example.test", "ResetPassword1!");
    },
  );
  await step(
    "unverified accounts verify the new address when changing email",
    async () => {
      await clearLimits();
      assert.equal(
        (
          await bob.request(api("/change-email"), {
            newEmail: "bob-new@example.test",
            callbackURL: "/redirect",
          })
        ).status,
        200,
      );
      const before = await pool.query(
        'SELECT email FROM "user" WHERE email=$1',
        ["bob@example.test"],
      );
      assert.equal(before.rowCount, 1);
      await bob.request(await mail("verify-email", "bob-new@example.test"));
      const after = await pool.query(
        'SELECT email_verified FROM "user" WHERE email=$1',
        ["bob-new@example.test"],
      );
      assert.equal(after.rowCount, 1);
      assert.equal(after.rows[0].email_verified, true);
    },
  );
  await step(
    "post ownership enforced through real server actions",
    async () => {
      const {
        rows: [category],
      } = await pool.query(
        "INSERT INTO categories(name,slug) VALUES('E2E','e2e') RETURNING public_id",
      );
      await alice.request("/dashboard/posts/create");
      let result = await action(
        alice,
        "/dashboard/posts/create",
        "savePostAction",
        [
          {
            title: "Alice private draft",
            categoryId: category.public_id,
            status: "Draft",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Private draft content" }],
              },
            ],
          },
        ],
      );
      assert.ok(
        result.text.includes('"success":true'),
        "owner should save a post",
      );
      const {
        rows: [post],
      } = await pool.query("SELECT id,slug FROM posts");
      assert.ok(post);
      assert.ok(
        !(await guest.request(`/blog/${post.slug}`)).text.includes(
          "Private draft content",
        ),
        "draft must not be public",
      );
      await bob.request("/dashboard/posts/create");
      result = await action(bob, "/dashboard/posts/create", "savePostAction", [
        {
          id: post.id,
          title: "Stolen post",
          categoryId: category.public_id,
          status: "Published",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Unauthorized edit" }],
            },
          ],
        },
      ]);
      assert.ok(
        result.text.includes("access denied"),
        "another author must not edit",
      );
      await bob.request("/dashboard/posts");
      result = await action(bob, "/dashboard/posts", "deletePostAction", [
        post.id,
      ]);
      assert.ok(
        result.text.includes("access denied"),
        "another author must not delete",
      );
      result = await action(
        alice,
        "/dashboard/posts/create",
        "savePostAction",
        [
          {
            id: post.id,
            title: "Alice published post",
            categoryId: category.public_id,
            status: "Published",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Published content" }],
              },
            ],
          },
        ],
      );
      assert.ok(result.text.includes('"success":true'));
      assert.equal((await guest.request(`/blog/${post.slug}`)).status, 200);
    },
  );
  await step(
    "post publishing rejects empty content and preserves author ownership",
    async () => {
      const {
        rows: [category],
      } = await pool.query("SELECT public_id FROM categories WHERE slug='e2e'");
      const {
        rows: [bobUser],
      } = await pool.query('SELECT id FROM "user" WHERE email=$1', [
        "bob-new@example.test",
      ]);
      const invalid = await action(
        alice,
        "/dashboard/posts/create",
        "savePostAction",
        [
          {
            title: "Empty publication",
            categoryId: category.public_id,
            status: "Published",
            content: [{ type: "paragraph" }],
          },
        ],
      );
      assert.ok(invalid.text.includes("Add article text"));
      const badLink = await action(
        alice,
        "/dashboard/posts/create",
        "savePostAction",
        [
          {
            title: "Unsafe publication",
            categoryId: category.public_id,
            status: "Draft",
            content: [
              {
                type: "paragraph",
                content: [
                  { type: "link", href: "javascript:alert(1)", content: [] },
                ],
              },
            ],
          },
        ],
      );
      assert.ok(badLink.text.includes('"success":false'));
      const created = await action(
        alice,
        "/dashboard/posts/create",
        "savePostAction",
        [
          {
            title: "Ownership fixture",
            authorId: bobUser.id,
            categoryId: category.public_id,
            status: "Draft",
            content: [{ type: "paragraph" }],
          },
        ],
      );
      assert.ok(created.text.includes('"success":true'));
      const {
        rows: [fixture],
      } = await pool.query(
        "SELECT id,author_id FROM posts WHERE title='Ownership fixture'",
      );
      assert.notEqual(
        fixture.author_id,
        bobUser.id,
        "regular users cannot assign another author",
      );
      await admin.request("/admin/posts/create");
      const saved = await action(
        admin,
        "/admin/posts/create",
        "savePostAction",
        [
          {
            id: fixture.id,
            title: "Admin edited fixture",
            categoryId: category.public_id,
            status: "Draft",
            authorId: "",
            content: [{ type: "paragraph" }],
          },
        ],
      );
      assert.ok(saved.text.includes('"success":true'));
      const {
        rows: [after],
      } = await pool.query("SELECT author_id FROM posts WHERE id=$1", [
        fixture.id,
      ]);
      assert.equal(
        after.author_id,
        fixture.author_id,
        "omitted admin author must preserve ownership",
      );
      const deleted = await action(
        alice,
        "/dashboard/posts",
        "deletePostAction",
        [fixture.id],
      );
      assert.ok(deleted.text.includes('"success":true'));
    },
  );
  await step("home feed uses a stable ten-post cursor", async () => {
    const { rows: [author] } = await pool.query('SELECT id FROM "user" WHERE email=$1', ["alice@example.test"]);
    const { rows: [category] } = await pool.query("SELECT public_id FROM categories WHERE slug='e2e'");
    await pool.query(`INSERT INTO posts(title,slug,content,author_id,category_id,status,published_at,updated_at)
      SELECT 'Cursor story ' || n, 'cursor-story-' || n,
        '[{"type":"paragraph","content":[{"type":"text","text":"Cursor fixture"}]}]'::jsonb,
        $1,$2,'Published',timezone('UTC',statement_timestamp()),timezone('UTC',statement_timestamp())
      FROM generate_series(1,12) AS n`, [author.id, category.public_id]);
    let cursor;
    const seen = new Set();
    let pages = 0;
    do {
      const response = await guest.request(`/api/posts${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`);
      assert.equal(response.status, 200);
      assert.ok(response.data.items.length <= 10);
      if (pages === 0) assert.equal(response.data.items.length, 10);
      for (const post of response.data.items) {
        assert.ok(!seen.has(post.id));
        seen.add(post.id);
      }
      cursor = response.data.nextCursor;
      pages++;
      assert.ok(pages < 5);
    } while (cursor);
    assert.equal(seen.size, 13);
    assert.equal((await guest.request("/api/posts?cursor=invalid")).status, 400);
  });
  await step("public feeds and metadata use published records", async () => {
    const { rows: [post] } = await pool.query("SELECT slug FROM posts WHERE title='Alice published post'");
    const home = await guest.request("/");
    const categories = await guest.request("/categories");
    const category = await guest.request("/categories/e2e");
    const article = await guest.request(`/blog/${post.slug}`);
    assert.equal(home.status, 200);
    assert.ok(home.text.includes("Cursor story"));
    assert.ok(!home.text.includes("Understanding Next.js 16"));
    assert.equal(categories.status, 200);
    assert.ok(categories.text.includes("E2E"));
    assert.equal(category.status, 200);
    assert.ok(category.text.includes("Alice published post"));
    assert.equal(article.status, 200);
    assert.ok(article.text.includes("Alice published post | NaroBlog"));
    assert.ok(article.text.includes(`rel="canonical"`));
    const missing = await guest.request("/categories/not-a-category");
    assert.ok(missing.text.includes("Page not found"));
    assert.ok(missing.text.includes("noindex"));
  });
  await step("dashboard activity is backed by account and post records", async () => {
    const own = await alice.request("/dashboard/activity");
    const all = await admin.request("/admin/activities");
    assert.equal(own.status, 200);
    assert.ok(own.text.includes("Alice published post"));
    assert.ok(own.text.includes("Account created"));
    assert.ok(!own.text.includes("Amara Okafor"));
    assert.equal(all.status, 200);
    assert.ok(all.text.includes("Alice published post"));
    assert.ok(all.text.includes("Session started"));
    assert.equal((await guest.request("/admin/activities")).status, 307);
  });
  await step(
    "publishing, unpublishing, and deletion refresh public articles",
    async () => {
      const {
        rows: [post],
      } = await pool.query(
        "SELECT id,slug,author_id,category_id,published_at FROM posts WHERE title='Alice published post'",
      );
      assert.ok(post.published_at, "publishing must assign a date");
      const input = {
        id: post.id,
        title: "Renamed article",
        categoryId: post.category_id,
        status: "Published",
        content: [
          {
            type: "heading",
            props: { level: 1 },
            content: [{ type: "text", text: "Article section" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Formatted article",
                styles: { bold: true },
              },
            ],
          },
        ],
      };
      let result = await action(
        alice,
        "/dashboard/posts/create",
        "savePostAction",
        [input],
      );
      assert.ok(result.text.includes('"success":true'));
      const {
        rows: [renamed],
      } = await pool.query("SELECT slug,published_at FROM posts WHERE id=$1", [
        post.id,
      ]);
      assert.equal(renamed.slug, post.slug);
      assert.equal(
        renamed.published_at.toISOString(),
        post.published_at.toISOString(),
      );
      let page = await guest.request(`/blog/${post.slug}`);
      assert.ok(page.text.includes("<strong>Formatted article</strong>"));
      assert.ok(page.text.includes("Article section"));
      result = await action(
        alice,
        "/dashboard/posts/create",
        "savePostAction",
        [{ ...input, status: "Draft" }],
      );
      assert.ok(result.text.includes('"success":true'));
      assert.ok(
        !(await guest.request(`/blog/${post.slug}`)).text.includes(
          "Formatted article",
        ),
      );
      assert.ok(!(await guest.request("/")).text.includes("Renamed article"));
      result = await action(
        alice,
        "/dashboard/posts/create",
        "savePostAction",
        [input],
      );
      assert.ok(result.text.includes('"success":true'));
      assert.ok(
        (await guest.request(`/blog/${post.slug}`)).text.includes(
          "Formatted article",
        ),
      );
      result = await action(alice, "/dashboard/posts", "deletePostAction", [
        post.id,
      ]);
      assert.ok(result.text.includes('"success":true'));
      assert.ok(
        !(await guest.request(`/blog/${post.slug}`)).text.includes(
          "Formatted article",
        ),
      );
      assert.equal(
        (await pool.query("SELECT id FROM posts WHERE id=$1", [post.id]))
          .rowCount,
        0,
      );
    },
  );
  await step("suspension and restoration revoke access", async () => {
    const {
      rows: [user],
    } = await pool.query('SELECT id FROM "user" WHERE email=$1', [
      "alice@example.test",
    ]);
    assert.equal(
      (
        await admin.request(api("/admin/ban-user"), {
          userId: user.id,
          banReason: "E2E",
        })
      ).status,
      200,
    );
    assert.equal((await alice.request("/dashboard")).status, 307);
    assert.equal(
      (await admin.request(api("/admin/unban-user"), { userId: user.id }))
        .status,
      200,
    );
  });
  await step("login throttling and origin protection", async () => {
    await clearLimits();
    let last;
    for (let i = 0; i < 6; i++)
      last = await guest.request(api("/sign-in/email"), {
        email: "unknown@example.test",
        password,
      });
    if (last.status !== 429) {
      const rows = await pool.query(
        "SELECT action,count,(expires_at < now()) AS expired FROM rate_limits",
      );
      console.log("Rate diagnostic:", JSON.stringify(rows.rows));
    }
    assert.equal(last.status, 429);
    await clearLimits();
    assert.equal(
      (
        await guest.request(
          api("/sign-in/email"),
          { email: "alice@example.test", password },
          { headers: { Origin: "https://untrusted.example" } },
        )
      ).status,
      403,
    );
  });
  await step(
    "protected account screens render without prerender errors",
    async () => {
      for (const route of [
        "/admin/dashboard",
        "/admin/settings",
        "/admin/session",
      ]) {
        const response = await admin.request(route);
        assert.equal(response.status, 200, `${route} should render`);
      }
      assert.ok(
        !output.includes("Error: Route"),
        "Next.js must not report prerender/navigation errors",
      );
    },
  );
  await step("logout invalidates the session", async () => {
    await clearLimits();
    await signin(alice, "alice@example.test");
    assert.equal((await alice.request(api("/sign-out"), {})).status, 200);
    assert.equal((await alice.request(api("/get-session"))).data, null);
    assert.equal((await alice.request("/dashboard")).status, 307);
  });
  if (process.env.AUTH_E2E_BROWSER_REVIEW === "1") {
    console.log(`Browser review server: ${base}`);
    await delay(180000);
  }
} catch (error) {
  console.error(`FAIL after ${passed.length} checks: ${error.message}`);
  // Only print diagnostic error summaries, never dev delivery URLs or cookies.
  const errors = output
    .split("\n")
    .filter(
      (line) =>
        /Error:|error TS|Module not found/.test(line) &&
        !line.includes("token"),
    )
    .slice(-8);
  if (errors.length) console.error(errors.join("\n"));
  process.exitCode = 1;
} finally {
  if (child && child.exitCode === null) {
    child.kill("SIGTERM");
    await Promise.race([once(child, "exit"), delay(10000)]);
  }
  await unlink(".next-auth-e2e.tsconfig.json").catch(() => {});
  if (pool) await pool.end();
  await adminPool
    .query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
    .catch(() => {});
  await adminPool.end();
  console.log(
    `${passed.length} integration checks passed${process.exitCode ? "; run failed" : ""}; isolated schema removed.`,
  );
}
