import { timestamp, pgTable, uuid, varchar, text, uniqueIndex, integer, pgEnum, primaryKey, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm"
import { createInsertSchema, createUpdateSchema, createSelectSchema } from 'drizzle-zod';

export const reactionsType = pgEnum("reaction_type", ["like", "dislike"]);

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
  videoReactions: many(videoReactionsTable),
  subscriptions: many(subscriptionsTable, {
    relationName: "subscriptions_viewer_id_fkey",
  }),
  subscribers: many(subscriptionsTable, {
    relationName: "subscriptions_creator_id_fkey",
  }),
  comments: many(commentsTable),
  commentsRelations: many(commentReactionsTable),
}))

export const subscriptionsTable = pgTable("subscriptions", {
  viewerId: uuid("viewer_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  creatorId: uuid("creator_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("create_at").defaultNow().notNull(),
  updateAt: timestamp("update_at").defaultNow().notNull(),
}, (t) => [
  primaryKey({
    name: "subscriptions_pk",
    columns: [t.viewerId, t.creatorId]
  })
])

export const subscriptionsRelations = relations(subscriptionsTable, ({ one }) => ({
  viewer: one(usersTable, {
    fields: [subscriptionsTable.viewerId],
    references: [usersTable.id],
    relationName: "subscriptions_viewer_id_fkey",
  }),
  creator: one(usersTable, {
    fields: [subscriptionsTable.creatorId],
    references: [usersTable.id],
    relationName: "subscriptions_creator_id_fkey",
  })
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

export const videosRelations = relations(videosTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [videosTable.userId],
    references: [usersTable.id]
  }),
  category: one(categoriesTable, {
    fields: [videosTable.categoryId],
    references: [categoriesTable.id]
  }),
  views: many(videoViewsTable),
  reactions: many(videoReactionsTable),
  comments: many(commentsTable),
}))

export const commentsTable = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  parentId: uuid("parent_id"),
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  videoId: uuid("video_id").references(() => videosTable.id, { onDelete: "cascade" }).notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("create_at").defaultNow().notNull(),
  updateAt: timestamp("update_at").defaultNow().notNull(),
},
  (t) => [
    foreignKey({
      columns: [t.parentId],
      foreignColumns: [t.id],
      name: "comments_parent_id_fkey"
    }).onDelete("cascade")
  ]
)

export const commentsRelations = relations(commentsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [commentsTable.userId],
    references: [usersTable.id],
  }),
  video: one(videosTable, {
    fields: [commentsTable.userId],
    references: [videosTable.id],
  }),
  parent: one(commentsTable, {
    fields: [commentsTable.parentId],
    references: [commentsTable.id],
    relationName: "comments_parent_id_fkey"
  }),
  relations: many(commentReactionsTable),
  replies: many(commentsTable, {
    relationName: "comments_parent_id_fkey"
  }),
}));

export const commentSelectSchema = createSelectSchema(commentsTable);
export const commentInsertSchema = createInsertSchema(commentsTable);
export const commentUpdateSchema = createUpdateSchema(commentsTable);

export const commentReactionsTable = pgTable("comment_reactions", {
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  commentId: uuid("comment_id").references(() => commentsTable.id, { onDelete: "cascade" }).notNull(),
  type: reactionsType("type").notNull(),
  createdAt: timestamp("create_at").defaultNow().notNull(),
  updateAt: timestamp("update_at").defaultNow().notNull(),
},
  (t) => [primaryKey({
    name: "comment_views_pk",
    columns: [t.userId, t.commentId],
  })]);

export const commentReactionsRelation = relations(commentReactionsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [commentReactionsTable.userId],
    references: [usersTable.id],
  }),
  comment: one(commentsTable, {
    fields: [commentReactionsTable.commentId],
    references: [commentsTable.id]
  }),
  views: many(videoViewsTable),
}))

export const videoViewsTable = pgTable("video_views", {
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  videoId: uuid("video_id").references(() => videosTable.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("create_at").defaultNow().notNull(),
  updateAt: timestamp("update_at").defaultNow().notNull(),
},
  (t) => [primaryKey({
    name: "video_views_pk",
    columns: [t.userId, t.videoId],
  })]);

export const videoViewRelation = relations(videoViewsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [videoViewsTable.userId],
    references: [usersTable.id],
  }),
  video: one(videosTable, {
    fields: [videoViewsTable.videoId],
    references: [videosTable.id]
  }),
}))

export const videoViewSelectSchema = createSelectSchema(videoViewsTable);
export const videoViewInsertSchema = createInsertSchema(videoViewsTable);
export const videoViewUpdateSchema = createUpdateSchema(videoViewsTable);

export const videoReactionsTable = pgTable("video_reactions", {
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  videoId: uuid("video_id").references(() => videosTable.id, { onDelete: "cascade" }).notNull(),
  type: reactionsType("type").notNull(),
  createdAt: timestamp("create_at").defaultNow().notNull(),
  updateAt: timestamp("update_at").defaultNow().notNull(),
}, (t) => [primaryKey({
  name: "video_reactions_pk",
  columns: [t.userId, t.videoId],
})]);

export const videoReactionsRelation = relations(videoReactionsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [videoReactionsTable.userId],
    references: [usersTable.id],
  }),
  video: one(videosTable, {
    fields: [videoReactionsTable.videoId],
    references: [videosTable.id]
  }),
  views: many(videoViewsTable),
}))

export const VideoReactionsSelectSchema = createSelectSchema(videoReactionsTable);
export const videoReactionsInsertSchema = createInsertSchema(videoReactionsTable);
export const videoReactionsUpdateSchema = createUpdateSchema(videoReactionsTable);

export type VideoReactions = typeof videoReactionsTable.$inferSelect