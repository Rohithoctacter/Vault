import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Note, type CreateNoteRequest } from "@shared/schema";

const STORAGE_KEY = "orion_notes_vault";
const FOLDERS_KEY = "orion_folders_vault";

// Helper to get notes from localStorage
function getLocalNotes(): Note[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const defaultNotes: Note[] = [
      {
        id: 1,
        title: "Welcome to your secure vault",
        content: "This is your secure space for notes. You can organize them into collections, search through them, and everything is saved privately on your device.",
        folder: "General",
        createdAt: new Date()
      },
      {
        id: 2,
        title: "Quick Start Guide",
        content: "1. Create a new collection for specific topics.\n2. Add notes to any collection.\n3. Your credentials (admin@orion / vault@orion) are hardcoded for this vault.",
        folder: "General",
        createdAt: new Date()
      }
    ];
    saveLocalNotes(defaultNotes);
    return defaultNotes;
  }
  try {
    const parsed = JSON.parse(stored);
    // Force re-adding default notes if General is empty
    if (parsed.length === 0 || !parsed.some((n: any) => (n.folder || "General") === "General")) {
       const defaultNotes: Note[] = [
        {
          id: Date.now(),
          title: "Welcome to your secure vault",
          content: "This is your secure space for notes. You can organize them into collections, search through them, and everything is saved privately on your device.",
          folder: "General",
          createdAt: new Date()
        },
        {
          id: Date.now() + 1,
          title: "Quick Start Guide",
          content: "1. Create a new collection for specific topics.\n2. Add notes to any collection.\n3. Your credentials (admin@orion / vault@orion) are hardcoded for this vault.",
          folder: "General",
          createdAt: new Date()
        }
      ];
      const merged = [...parsed, ...defaultNotes];
      saveLocalNotes(merged);
      return merged.map((n: any) => ({
        ...n,
        createdAt: n.createdAt ? new Date(n.createdAt) : new Date()
      }));
    }
    return parsed.map((n: any) => ({
      ...n,
      createdAt: n.createdAt ? new Date(n.createdAt) : new Date()
    }));
  } catch (e) {
    return [];
  }
}

// Helper to save notes to localStorage
function saveLocalNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// Helper to get folders from localStorage
function getLocalFolders(): string[] {
  const stored = localStorage.getItem(FOLDERS_KEY);
  if (!stored) {
    const defaultFolders = ["General"];
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(defaultFolders));
    return defaultFolders;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return ["General"];
  }
}

// Helper to save folders to localStorage
function saveLocalFolders(folders: string[]) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

// Hook for fetching all notes
export function useNotes() {
  return useQuery({
    queryKey: ["local-notes"],
    queryFn: async () => {
      // Simulate slight delay for "awesome" feel
      await new Promise(r => setTimeout(r, 300));
      return getLocalNotes();
    },
  });
}

// Hook for fetching all folders
export function useFolders() {
  return useQuery({
    queryKey: ["local-folders"],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 200));
      const foldersFromNotes = Array.from(new Set(getLocalNotes().map(n => n.folder || "General")));
      const manualFolders = getLocalFolders();
      return Array.from(new Set([...foldersFromNotes, ...manualFolders])).sort();
    },
  });
}

// Hook for creating a folder
export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      await new Promise(r => setTimeout(r, 300));
      const folders = getLocalFolders();
      if (!folders.includes(name)) {
        saveLocalFolders([...folders, name]);
      }
      return name;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local-folders"] });
    },
  });
}

// Hook for creating a note
export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateNoteRequest) => {
      await new Promise(r => setTimeout(r, 400));
      const notes = getLocalNotes();
      const folder = data.folder || "General";
      
      const newNote: Note = {
        ...data,
        id: Math.max(0, ...notes.map(n => n.id)) + 1,
        folder,
        createdAt: new Date()
      };
      saveLocalNotes([newNote, ...notes]);
      
      // Also ensure folder exists in manual folders
      const folders = getLocalFolders();
      if (!folders.includes(folder)) {
        saveLocalFolders([...folders, folder]);
      }
      
      return newNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local-notes"] });
      queryClient.invalidateQueries({ queryKey: ["local-folders"] });
    },
  });
}

// Hook for deleting a note
export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await new Promise(r => setTimeout(r, 300));
      const notes = getLocalNotes();
      const filtered = notes.filter(n => n.id !== id);
      saveLocalNotes(filtered);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local-notes"] });
    },
  });
}
