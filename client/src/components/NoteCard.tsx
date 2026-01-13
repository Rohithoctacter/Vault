import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { type Note } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useDeleteNote } from "@/hooks/use-notes";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface NoteCardProps {
  note: Note;
  index: number;
}

export function NoteCard({ note, index }: NoteCardProps) {
  const deleteNote = useDeleteNote();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteNote.mutateAsync(note.id);
      toast({
        title: "Deleted",
        description: "Note removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="group relative flex flex-col h-full bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-display text-xl font-bold text-foreground mb-3 line-clamp-2">
          {note.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-6 flex-1 whitespace-pre-wrap">
          {note.content}
        </p>
      </div>
      
      <div className="px-6 py-4 bg-secondary/20 border-t border-border/50 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
          {note.createdAt ? format(new Date(note.createdAt), "MMM d, yyyy") : "Just now"}
        </span>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={deleteNote.isPending}
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
          title="Delete note"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
