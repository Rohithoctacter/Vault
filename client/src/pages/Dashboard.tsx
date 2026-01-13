import { useState } from "react";
import { useNotes, useFolders, useCreateFolder, useDeleteFolder } from "@/hooks/use-notes";
import { CreateNoteDialog } from "@/components/CreateNoteDialog";
import { NoteCard } from "@/components/NoteCard";
import { FolderCard } from "@/components/FolderCard";
import { useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, FileText, ChevronLeft, LayoutGrid, FolderPlus, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: notes, isLoading: notesLoading, error } = useNotes();
  const { data: folders = [], isLoading: foldersLoading } = useFolders();
  const createFolder = useCreateFolder();
  const deleteFolder = useDeleteFolder();
  const logout = useLogout();
  const { toast } = useToast();
  
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isLoading = notesLoading || foldersLoading;

  const handleDeleteFolder = async () => {
    if (!selectedFolder || selectedFolder === "General") return;
    
    try {
      await deleteFolder.mutateAsync(selectedFolder);
      toast({
        title: "Collection deleted",
        description: `Folder "${selectedFolder}" has been removed.`,
      });
      setSelectedFolder(null);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete collection.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    if (error.message === "Unauthorized") {
      window.location.href = "/";
      return null;
    }
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    try {
      await createFolder.mutateAsync(newFolderName.trim());
      toast({
        title: "Collection created",
        description: `New folder "${newFolderName}" is ready.`,
      });
      setNewFolderName("");
      setIsFolderDialogOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create collection.",
        variant: "destructive",
      });
    }
  };

  const filteredNotes = selectedFolder 
    ? notes?.filter(n => (n.folder || "General") === selectedFolder)
    : notes;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <FileText className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
              {selectedFolder || "Vault"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={logout}
              className="text-muted-foreground hover:text-foreground hidden sm:flex"
            >
              Sign out
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={logout}
              className="sm:hidden text-muted-foreground"
            >
              <LogOut className="h-5 w-5" />
            </Button>
            <CreateNoteDialog defaultFolder={selectedFolder || "General"} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[40vh] gap-4"
            >
              <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground animate-pulse">Loading your vault...</p>
            </motion.div>
          ) : !selectedFolder ? (
            <motion.div
              key="folders"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display font-bold text-muted-foreground uppercase tracking-widest">
                  Collections
                </h2>
                
                <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FolderPlus className="h-4 w-4" />
                      New Collection
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                      <DialogTitle>Create New Collection</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateFolder} className="space-y-4 pt-4">
                      <Input
                        placeholder="Collection name..."
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        autoFocus
                      />
                      <div className="flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setIsFolderDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={!newFolderName.trim() || createFolder.isPending}>
                          {createFolder.isPending ? "Creating..." : "Create Collection"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {folders.length === 0 ? (
                <div className="text-center py-20 bg-secondary/10 rounded-3xl border-2 border-dashed border-border/50">
                  <p className="text-muted-foreground">No collections yet. Create one to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {folders.map((name, index) => (
                    <FolderCard 
                      key={name} 
                      name={name} 
                      count={notes?.filter(n => (n.folder || "General") === name).length || 0} 
                      index={index}
                      onClick={() => setSelectedFolder(name)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="notes-list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedFolder(null)}
                  className="gap-2 -ml-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Collections
                </Button>
                <div className="h-px flex-1 bg-border/50 mx-6" />
                <div className="flex items-center gap-2">
                  {selectedFolder !== "General" && (
                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Collection</DialogTitle>
                        </DialogHeader>
                        <p className="text-muted-foreground py-4">
                          Are you sure you want to delete the collection "{selectedFolder}"? The notes inside will still be accessible in the main vault.
                        </p>
                        <DialogFooter>
                          <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                          <Button variant="destructive" onClick={handleDeleteFolder} disabled={deleteFolder.isPending}>
                            {deleteFolder.isPending ? "Deleting..." : "Delete Collection"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {filteredNotes?.length || 0} Notes
                  </span>
                </div>
              </div>
              
              {(!filteredNotes || filteredNotes.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-20 w-20 bg-secondary/30 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">No notes in this collection</h3>
                  <p className="text-muted-foreground mb-6">Start by adding your first note here.</p>
                  <CreateNoteDialog defaultFolder={selectedFolder} />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredNotes.map((note, index) => (
                    <NoteCard key={note.id} note={note} index={index} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
