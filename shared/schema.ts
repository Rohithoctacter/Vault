import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  folder: text("folder").default("General"),
  attachments: text("attachments"), // Store as JSON string for simplicity with local/pg
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNoteSchema = createInsertSchema(notes).omit({ 
  id: true, 
  createdAt: true 
}).extend({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  folder: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string()
  })).optional()
});

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type CreateNoteRequest = InsertNote;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
