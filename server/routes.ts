import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

const HARDCODED_USERNAME = "admin";
const HARDCODED_PASSWORD = "admin";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Auth Endpoint
  app.post(api.auth.login.path, (req, res) => {
    const { username, password } = req.body;
    if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
      // In a real app we'd set a session, but for this simple requirement
      // we just return success and the frontend will handle the state.
      // Since "no backend stuff" was requested, we are keeping it minimal.
      return res.json({ success: true });
    }
    return res.status(401).json({ message: "Invalid credentials" });
  });

  // Notes Endpoints
  app.get(api.notes.list.path, async (req, res) => {
    const notes = await storage.getNotes();
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
          field: err.errors[0].path.join("."),
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

  // Seed data
  if ((await storage.getNotes()).length === 0) {
    await storage.createNote({
      title: "Welcome to your Notes",
      content:
        "This is a simple notepad. You can create, view, and delete notes. Your changes are saved in memory.",
    });
    await storage.createNote({
      title: "Credentials",
      content: `Username: ${HARDCODED_USERNAME}\nPassword: ${HARDCODED_PASSWORD}`,
    });
  }

  return httpServer;
}
