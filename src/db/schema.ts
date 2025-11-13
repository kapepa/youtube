import { timestamp, pgTable, uuid, varchar, text, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm"

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerkId").unique().notNull(),
  // name: varchar({ length: 255 }).notNull(),
  name: text("name").notNull(),
  email: varchar({ length: 255 }).unique(),// how to do fidn optional?
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("create_at").defaultNow().notNull(),
  updateAt: timestamp("update_at").defaultNow().notNull(),
}, (t) => [uniqueIndex("clerk_id_idx").on(t.clerkId)]);

export const userRelations = relations(usersTable, ({ many }) => ({
  videos: many(videosTable)
}))

export const categoriesTable = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("create_at").defaultNow().notNull(),
  updateAt: timestamp("update_at").defaultNow().notNull(),
}, (t) => [uniqueIndex("name_idx").on(t.name)]);

export const categoryRelations = relations(usersTable, ({ many }) => ({
  videos: many(videosTable)
}))

export const videosTable = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  categoryId: uuid("category_id").references(() => categoriesTable.id, { onDelete: "set null" }),
  createdAt: timestamp("create_at").defaultNow().notNull(),
  updateAt: timestamp("update_at").defaultNow().notNull(),
});

export const videosRelations = relations(videosTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [videosTable.userId],
    references: [usersTable.id]
  }),
  category: one(categoriesTable, {
    fields: [videosTable.categoryId],
    references: [categoriesTable.id]
  })
}))