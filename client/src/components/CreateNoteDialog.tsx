import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, FolderPlus, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { useCreateNote, useFolders } from "@/hooks/use-notes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { insertNoteSchema } from "@shared/schema";

interface Attachment {
  name: string;
  url: string;
  type: string;
}

export function CreateNoteDialog({ defaultFolder = "General" }: { defaultFolder?: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [folder, setFolder] = useState(defaultFolder);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const { data: folders = [] } = useFolders();

  // Sync folder state when defaultFolder changes (e.g. when navigating between folders)
  useEffect(() => {
    setFolder(defaultFolder);
  }, [defaultFolder]);

  const [isAddingNewFolder, setIsAddingNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const { toast } = useToast();
  const createNote = useCreateNote();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive",
        });
        continue;
      }

      const reader = new FileReader();
      const promise = new Promise<Attachment>((resolve) => {
        reader.onload = (e) => {
          resolve({
            name: file.name,
            url: e.target?.result as string,
            type: file.type,
          });
        };
      });
      reader.readAsDataURL(file);
      newAttachments.push(await promise);
    }
    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const finalFolder = isAddingNewFolder ? newFolderName : folder;
      const data = { title, content, folder: finalFolder, attachments };
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
      setAttachments([]);
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

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {attachments.map((file, i) => (
                  <div key={i} className="relative group flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 text-primary" />
                    )}
                    <span className="text-xs font-medium truncate max-w-[120px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-2">
              <Input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-primary transition-all"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Paperclip className="h-4 w-4" />
                Attach files
              </Button>
            </div>
            <div className="flex gap-3">
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
