import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Key, Eye, EyeOff } from "lucide-react";

interface APIKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
}

export const APIKeyInput = ({ onApiKeySubmit }: APIKeyInputProps) => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="neural-card w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent neural-glow">
            <Key className="w-8 h-8 text-primary-foreground" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome to CineMind
            </h1>
            <p className="text-muted-foreground mt-2">
              Your AI Movie Memory Companion
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              To get started, please enter your OpenAI API key:
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="memory-input pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              
              <Button
                type="submit"
                disabled={!apiKey.trim()}
                className="neural-button w-full"
              >
                Start Memory Journey
              </Button>
            </form>
          </div>

          <div className="pt-4 border-t border-border space-y-3">
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally and used only for movie identification.
            </p>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Don't have an OpenAI API key?</p>
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Get one here →
              </a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};