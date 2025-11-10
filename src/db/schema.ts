import { timestamp, pgTable, uuid, varchar, text, uniqueIndex } from "drizzle-orm/pg-core";

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