import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MemorySearch } from "./MemorySearch";
import { MovieCard, Movie } from "./MovieCard";
import { MovieExplanation } from "./MovieExplanation";
import { StreamingAvailability } from "./StreamingAvailability";
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
  const [user, setUser] = useState<any>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>('search');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [movieExplanation, setMovieExplanation] = useState<{
    simple: string;
    detailed: string;
    symbolism: string;
  } | null>(null);
  const [streamingOptions, setStreamingOptions] = useState<StreamingOption[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Check if this is a password recovery session
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const isPasswordReset = urlParams.get('type') === 'recovery' || 
                               urlParams.get('reset') === 'true' ||
                               hashParams.get('type') === 'recovery' ||
                               hashParams.has('access_token');
        
        if (isPasswordReset) {
          // Don't initialize app for password reset - let Auth component handle it
          console.log('Password reset detected, not initializing app');
          return;
        }
        
        setShowLanding(false); // Skip landing page if user is authenticated
        // Initialize OpenAI with the main API key from Supabase
        initializeOpenAIFromSupabase();
      }
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Check if this is a password recovery session
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const isPasswordReset = urlParams.get('type') === 'recovery' || 
                               urlParams.get('reset') === 'true' ||
                               hashParams.get('type') === 'recovery' ||
                               hashParams.has('access_token');
        
        if (isPasswordReset) {
          // Don't initialize app for password reset - let Auth component handle it
          console.log('Password reset detected, not initializing app');
          return;
        }
        
        setShowLanding(false);
        initializeOpenAIFromSupabase();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const initializeOpenAIFromSupabase = async () => {
    try {
      const { data: { secrets } } = await supabase.functions.invoke('get-secrets');
      const openaiApiKey = secrets?.OPENAI_API_KEY;
      
      if (openaiApiKey) {
        initializeOpenAI(openaiApiKey);
        console.log('OpenAI API key loaded successfully');
      } else {
        console.warn('No OpenAI API key found in secrets');
        toast({
          title: "API Configuration Issue",
          description: "Unable to load AI services. Please try refreshing the page.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching OpenAI API key:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to AI services. Please check your internet connection and try again.",
        variant: "destructive"
      });
    }
  };

  const handleStartJourney = () => {
    // Redirect to authentication page
    navigate("/auth");
  };

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setLoadingMessage("Analyzing your description...");
    setRetryCount(0);
    
    try {
      const rawMovie = await identifyMovie(query);
      if (rawMovie) {
        // Transform the data to match MovieCard interface
        const movie: Movie = {
          title: rawMovie.title,
          year: rawMovie.year,
          director: rawMovie.director || 'Unknown Director',
          genre: rawMovie.genre || [],
          plot: rawMovie.plot || 'No plot available',
          poster: (rawMovie as any).poster_url || undefined,
          runtime: rawMovie.runtime || undefined,
          cast: rawMovie.cast || [],
          imdbRating: rawMovie.imdbRating || undefined
        };
        
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
      console.error('Search error:', error);
      
      // Provide more specific error messages
      let errorMessage = "Something went wrong";
      if (error instanceof Error) {
        if (error.message.includes('CORS')) {
          errorMessage = "Service temporarily unavailable. Please try again in a moment.";
        } else if (error.message.includes('API')) {
          errorMessage = "AI service error. Please try again.";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Search Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleExplainMeaning = async () => {
    if (!currentMovie) return;
    
    setIsLoading(true);
    setLoadingMessage("Analyzing movie themes and symbolism...");
    
    try {
      const explanation = await explainMovie(currentMovie.title);
      if (explanation) {
        setMovieExplanation(explanation);
        setCurrentView('explanation');
        toast({
          title: "Explanation Ready!",
          description: "AI analysis complete. Explore the different perspectives below."
        });
      } else {
        toast({
          title: "No Explanation Available",
          description: "Unable to generate explanation for this movie.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Explanation error:', error);
      
      let errorMessage = "Failed to explain movie. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('CORS')) {
          errorMessage = "Service temporarily unavailable. Please try again in a moment.";
        } else if (error.message.includes('API')) {
          errorMessage = "AI service error. Please try again.";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Network error. Please check your connection and try again.";
        }
      }
      
      toast({
        title: "Explanation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleFindWhereToWatch = async () => {
    if (!currentMovie) return;
    
    setIsLoading(true);
    setLoadingMessage("Searching streaming platforms...");
    
    try {
      const options = await getStreamingOptions(currentMovie.title);
      if (options && options.length > 0) {
        setStreamingOptions(options);
        setCurrentView('streaming');
        toast({
          title: "Streaming Options Found!",
          description: `Found ${options.length} ways to watch ${currentMovie.title}`
        });
      } else {
        toast({
          title: "No Streaming Options",
          description: "No streaming options found for this movie.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Streaming error:', error);
      
      let errorMessage = "Failed to find streaming options. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('CORS')) {
          errorMessage = "Service temporarily unavailable. Please try again in a moment.";
        } else if (error.message.includes('API')) {
          errorMessage = "AI service error. Please try again.";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Network error. Please check your connection and try again.";
        }
      }
      
      toast({
        title: "Streaming Search Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
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

  // Check if this is a password reset session
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const isPasswordReset = urlParams.get('type') === 'recovery' || 
                         urlParams.get('reset') === 'true' ||
                         hashParams.get('type') === 'recovery' ||
                         hashParams.has('access_token');
  
  // Show authentication page if user is not logged in or if it's a password reset
  if (!user || isPasswordReset) {
    return <LandingPage onStart={handleStartJourney} />;
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 relative">
      {/* Background Neural Network Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/3 right-1/3 w-32 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <div className="floating-particle absolute top-20 right-20 w-2 h-2 bg-primary rounded-full opacity-30"></div>
        <div className="floating-particle absolute bottom-32 left-32 w-1 h-1 bg-accent rounded-full opacity-50 animation-delay-3s"></div>
      </div>

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-4 sm:mb-8 px-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CineMind
            </h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate("/discover")}
              className="flex items-center gap-1 sm:gap-2 hover:bg-secondary/60 text-xs sm:text-sm px-2 sm:px-4"
            >
              <Compass className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Discover</span>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4">
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    <Menu className="w-2 h-2 sm:w-3 sm:h-3" />
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
                className="neural-button text-xs sm:text-sm px-2 sm:px-4"
              >
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </Button>
            )}
          </div>
        </div>
        <p className="text-center text-muted-foreground text-xs sm:text-sm px-2">
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
                    <p className="text-muted-foreground">
                      {loadingMessage || "Processing your memory..."}
                    </p>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-0" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-150" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-300" />
                    </div>
                  </div>
                </div>
              )}
    </div>
  );
};