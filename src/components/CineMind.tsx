import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MemorySearch } from "./MemorySearch";
import { MovieCard, Movie } from "./MovieCard";
import { MovieExplanation } from "./MovieExplanation";
import { StreamingAvailability } from "./StreamingAvailability";
import { APIKeyInput } from "./APIKeyInput";
import { LandingPage } from "./LandingPage";
import { initializeOpenAI, identifyMovie, explainMovie, getStreamingOptions } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, User, Compass, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

type ViewState = 'search' | 'movie-details' | 'explanation' | 'streaming';

interface StreamingOption {
  platform: string;
  type: 'free' | 'subscription' | 'rent' | 'buy';
  price?: string;
  url: string;
  quality?: string;
}

export const CineMind = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>('search');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [movieExplanation, setMovieExplanation] = useState<{
    simple: string;
    detailed: string;
    symbolism: string;
  } | null>(null);
  const [streamingOptions, setStreamingOptions] = useState<StreamingOption[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if API key is stored in localStorage
    const storedApiKey = localStorage.getItem('cinemind-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      initializeOpenAI(storedApiKey);
      setShowLanding(false); // Skip landing page if API key exists
    }

    // Check authentication state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleApiKeySubmit = (key: string) => {
    localStorage.setItem('cinemind-api-key', key);
    setApiKey(key);
    initializeOpenAI(key);
    setShowLanding(false);
    toast({
      title: "API Key Saved",
      description: "CineMind is ready to help you remember movies!"
    });
  };

  const handleStartJourney = async () => {
    setShowLanding(false);
    
    // Get the main OpenAI API key from Supabase secrets
    try {
      const { data: { secrets } } = await supabase.functions.invoke('get-secrets');
      const openaiApiKey = secrets?.OPENAI_API_KEY;
      
      if (openaiApiKey) {
        localStorage.setItem('cinemind-api-key', openaiApiKey);
        setApiKey(openaiApiKey);
        initializeOpenAI(openaiApiKey);
        toast({
          title: "Welcome to CineMind!",
          description: "Your AI movie memory companion is ready to help!"
        });
      } else {
        // Fallback to API key input if main key not available
        toast({
          title: "API Key Required",
          description: "Please enter your OpenAI API key to continue.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching OpenAI API key:', error);
      toast({
        title: "Error",
        description: "Failed to initialize CineMind. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const movie = await identifyMovie(query);
      if (movie) {
        setCurrentMovie(movie);
        setCurrentView('movie-details');
        toast({
          title: "Movie Found!",
          description: `Identified: ${movie.title} (${movie.year})`
        });
      } else {
        toast({
          title: "No Match Found",
          description: "Try describing the movie differently or with more details.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainMeaning = async () => {
    if (!currentMovie) return;
    
    setIsLoading(true);
    try {
      const explanation = await explainMovie(currentMovie.title);
      if (explanation) {
        setMovieExplanation(explanation);
        setCurrentView('explanation');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to explain movie. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindWhereToWatch = async () => {
    if (!currentMovie) return;
    
    setIsLoading(true);
    try {
      const options = await getStreamingOptions(currentMovie.title);
      setStreamingOptions(options);
      setCurrentView('streaming');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to find streaming options. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setCurrentView('search');
    setCurrentMovie(null);
    setMovieExplanation(null);
    setStreamingOptions([]);
  };

  const handleBackToMovie = () => {
    setCurrentView('movie-details');
    setMovieExplanation(null);
    setStreamingOptions([]);
  };

  // Show landing page first
  if (showLanding) {
    return <LandingPage onStart={handleStartJourney} />;
  }

  // Show API key input if not configured
  if (!apiKey) {
    return <APIKeyInput onApiKeySubmit={handleApiKeySubmit} />;
  }

  return (
    <div className="min-h-screen p-4 relative">
      {/* Background Neural Network Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/3 right-1/3 w-32 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <div className="floating-particle absolute top-20 right-20 w-2 h-2 bg-primary rounded-full opacity-30"></div>
        <div className="floating-particle absolute bottom-32 left-32 w-1 h-1 bg-accent rounded-full opacity-50 animation-delay-3s"></div>
      </div>

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CineMind
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate("/discover")}
              className="flex items-center gap-2 hover:bg-secondary/60"
            >
              <Compass className="w-4 h-4" />
              Discover
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <Menu className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="w-4 h-4 mr-2" />
                    Profile & CineDNA
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => supabase.auth.signOut()}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                className="neural-button"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
        <p className="text-center text-muted-foreground">
          Your Personal AI Movie Memory Companion
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {currentView === 'search' && (
          <div className="flex flex-col items-center justify-center space-y-8">
            <MemorySearch onSearch={handleSearch} isLoading={isLoading} />
          </div>
        )}

        {currentView === 'movie-details' && currentMovie && (
          <div className="space-y-6">
            <MovieCard
              movie={currentMovie}
              onExplainMeaning={handleExplainMeaning}
              onFindWhereToWatch={handleFindWhereToWatch}
            />
            <div className="flex justify-center">
              <button
                onClick={handleBackToSearch}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Search
              </button>
            </div>
          </div>
        )}

        {currentView === 'explanation' && movieExplanation && currentMovie && (
          <MovieExplanation
            movieTitle={currentMovie.title}
            explanation={movieExplanation}
            onBack={handleBackToMovie}
          />
        )}

        {currentView === 'streaming' && currentMovie && (
          <StreamingAvailability
            movieTitle={currentMovie.title}
            options={streamingOptions}
            onBack={handleBackToMovie}
          />
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="neural-card p-8 flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Processing your memory...</p>
          </div>
        </div>
      )}
    </div>
  );
};