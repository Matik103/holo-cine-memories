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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="rounded-full w-10 h-10 p-0 hover:bg-secondary/50"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold text-foreground">Understanding</h1>
          <p className="text-lg text-primary font-medium">{movieTitle}</p>
        </div>
      </div>

      {/* Explanation Tabs */}
      <div className="neural-card rounded-2xl p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/30 rounded-xl">
            <TabsTrigger 
              value="simple" 
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Simple
            </TabsTrigger>
            <TabsTrigger 
              value="detailed"
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Brain className="w-4 h-4 mr-2" />
              Deep Dive
            </TabsTrigger>
            <TabsTrigger 
              value="symbolism"
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Layers className="w-4 h-4 mr-2" />
              Symbolism
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="space-y-4">
            <Card className="p-6 bg-gradient-to-br from-secondary/30 to-secondary/10 border-border">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Explained Simply</h3>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {explanation.simple}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-border">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-accent" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Deep Analysis</h3>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {explanation.detailed}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="symbolism" className="space-y-4">
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-border">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Hidden Meanings & Symbolism</h3>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
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