import { type User, type InsertUser, type Note, type InsertNote, type Folder, type InsertFolder } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getFolders(): Promise<Folder[]>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  deleteFolder(id: number): Promise<void>;

  getNotes(folderId?: number): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  deleteNote(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private folders: Map<number, Folder>;
  private notes: Map<number, Note>;
  private currentId: number;
  private currentFolderId: number;
  private currentNoteId: number;

  constructor() {
    this.users = new Map();
    this.folders = new Map();
    this.notes = new Map();
    this.currentId = 1;
    this.currentFolderId = 1;
    this.currentNoteId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id: id as any };
    this.users.set(id, user as any);
    return user as any;
  }

  async getFolders(): Promise<Folder[]> {
    return Array.from(this.folders.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async createFolder(insertFolder: InsertFolder): Promise<Folder> {
    const id = this.currentFolderId++;
    const folder: Folder = { ...insertFolder, id, createdAt: new Date() };
    this.folders.set(id, folder);
    return folder;
  }

  async deleteFolder(id: number): Promise<void> {
    this.folders.delete(id);
    for (const [noteId, note] of this.notes.entries()) {
      if (note.folderId === id) {
        this.notes.delete(noteId);
      }
    }
  }

  async getNotes(folderId?: number): Promise<Note[]> {
    let notes = Array.from(this.notes.values());
    if (folderId !== undefined) {
      notes = notes.filter(n => n.folderId === folderId);
    }
    return notes.sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.currentNoteId++;
    const note: Note = { 
      ...insertNote, 
      id, 
      createdAt: new Date() 
    };
    this.notes.set(id, note);
    return note;
  }

  async deleteNote(id: number): Promise<void> {
    this.notes.delete(id);
  }
}

export const storage = new MemStorage();
