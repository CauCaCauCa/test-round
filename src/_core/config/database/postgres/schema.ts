import { json } from "drizzle-orm/pg-core";
import { pgTable, serial, varchar, text, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "publisher", "user"]);
export const newsStatusEnum = pgEnum("news_status", ["draft", "published", "archived"]);

// Users Table (Publisher là user với role = "publisher")
export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	password: varchar({ length: 255 }).notNull(),
	fullName: varchar("full_name", { length: 255 }).notNull(),
	role: userRoleEnum().default("user").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	urlWebhook: varchar("url_webhook", { length: 255 }),
	urlWebhookHeaders: json('url_webhook_headers'),
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Categories Table
export const categories: any = pgTable("categories", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull().unique(),
	slug: varchar({ length: 255 }).notNull().unique(),
	icon: varchar({ length: 255 }),
	parentId: integer("parent_id").references(() => categories.id, { onDelete: "set null" }),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// News Table
export const news = pgTable("news", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 500 }).notNull(),
	slug: varchar({ length: 500 }).notNull().unique(),
	shortDescription: text(),
	longDescription: text().notNull(),
	thumbnail: varchar({ length: 500 }),
	authorId: integer("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "restrict" }),
	status: newsStatusEnum().default("draft").notNull(),
	viewCount: integer("view_count").default(0).notNull(),
	publishedAt: timestamp("published_at", { mode: "date" }),
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type News = typeof news.$inferSelect;
export type NewNews = typeof news.$inferInsert;
