import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  folderId: integer("folder_id").references(() => folders.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFolderSchema = createInsertSchema(folders).omit({ 
  id: true, 
  createdAt: true 
});

export const insertNoteSchema = createInsertSchema(notes).omit({ 
  id: true, 
  createdAt: true 
});

export type Folder = typeof folders.$inferSelect;
export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
