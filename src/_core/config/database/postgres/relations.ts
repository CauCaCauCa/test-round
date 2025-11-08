import { relations } from "drizzle-orm/relations";
import {
	users,
	categories,
	news,
} from "./schema";

// User Relations
export const usersRelations = relations(users, ({ many }) => ({
	news: many(news),
}));

// Category Relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
	parent: one(categories, {
		fields: [categories.parentId],
		references: [categories.id],
		relationName: "subcategories",
	}),
	children: many(categories, {
		relationName: "subcategories",
	}),
	news: many(news),
}));

// News Relations
export const newsRelations = relations(news, ({ one }) => ({
	author: one(users, {
		fields: [news.authorId],
		references: [users.id],
	}),
	category: one(categories, {
		fields: [news.categoryId],
		references: [categories.id],
	}),
}));
