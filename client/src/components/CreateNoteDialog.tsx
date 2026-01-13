import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, FolderPlus } from "lucide-react";
import { useCreateNote, useFolders } from "@/hooks/use-notes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { insertNoteSchema } from "@shared/schema";

export function CreateNoteDialog({ defaultFolder = "General" }: { defaultFolder?: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [folder, setFolder] = useState(defaultFolder);
  
  const { data: folders = [] } = useFolders();

  // Sync folder state when defaultFolder changes (e.g. when navigating between folders)
  useEffect(() => {
    setFolder(defaultFolder);
  }, [defaultFolder]);

  const [isAddingNewFolder, setIsAddingNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const { toast } = useToast();
  const createNote = useCreateNote();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const finalFolder = isAddingNewFolder ? newFolderName : folder;
      const data = { title, content, folder: finalFolder };
      insertNoteSchema.parse(data);

      await createNote.mutateAsync(data);
      
      toast({
        title: "Note created",
        description: `Saved to ${finalFolder}`,
      });
      
      setOpen(false);
      setTitle("");
      setContent("");
      setIsAddingNewFolder(false);
      setNewFolderName("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to create note",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
          <Plus className="h-4 w-4" />
          New Note
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-primary">Create a Note</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {isAddingNewFolder ? (
                <Input
                  placeholder="New folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="h-9"
                  autoFocus
                />
              ) : (
                <Select value={folder} onValueChange={setFolder}>
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Select folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => setIsAddingNewFolder(!isAddingNewFolder)}
                title={isAddingNewFolder ? "Select existing folder" : "Create new folder"}
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
            </div>
            
            <Input
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium border-0 border-b-2 border-muted focus-visible:ring-0 focus-visible:border-primary px-0 rounded-none bg-transparent placeholder:text-muted-foreground/50 transition-colors"
            />
            
            <Textarea
              placeholder="Write your thoughts here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] resize-none border-0 bg-secondary/30 focus-visible:ring-0 rounded-xl p-4 text-base leading-relaxed"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createNote.isPending || !title.trim() || !content.trim() || (isAddingNewFolder && !newFolderName.trim())}
              className="min-w-[100px]"
            >
              {createNote.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Note"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
