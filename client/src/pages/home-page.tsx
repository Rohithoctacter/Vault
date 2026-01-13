import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, LogOut, Menu } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Note, Folder } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "" });

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      setLocation("/login");
    }
  }, [setLocation]);

  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: selectedFolderId ? ["/api/notes", { folderId: selectedFolderId }] : ["/api/notes"],
    queryFn: async ({ queryKey }) => {
      const [_path, params] = queryKey as [string, { folderId?: number }?];
      const url = params?.folderId ? `/api/notes?folderId=${params.folderId}` : "/api/notes";
      const res = await fetch(url);
      return res.json();
    }
  });

  const createNoteMutation = useMutation({
    mutationFn: async (note: { title: string; content: string; folderId: number | null }) => {
      const res = await apiRequest("POST", "/api/notes", note);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setIsDialogOpen(false);
      setNewNote({ title: "", content: "" });
      toast({ title: "Note created" });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({ title: "Note deleted" });
    },
  });

  const handleCreateNote = () => {
    if (!newNote.title || !newNote.content) return;
    createNoteMutation.mutate({ ...newNote, folderId: selectedFolderId });
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setLocation("/login");
  };

  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar selectedFolderId={selectedFolderId} onSelectFolder={setSelectedFolderId} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-card">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-bold">My Notepad</h1>
            </div>
            <div className="flex gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-note">
                    <Plus className="h-4 w-4 mr-2" />
                    New Note
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Note</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input 
                        placeholder="Note title" 
                        value={newNote.title} 
                        onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                        data-testid="input-note-title"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Content</label>
                      <Textarea 
                        placeholder="Note content" 
                        className="min-h-[100px]"
                        value={newNote.content}
                        onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                        data-testid="input-note-content"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateNote} disabled={createNoteMutation.isPending} data-testid="button-save-note">
                      Save Note
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">Loading notes...</div>
            ) : notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <StickyNote className="h-12 w-12 mb-2 opacity-20" />
                <p>No notes found in this folder.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <Card key={note.id} className="group hover-elevate transition-all border-accent/20" data-testid={`card-note-${note.id}`}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-2">
                      <CardTitle className="text-lg font-semibold">{note.title}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 -mt-1 -mr-1"
                        onClick={() => deleteNoteMutation.mutate(note.id)}
                        data-testid={`button-delete-note-${note.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap text-muted-foreground text-sm line-clamp-6">{note.content}</p>
                      <div className="mt-4 text-[10px] text-muted-foreground opacity-50">
                        {note.createdAt && new Date(note.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
