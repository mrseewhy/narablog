import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  uniqueIndex,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { sql } from "drizzle-orm";

export const categoriesTable = pgTable(
  "categories",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    publicId: uuid("public_id").defaultRandom().unique().notNull(),
    name: varchar("name", { length: 255 }).unique().notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("categories_name_ci_idx").on(sql`lower(${table.name})`),
  ],
);

export type Category = typeof categoriesTable.$inferSelect;
export type NewCategory = typeof categoriesTable.$inferInsert;

export const contactsTable = pgTable("contacts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  publicId: uuid("public_id").defaultRandom().unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type NewContact = typeof contactsTable.$inferInsert;

export const rateLimitsTable = pgTable(
  "rate_limits",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    count: integer("count").default(0).notNull(),
    action: varchar("action", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("rate_limits_key_idx").on(table.identifier, table.action),
  ],
);

export const postsTable = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    content: jsonb("content").$type<unknown[]>().notNull(),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categoriesTable.publicId),
    status: text("status", { enum: ["Draft", "Published"] })
      .default("Draft")
      .notNull(),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("posts_author_idx").on(table.authorId),
    index("posts_status_idx").on(table.status),
  ],
);
