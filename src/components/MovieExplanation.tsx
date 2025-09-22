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
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-0">
      {/* Header - Enhanced Mobile */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="rounded-full w-10 h-10 p-0 hover:bg-secondary/50 touch-manipulation flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Understanding</h1>
          <p className="text-sm sm:text-base md:text-lg text-primary font-medium truncate">{movieTitle}</p>
        </div>
      </div>

      {/* Explanation Tabs - Enhanced Mobile */}
      <div className="neural-card rounded-xl sm:rounded-2xl p-3 sm:p-6 md:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/30 rounded-lg sm:rounded-xl h-auto gap-1">
            <TabsTrigger 
              value="simple" 
              className="rounded-md sm:rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground p-2 sm:p-3 text-xs sm:text-sm font-medium touch-manipulation"
            >
              <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">Simple</span>
            </TabsTrigger>
            <TabsTrigger 
              value="detailed"
              className="rounded-md sm:rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground p-2 sm:p-3 text-xs sm:text-sm font-medium touch-manipulation"
            >
              <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">Deep Dive</span>
            </TabsTrigger>
            <TabsTrigger 
              value="symbolism"
              className="rounded-md sm:rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground p-2 sm:p-3 text-xs sm:text-sm font-medium touch-manipulation"
            >
              <Layers className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">Symbolism</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="space-y-3 sm:space-y-4">
            <Card className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-secondary/30 to-secondary/10 border-border">
              <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <div className="space-y-2 sm:space-y-3 min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base md:text-lg">Explained Simply</h3>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-xs sm:text-sm md:text-base break-words">
                    {explanation.simple}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-3 sm:space-y-4">
            <Card className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-border">
              <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-accent" />
                </div>
                <div className="space-y-2 sm:space-y-3 min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base md:text-lg">Deep Analysis</h3>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-xs sm:text-sm md:text-base break-words">
                    {explanation.detailed}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="symbolism" className="space-y-3 sm:space-y-4">
            <Card className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-border">
              <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Layers className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <div className="space-y-2 sm:space-y-3 min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base md:text-lg">Hidden Meanings & Symbolism</h3>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-xs sm:text-sm md:text-base break-words">
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