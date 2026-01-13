import { Folder, FolderPlus, Trash2, StickyNote } from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  useSidebar 
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Folder as FolderType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AppSidebarProps {
  onSelectFolder: (id: number | null) => void;
  selectedFolderId: number | null;
}

export function AppSidebar({ onSelectFolder, selectedFolderId }: AppSidebarProps) {
  const { toast } = useToast();
  const { data: folders = [] } = useQuery<FolderType[]>({ 
    queryKey: ["/api/folders"] 
  });

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/folders", { name });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      toast({ title: "Folder created" });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/folders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      if (selectedFolderId) onSelectFolder(null);
      toast({ title: "Folder deleted" });
    },
  });

  const handleCreateFolder = () => {
    const name = prompt("Enter folder name:");
    if (name) createFolderMutation.mutate(name);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-4 py-2">
            <SidebarGroupLabel>Folders</SidebarGroupLabel>
            <Button variant="ghost" size="icon" onClick={handleCreateFolder} data-testid="button-create-folder">
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={selectedFolderId === null} 
                  onClick={() => onSelectFolder(null)}
                  data-testid="link-folder-all"
                >
                  <StickyNote className="h-4 w-4" />
                  <span>All Notes</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {folders.map((folder) => (
                <SidebarMenuItem key={folder.id}>
                  <div className="flex items-center w-full group">
                    <SidebarMenuButton 
                      isActive={selectedFolderId === folder.id} 
                      onClick={() => onSelectFolder(folder.id)}
                      className="flex-1"
                      data-testid={`link-folder-${folder.id}`}
                    >
                      <Folder className="h-4 w-4" />
                      <span>{folder.name}</span>
                    </SidebarMenuButton>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Are you sure? This will delete all notes in this folder.")) {
                          deleteFolderMutation.mutate(folder.id);
                        }
                      }}
                      data-testid={`button-delete-folder-${folder.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
