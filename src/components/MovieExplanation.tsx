import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Brain, Layers, ArrowLeft } from "lucide-react";

interface MovieExplanationProps {
  movieTitle: string;
  explanation: {
    simple: string;
    detailed: string;
    symbolism: string;
  };
  onBack: () => void;
}

export const MovieExplanation = ({ movieTitle, explanation, onBack }: MovieExplanationProps) => {
  const [activeTab, setActiveTab] = useState("simple");

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header - Mobile Optimized */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="rounded-full w-10 h-10 p-0 hover:bg-secondary/50 touch-manipulation"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Understanding</h1>
          <p className="text-base sm:text-lg text-primary font-medium truncate">{movieTitle}</p>
        </div>
      </div>

      {/* Explanation Tabs - Mobile Optimized */}
      <div className="neural-card rounded-2xl p-4 sm:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/30 rounded-xl h-auto">
            <TabsTrigger 
              value="simple" 
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground p-2 sm:p-3 text-xs sm:text-sm"
            >
              <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Simple</span>
              <span className="sm:hidden">Simple</span>
            </TabsTrigger>
            <TabsTrigger 
              value="detailed"
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground p-2 sm:p-3 text-xs sm:text-sm"
            >
              <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Deep Dive</span>
              <span className="sm:hidden">Deep</span>
            </TabsTrigger>
            <TabsTrigger 
              value="symbolism"
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground p-2 sm:p-3 text-xs sm:text-sm"
            >
              <Layers className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Symbolism</span>
              <span className="sm:hidden">Symbols</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="space-y-4">
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-secondary/30 to-secondary/10 border-border">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="space-y-2 sm:space-y-3 min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">Explained Simply</h3>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                    {explanation.simple}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-border">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                </div>
                <div className="space-y-2 sm:space-y-3 min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">Deep Analysis</h3>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                    {explanation.detailed}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="symbolism" className="space-y-4">
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-border">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="space-y-2 sm:space-y-3 min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">Hidden Meanings & Symbolism</h3>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                    {explanation.symbolism}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Neural Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-particle absolute top-32 right-20 w-2 h-2 bg-accent rounded-full opacity-40" style={{ animationDelay: '1s' }}></div>
        <div className="floating-particle absolute bottom-40 left-24 w-1 h-1 bg-primary rounded-full opacity-60" style={{ animationDelay: '3s' }}></div>
      </div>
    </div>
  );
};