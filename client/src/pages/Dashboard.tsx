import { useNotes } from "@/hooks/use-notes";
import { CreateNoteDialog } from "@/components/CreateNoteDialog";
import { NoteCard } from "@/components/NoteCard";
import { useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutGrid, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: notes, isLoading, error } = useNotes();
  const logout = useLogout();

  if (error) {
    // If unauthorized, redirect logic handled by queryClient/wrapper usually,
    // but here we can show a nice error or retry button
    if (error.message === "Unauthorized") {
      window.location.href = "/";
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <FileText className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
              My Notes
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
            <CreateNoteDialog />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground animate-pulse">Loading your notes...</p>
          </div>
        ) : !notes || notes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto"
          >
            <div className="h-24 w-24 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
              <LayoutGrid className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              It's quiet here...
            </h2>
            <p className="text-muted-foreground mb-8">
              You haven't created any notes yet. Start capturing your ideas today.
            </p>
            <CreateNoteDialog />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {notes.map((note, index) => (
              <NoteCard key={note.id} note={note} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
