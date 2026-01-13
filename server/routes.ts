import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

const HARDCODED_USERNAME = "admin";
const HARDCODED_PASSWORD = "password123";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Auth Endpoint
  app.post(api.auth.login.path, (req, res) => {
    const { username, password } = req.body;
    if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
      return res.json({ success: true });
    }
    return res.status(401).json({ message: "Invalid credentials" });
  });

  // Folders Endpoints
  app.get(api.folders.list.path, async (req, res) => {
    const folders = await storage.getFolders();
    res.json(folders);
  });

  app.post(api.folders.create.path, async (req, res) => {
    try {
      const input = api.folders.create.input.parse(req.body);
      const folder = await storage.createFolder(input);
      res.status(201).json(folder);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.folders.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    await storage.deleteFolder(id);
    res.status(204).send();
  });

  // Notes Endpoints
  app.get(api.notes.list.path, async (req, res) => {
    const folderId = req.query.folderId ? parseInt(req.query.folderId as string) : undefined;
    const notes = await storage.getNotes(folderId);
    res.json(notes);
  });

  app.post(api.notes.create.path, async (req, res) => {
    try {
      const input = api.notes.create.input.parse(req.body);
      const note = await storage.createNote(input);
      res.status(201).json(note);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.notes.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    await storage.deleteNote(id);
    res.status(204).send();
  });

  return httpServer;
}
