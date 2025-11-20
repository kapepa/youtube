import { timestamp, pgTable, uuid, varchar, text, uniqueIndex, integer, pgEnum, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm"
import { createInsertSchema, createUpdateSchema, createSelectSchema } from 'drizzle-zod';

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
  videos: many(videosTable),
  videoViews: many(videoViewsTable),
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

export const videoVisibility = pgEnum("video_visibility", [
  "public",
  "private",
])

export const videosTable = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  muxStatus: text("mux_status"),
  muxAssetId: text("mux_asset_id").unique(),
  muxUploadId: text("mux_upload_id").unique(),
  muxPaybackId: text("mux_payback_id").unique(),
  muxTrackId: text("mux_track_id").unique(),
  muxTrackStatus: text("mux_track_status").unique(),
  thumbnailUrl: text("thumbnail_url"),
  thumbnailKey: text("thumbnail_key"),
  previewUrl: text("preview_url"),
  previewKey: text("preview_key"),
  duration: integer("duration").default(0),
  visbility: videoVisibility("visbility").default("private").notNull(),
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  categoryId: uuid("category_id").references(() => categoriesTable.id, { onDelete: "set null" }),
  createdAt: timestamp("create_at").defaultNow().notNull(),
  updateAt: timestamp("update_at").defaultNow().notNull(),
});

export const videoInsertSchema = createInsertSchema(videosTable);
export const videoUpdateSchema = createUpdateSchema(videosTable);
export const videoSelectSchema = createSelectSchema(videosTable)

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

export const videoViewsTable = pgTable("video_views", {
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  videoId: uuid("video_id").references(() => videosTable.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("create_at").defaultNow().notNull(),
  updateAt: timestamp("update_at").defaultNow().notNull(),
}, (t) => [primaryKey({
  name: "video_views_pk",
  columns: [t.userId, t.videoId],
})]);

export const videoViewRelation = relations(videoViewsTable, ({ one, many }) => ({
  users: one(usersTable, {
    fields: [videoViewsTable.userId],
    references: [usersTable.id],
  }),
  videos: one(videosTable, {
    fields: [videoViewsTable.videoId],
    references: [videosTable.id]
  }),
  views: many(videoViewsTable),
}))

export const videoViewSelectSchema = createSelectSchema(videoViewsTable);
export const videoViewInsertSchema = createInsertSchema(videoViewsTable);
export const videoViewUpdateSchema = createUpdateSchema(videoViewsTable);