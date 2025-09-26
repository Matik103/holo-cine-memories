import { Brain } from "lucide-react";

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {/* Background Neural Network Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/3 right-1/3 w-32 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <div className="floating-particle absolute top-20 right-20 w-2 h-2 bg-primary rounded-full opacity-30"></div>
        <div className="floating-particle absolute bottom-32 left-32 w-1 h-1 bg-accent rounded-full opacity-50 animation-delay-3s"></div>
      </div>

      <div className="flex flex-col items-center space-y-6 z-10">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent neural-glow loading-pulse">
          <Brain className="w-10 h-10 text-primary-foreground" />
        </div>

        {/* App Name */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CineMind
          </h1>
          <p className="text-muted-foreground mt-2">
            Your Personal AI Movie Memory Companion
          </p>
        </div>

        {/* Loading Spinner */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full loading-bounce animation-delay-0" />
            <div className="w-2 h-2 bg-primary rounded-full loading-bounce animation-delay-150" />
            <div className="w-2 h-2 bg-primary rounded-full loading-bounce animation-delay-300" />
          </div>
        </div>
      </div>
    </div>
  );
};
