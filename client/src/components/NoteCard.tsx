import { format } from "date-fns";
import { Trash2, Paperclip, FileText, Image as ImageIcon, ExternalLink, Maximize2 } from "lucide-react";
import { type Note } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useDeleteNote } from "@/hooks/use-notes";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NoteCardProps {
  note: Note;
  index: number;
}

export function NoteCard({ note, index }: NoteCardProps) {
  const deleteNote = useDeleteNote();
  const { toast } = useToast();

  const attachments = typeof note.attachments === 'string' 
    ? JSON.parse(note.attachments) 
    : (note.attachments || []);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

      <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
              title="Expand note"
              data-testid={`button-expand-note-${note.id}`}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0 border-none shadow-2xl">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-3xl font-display font-bold text-primary">
                {note.title}
              </DialogTitle>
              <div className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider mt-1">
                {note.createdAt ? format(new Date(note.createdAt), "PPP p") : "Just now"} • {note.folder || "General"}
              </div>
            </DialogHeader>
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="text-foreground text-lg leading-relaxed whitespace-pre-wrap pb-6">
                {note.content}
              </div>
              {attachments.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-semibold mb-3">Attachments</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {attachments.map((file: any, i: number) => (
                      <a
                        key={i}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col gap-2 p-3 bg-secondary/40 hover:bg-secondary/60 rounded-xl border border-border/50 transition-all group/att"
                      >
                        <div className="flex items-center justify-between">
                          {file.type.startsWith('image/') ? (
                            <ImageIcon className="h-5 w-5 text-primary" />
                          ) : (
                            <FileText className="h-5 w-5 text-primary" />
                          )}
                          <ExternalLink className="h-4 w-4 opacity-0 group-hover/att:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-sm font-medium truncate">{file.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{file.type.split('/')[1]}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-display text-xl font-bold text-foreground mb-3 line-clamp-2 pr-8">
          {note.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-6 flex-1 whitespace-pre-wrap">
          {note.content}
        </p>

        {attachments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {attachments.map((file: any, i: number) => (
              <a
                key={i}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-secondary/40 hover:bg-secondary/60 px-2.5 py-1 rounded-md border border-border/50 text-xs font-medium transition-colors group/link"
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="h-3 w-3 text-primary" />
                ) : (
                  <FileText className="h-3 w-3 text-primary" />
                )}
                <span className="truncate max-w-[100px]">{file.name}</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        )}
      </div>
      
      <div className="px-6 py-4 bg-secondary/20 border-t border-border/50 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
          {note.createdAt ? format(new Date(note.createdAt), "MMM d, yyyy") : "Just now"}
        </span>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={deleteNote.isPending}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
            title="Delete note"
            data-testid={`button-delete-note-${note.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
