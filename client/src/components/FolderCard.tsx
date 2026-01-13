import { motion } from "framer-motion";
import { Folder, ChevronRight, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FolderCardProps {
  name: string;
  count: number;
  onClick: () => void;
  index: number;
}

export function FolderCard({ name, count, onClick, index }: FolderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        onClick={onClick}
        className="group cursor-pointer relative overflow-hidden border-border/50 bg-card hover:bg-accent/5 transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
              <Folder className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {name}
              </h3>
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <FileText className="h-3.5 w-3.5" />
                <span>{count} {count === 1 ? 'note' : 'notes'}</span>
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </Card>
    </motion.div>
  );
}
