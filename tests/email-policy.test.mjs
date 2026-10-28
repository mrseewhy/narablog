import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { APIError } from "better-auth/api";
import * as zod from "zod";
import slugify from "slugify";
import * as jsxRuntime from "react/jsx-runtime";
import * as react from "react";
import { renderToStaticMarkup } from "react-dom/server";

function load(file, env, logs = []) {
  const source = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const exports = {};
  runInNewContext(source, {
    exports,
    process: { env },
    URL,
    console: { info: (...args) => logs.push(args.join(" ")) },
    require: (name) => {
      if (name === "better-auth/api") return { APIError };
      if (name === "zod") return zod;
      if (name === "react/jsx-runtime") return jsxRuntime;
      if (name === "react") return react;
      if (name === "next/image")
        return {
          default: (props) =>
            react.createElement("img", { ...props, unoptimized: undefined }),
        };
      if (name === "@/lib/data/validation/post.validate")
        return load("lib/data/validation/post.validate.ts", env);
      if (name === "slugify") return { default: slugify };
      if (name === "./signup.validate")
        return load("lib/data/validation/signup.validate.ts", env);
      if (name === "@/lib/roles") return load("lib/roles.ts", env);
      throw new Error(`Unexpected test import: ${name}`);
    },
  });
  return exports;
}

test("delivery links are logged only for loopback development", async () => {
  const logs = [];
  const email = {
    to: "test@example.test",
    kind: "verify-email",
    url: "http://localhost:3000/verification-test",
  };
  const local = load(
    "lib/email/auth-email.ts",
    { NODE_ENV: "development", BETTER_AUTH_URL: "http://localhost:3000" },
    logs,
  );
  await local.sendAuthEmail(email);
  assert.equal(logs.length, 1);
  for (const env of [
    { NODE_ENV: "production", BETTER_AUTH_URL: "https://app.example.test" },
    {
      NODE_ENV: "development",
      VERCEL: "1",
      BETTER_AUTH_URL: "http://localhost:3000",
    },
    { NODE_ENV: "development", BETTER_AUTH_URL: "https://public.example.test" },
  ]) {
    const blockedLogs = [];
    const deployed = load("lib/email/auth-email.ts", env, blockedLogs);
    await assert.rejects(
      deployed.sendAuthEmail(email),
      (error) => error.statusCode === 503,
    );
    assert.equal(blockedLogs.length, 0);
  }
});

test("production requires a strong secret and an explicit HTTPS origin", () => {
  for (const env of [
    { NODE_ENV: "production" },
    {
      NODE_ENV: "production",
      BETTER_AUTH_SECRET: "short",
      BETTER_AUTH_URL: "https://app.example.test",
    },
    {
      NODE_ENV: "production",
      BETTER_AUTH_SECRET: "x".repeat(32),
      BETTER_AUTH_URL: "http://app.example.test",
    },
  ]) {
    const { authEnvironment } = load("lib/auth-environment.ts", env);
    assert.throws(() => authEnvironment().validate());
  }
  const { authEnvironment } = load("lib/auth-environment.ts", {
    NODE_ENV: "production",
    BETTER_AUTH_SECRET: "x".repeat(32),
    BETTER_AUTH_URL: "https://app.example.test",
  });
  assert.doesNotThrow(() => authEnvironment().validate());
});

test("account write validation normalizes profile fields and rejects invalid roles", () => {
  const { accountWriteSchema } = load(
    "lib/data/validation/account.validate.ts",
    {},
  );
  const parsed = accountWriteSchema.parse({
    name: " Ada ",
    website: " https://example.test ",
    role: "user",
  });
  assert.equal(parsed.name, "Ada");
  assert.equal(parsed.website, "https://example.test");
  for (const input of [
    { website: "javascript:alert(1)" },
    { bio: "x".repeat(301) },
    { role: "Admin" },
    { role: " admin " },
  ]) {
    assert.equal(accountWriteSchema.safeParse(input).success, false);
  }
});

test("password validation preserves the exact password including spaces", () => {
  const { signUpFormSchema } = load(
    "lib/data/validation/signup.validate.ts",
    {},
  );
  const password = " SecurePassword1! ";
  assert.equal(signUpFormSchema.shape.password.parse(password), password);
  for (const invalid of [
    "abcdefgh",
    "ABCDEFGH1!",
    "StrongPassword!",
    "StrongPassword1",
  ]) {
    assert.equal(
      signUpFormSchema.shape.password.safeParse(invalid).success,
      false,
    );
  }
});

test("category inputs are trimmed and must produce a usable URL", () => {
  const { categorySchema, categoryIdSchema, createCategorySlug } = load(
    "lib/data/validation/category.validate.ts",
    {},
  );
  const valid = categorySchema.parse({
    name: "  Web Development  ",
    description: "  Articles  ",
  });
  assert.equal(valid.name, "Web Development");
  assert.equal(valid.description, "Articles");
  assert.equal(createCategorySlug(valid.name), "web-development");
  for (const name of [" ", "!", "!!!", "x".repeat(71)])
    assert.equal(categorySchema.safeParse({ name }).success, false);
  assert.equal(
    categorySchema.safeParse({ name: "Valid", description: "x".repeat(501) })
      .success,
    false,
  );
  assert.equal(categoryIdSchema.safeParse("not-a-uuid").success, false);
});

test("post validation allows empty drafts but rejects empty publishing and malformed blocks", () => {
  const { postSchema, documentText } = load(
    "lib/data/validation/post.validate.ts",
    {},
  );
  const base = {
    title: " My post ",
    categoryId: "123e4567-e89b-42d3-a456-426614174000",
    status: "Draft",
    content: [{ type: "paragraph" }],
  };
  assert.equal(postSchema.parse(base).title, "My post");
  assert.equal(postSchema.safeParse({ ...base, authorId: "" }).success, true);
  assert.equal(
    postSchema.safeParse({ ...base, status: "Published" }).success,
    false,
  );
  for (const content of [
    [{ type: "unknown" }],
    [{ type: "paragraph", content: "bad" }],
    [
      {
        type: "paragraph",
        content: [{ type: "link", href: "javascript:alert(1)", content: [] }],
      },
    ],
    [{ type: "image", props: { url: "data:text/html,bad" } }],
    [
      {
        type: "paragraph",
        content: [{ type: "text", text: "x".repeat(200001) }],
      },
    ],
  ])
    assert.equal(postSchema.safeParse({ ...base, content }).success, false);
  let nested = { type: "paragraph" };
  for (let i = 0; i < 25; i++)
    nested = { type: "paragraph", children: [nested] };
  assert.equal(
    postSchema.safeParse({ ...base, content: [nested] }).success,
    false,
  );
  const table = [
    {
      type: "table",
      content: {
        type: "tableContent",
        rows: [{ cells: [[{ type: "text", text: "Cell text" }]] }],
      },
    },
  ];
  assert.equal(
    postSchema.safeParse({ ...base, status: "Published", content: table })
      .success,
    true,
  );
  assert.ok(documentText(table).includes("Cell text"));
});

test("article URLs reject executable and disguised schemes", () => {
  const { safeContentUrl } = load("lib/data/validation/post.validate.ts", {});
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,hi",
    "//evil.test",
    "/\\evil.test",
    "java\nscript:alert(1)",
  ])
    assert.equal(safeContentUrl(url), false, url);
  for (const url of [
    "https://example.test/path",
    "mailto:a@example.test",
    "/categories/topic",
  ])
    assert.equal(safeContentUrl(url), true, url);
});

test("articles preserve structure and escape user text and unsafe legacy links", () => {
  const { ArticleContent } = load("components/site/article-content.tsx", {});
  const html = renderToStaticMarkup(
    react.createElement(ArticleContent, {
      content: [
        {
          type: "heading",
          props: { level: 1 },
          content: [{ type: "text", text: "Heading" }],
        },
        {
          type: "bulletListItem",
          content: [{ type: "text", text: "First", styles: { bold: true } }],
        },
        { type: "bulletListItem", content: [{ type: "text", text: "Second" }] },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "<script>alert(1)</script>" },
            {
              type: "link",
              href: "javascript:alert(1)",
              content: [{ type: "text", text: "Unsafe" }],
            },
          ],
        },
        { type: "quote", content: [{ type: "text", text: "Quote" }] },
      ],
    }),
  );
  assert.match(html, /<h2/);
  assert.match(html, /<ul/);
  assert.match(html, /<strong>First/);
  assert.match(html, /<blockquote/);
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("javascript:"));
  assert.ok(!html.includes("<script>"));
});

test("contact messages normalize sender details and bound message length", () => {
  const { contactSchema } = load("lib/data/validation/contact.validate.ts", {});
  const valid = contactSchema.parse({
    name: "  Ada Writer  ",
    email: "  ADA@EXAMPLE.TEST  ",
    subject: "  Article enquiry  ",
    message: "  I would like to ask about an article.  ",
  });
  assert.equal(valid.name, "Ada Writer");
  assert.equal(valid.email, "ada@example.test");
  assert.equal(valid.subject, "Article enquiry");
  assert.equal(valid.contact_extra_reference, "");
  for (const input of [
    { ...valid, message: "short" },
    { ...valid, message: "x".repeat(5001) },
    { ...valid, subject: " " },
    { ...valid, email: "not-an-email" },
  ]) {
    assert.equal(contactSchema.safeParse(input).success, false);
  }
});
