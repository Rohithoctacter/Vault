import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold">404 Page Not Found</h1>
          <p className="text-muted-foreground text-lg">
            We couldn't find the page you were looking for.
          </p>
        </div>

        <Link href="/">
          <Button size="lg" className="rounded-full px-8">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
