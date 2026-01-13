import { useState } from "react";
import { useLogin } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    try {
      await login.mutateAsync({ username, password });
      toast({
        title: "Welcome back",
        description: "Successfully logged in.",
      });
    } catch (error) {
      toast({
        title: "Access Denied",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-secondary/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md p-8 glass-panel rounded-3xl relative z-10 mx-4"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 mb-6">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Restricted Access</h1>
          <p className="text-muted-foreground mt-2">Please verify your identity to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 rounded-xl bg-white/50 border-border focus:ring-primary/20"
              placeholder="Enter username"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl bg-white/50 border-border focus:ring-primary/20"
              placeholder="Enter password"
            />
          </div>

          <Button 
            type="submit" 
            disabled={login.isPending}
            className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            {login.isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              "Authenticate"
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            Secure Vault Environment
          </p>
        </div>
      </motion.div>
    </div>
  );
}
