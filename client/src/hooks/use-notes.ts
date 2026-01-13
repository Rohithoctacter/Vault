import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Note, type CreateNoteRequest } from "@shared/schema";

const STORAGE_KEY = "orion_notes_vault";

// Helper to get notes from localStorage
function getLocalNotes(): Note[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const defaultNotes: Note[] = [
      {
        id: 1,
        title: "Welcome to your Notes",
        content: "This is a simple notepad. You can create, view, and delete notes. Your changes are saved in your browser's local storage.",
        folder: "General",
        createdAt: new Date()
      }
    ];
    saveLocalNotes(defaultNotes);
    return defaultNotes;
  }
  try {
    const parsed = JSON.parse(stored);
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

// Hook for creating a note
export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateNoteRequest) => {
      await new Promise(r => setTimeout(r, 400));
      const notes = getLocalNotes();
      const newNote: Note = {
        ...data,
        id: Math.max(0, ...notes.map(n => n.id)) + 1,
        folder: data.folder || "General",
        createdAt: new Date()
      };
      saveLocalNotes([newNote, ...notes]);
      return newNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local-notes"] });
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
