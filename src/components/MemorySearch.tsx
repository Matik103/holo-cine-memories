import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Search, Sparkles } from "lucide-react";

interface MemorySearchProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export const MemorySearch = ({ onSearch, isLoading }: MemorySearchProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Floating Memory Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-particle absolute top-20 left-20 w-2 h-2 bg-primary rounded-full opacity-40" style={{ animationDelay: '0s' }}></div>
        <div className="floating-particle absolute top-40 right-32 w-1 h-1 bg-accent rounded-full opacity-60" style={{ animationDelay: '2s' }}></div>
        <div className="floating-particle absolute bottom-32 left-16 w-3 h-3 bg-primary rounded-full opacity-30" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main Memory Input */}
      <div className="neural-card rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent neural-glow">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            What movie do you remember?
          </h1>
          <p className="text-muted-foreground">
            Describe any scene, quote, feeling, or half-memory...
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="That movie where a god loses his eyes and a slave helps him fight..."
              className="memory-input min-h-24 text-lg resize-none rounded-xl"
              disabled={isLoading}
            />
            
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="neural-button flex-1 h-12 rounded-xl text-base"
              >
                <Search className="w-5 h-5 mr-2" />
                {isLoading ? "Searching Memory..." : "Recall Movie"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="h-12 px-6 rounded-xl border-border hover:bg-secondary/50"
                disabled={isLoading}
              >
                <Mic className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </form>

        {/* Quick Suggestions */}
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Movie with spinning dreams",
              "Robot falls in love with human", 
              "Time loop same day",
              "Talking toys come alive"
            ].map((example) => (
              <Button
                key={example}
                variant="ghost"
                size="sm"
                onClick={() => setQuery(example)}
                className="text-xs bg-secondary/30 hover:bg-secondary/60 rounded-full"
                disabled={isLoading}
              >
                {example}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};