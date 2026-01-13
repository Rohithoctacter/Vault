import { useState } from "react";
import { useNotes } from "@/hooks/use-notes";
import { CreateNoteDialog } from "@/components/CreateNoteDialog";
import { NoteCard } from "@/components/NoteCard";
import { FolderCard } from "@/components/FolderCard";
import { useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, FileText, ChevronLeft, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { data: notes, isLoading, error } = useNotes();
  const logout = useLogout();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  if (error) {
    if (error.message === "Unauthorized") {
      window.location.href = "/";
      return null;
    }
  }

  // Get unique folders and count notes in them
  const folders = notes?.reduce((acc, note) => {
    const folderName = note.folder || "General";
    acc[folderName] = (acc[folderName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const folderEntries = Object.entries(folders).sort((a, b) => a[0].localeCompare(b[0]));
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
              {selectedFolder || "My Notes"}
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
          ) : !notes || notes.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto"
            >
              <div className="h-24 w-24 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
                <LayoutGrid className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Your vault is empty
              </h2>
              <p className="text-muted-foreground mb-8">
                Start capturing your ideas by creating your first note.
              </p>
              <CreateNoteDialog />
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
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {folderEntries.map(([name, count], index) => (
                  <FolderCard 
                    key={name} 
                    name={name} 
                    count={count} 
                    index={index}
                    onClick={() => setSelectedFolder(name)}
                  />
                ))}
              </div>
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
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {filteredNotes?.length || 0} Notes
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredNotes?.map((note, index) => (
                  <NoteCard key={note.id} note={note} index={index} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
