import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MemorySearch } from "./MemorySearch";
import { MovieCard, Movie } from "./MovieCard";
import { MovieExplanation } from "./MovieExplanation";
import { StreamingAvailability } from "./StreamingAvailability";
import { SimilarMovies } from "./SimilarMovies";
import { LandingPage } from "./LandingPage";
import { initializeOpenAI, identifyMovie, explainMovie, getStreamingOptions, findSimilarMovies } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, User, Compass, Menu, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { PrivacyPolicy } from "./PrivacyPolicy";
import { useAccessibility } from "@/contexts/AccessibilityContext";

type ViewState = 'search' | 'movie-details' | 'explanation' | 'streaming' | 'similar-movies';

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
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [previousView, setPreviousView] = useState<ViewState | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { settings } = useAccessibility();

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

  // Handle search query from navigation state (e.g., from Discover Movies)
  useEffect(() => {
    if (location.state?.searchQuery) {
      console.log('Received search query from navigation:', location.state.searchQuery);
      handleSearch(location.state.searchQuery);
      // Clear the state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.searchQuery]);

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
    
    // Clear previous state to prevent stale data
    setCurrentMovie(null);
    setMovieExplanation(null);
    setStreamingOptions([]);
    setSimilarMovies([]);
    
    try {
      console.log('Starting search for:', query);
      const rawMovie = await identifyMovie(query);
      console.log('Raw movie response:', rawMovie);
      
      if (rawMovie && rawMovie.title && rawMovie.confidence > 0.5) {
        // Transform the data to match MovieCard interface
        const movie: Movie = {
          title: rawMovie.title,
          year: rawMovie.year,
          director: rawMovie.director || 'Unknown Director',
          genre: rawMovie.genre || [],
          plot: rawMovie.plot || 'No plot available',
          poster: (rawMovie as any).poster_url || undefined,
          trailer: (rawMovie as any).trailer_url || undefined,
          runtime: rawMovie.runtime || undefined,
          cast: rawMovie.cast || [],
          imdbRating: rawMovie.imdbRating || undefined
        };
        
        console.log('Transformed movie data:', movie);
        console.log('Poster URL:', movie.poster);
        console.log('Trailer URL:', movie.trailer);
        
        setCurrentMovie(movie);
        setCurrentView('movie-details');
        toast({
          title: "Movie Found!",
          description: `Identified: ${movie.title} (${movie.year})`
        });
      } else {
        console.log('No movie found or low confidence:', rawMovie);
        // Handle case where API returns null title or low confidence
        if (rawMovie && rawMovie.title === null) {
          toast({
            title: "No Match Found",
            description: "Couldn't identify a movie from your description. Try being more specific or describing key scenes, actors, or plot points.",
            variant: "destructive"
        });
      } else {
        toast({
          title: "No Match Found",
          description: "Try describing the movie differently or with more details.",
          variant: "destructive"
        });
        }
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
        setPreviousView('movie-details');
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
        } else if (error.message.includes('FunctionsHttpError')) {
          errorMessage = "Service temporarily unavailable. Please try again in a moment.";
        } else if (error.message.includes('Invalid response format')) {
          errorMessage = "AI response format error. Please try again.";
        }
      }
      
      // Set a fallback explanation to prevent the user from being stuck
      setMovieExplanation({
        simple: "This movie explores complex themes and storytelling techniques that make it engaging for audiences.",
        detailed: "The film presents a multi-layered narrative that examines human nature, relationships, and the human condition through its characters and plot development.",
        symbolism: "The movie uses various symbolic elements and metaphors to convey deeper meanings about life, society, and the human experience."
      });
      setPreviousView('movie-details');
      setCurrentView('explanation');
      
      toast({
        title: "Using Fallback Explanation",
        description: "AI service temporarily unavailable. Showing a general explanation instead.",
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
        setPreviousView('movie-details');
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
    // Go back to the previous view, or movie-details if no previous view
    const targetView = previousView || 'movie-details';
    setCurrentView(targetView);
    setMovieExplanation(null);
    setStreamingOptions([]);
    if (targetView !== 'similar-movies') {
      setSimilarMovies([]);
    }
    setPreviousView(null);
  };

  const handleFindSimilarMovies = async () => {
    if (!currentMovie) return;
    
    setIsLoading(true);
    setLoadingMessage("Finding similar movies...");
    
    try {
      // For now, we'll create a simple similar movies list based on genre and year
      // In a real implementation, you'd call an API or use a recommendation service
      const similarMoviesData = await findSimilarMovies(currentMovie);
      
      if (similarMoviesData && similarMoviesData.length > 0) {
        setSimilarMovies(similarMoviesData);
        setPreviousView('movie-details');
        setCurrentView('similar-movies');
        toast({
          title: "Similar Movies Found!",
          description: `Found ${similarMoviesData.length} movies similar to ${currentMovie.title}`
        });
      } else {
        toast({
          title: "No Similar Movies",
          description: "No similar movies found for this movie.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Similar movies error:', error);
      
      let errorMessage = "Failed to find similar movies. Please try again.";
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
        title: "Similar Movies Search Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
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
    <div 
      className={`min-h-screen p-2 sm:p-4 relative ${settings.highContrast ? 'high-contrast' : ''} ${settings.largeTouchTargets ? 'large-touch-targets' : ''} ${settings.reducedMotion ? 'reduced-motion' : ''}`}
      role="application" 
      aria-label="CineMind movie identification app"
      style={{ '--text-scale': settings.textSize } as React.CSSProperties}
    >
      {/* Background Neural Network Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/3 right-1/3 w-32 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <div className="floating-particle absolute top-20 right-20 w-2 h-2 bg-primary rounded-full opacity-30"></div>
        <div className="floating-particle absolute bottom-32 left-32 w-1 h-1 bg-accent rounded-full opacity-50 animation-delay-3s"></div>
      </div>

      {/* Header */}
      <header className="max-w-6xl mx-auto mb-4 sm:mb-8 px-2" role="banner">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-primary" aria-hidden="true" />
            <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CineMind
            </h1>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2" role="navigation" aria-label="Main navigation">
            <Button
              variant="ghost"
              onClick={() => navigate("/discover")}
              className="flex items-center gap-1 sm:gap-2 hover:bg-secondary/60 text-xs sm:text-sm px-2 sm:px-4 min-h-[44px]"
              aria-label="Navigate to Discover Movies page"
              role="button"
              tabIndex={0}
            >
              <Compass className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Discover</span>
            </Button>

            {user ? (
              <DropdownMenu role="menu" aria-label="User account menu">
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 min-h-[44px]"
                    aria-label="Open user menu"
                    role="button"
                    tabIndex={0}
                  >
                    <User className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                    <Menu className="w-2 h-2 sm:w-3 sm:h-3" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" role="menu" aria-label="User menu">
                  <DropdownMenuItem 
                    onClick={() => navigate("/profile")}
                    role="menuitem"
                    tabIndex={0}
                    aria-label="Navigate to Profile & CineDNA page"
                  >
                    <User className="w-4 h-4 mr-2" aria-hidden="true" />
                    Profile & CineDNA
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/settings")}
                    role="menuitem"
                    tabIndex={0}
                    aria-label="Navigate to Settings page"
                  >
                    <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => supabase.auth.signOut()}
                    role="menuitem"
                    tabIndex={0}
                    aria-label="Sign out of account"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                className="neural-button text-xs sm:text-sm px-2 sm:px-4 min-h-[44px]"
                aria-label="Sign in to CineMind"
                role="button"
                tabIndex={0}
              >
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </Button>
            )}
          </nav>
        </div>
        <p className="text-center text-muted-foreground text-xs sm:text-sm px-2">
          Your Personal AI Movie Memory Companion
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto" role="main" aria-label="Main content">
        {currentView === 'search' && (
          <section className="flex flex-col items-center justify-center space-y-8" aria-label="Movie search section">
            <MemorySearch onSearch={handleSearch} isLoading={isLoading} />
          </section>
        )}

        {currentView === 'movie-details' && currentMovie && (
          <section className="space-y-6" aria-label="Movie details section">
            <MovieCard
              movie={currentMovie}
              onExplainMeaning={handleExplainMeaning}
              onFindWhereToWatch={handleFindWhereToWatch}
              onFindSimilarMovies={handleFindSimilarMovies}
            />
            <div className="flex justify-center">
              <button
                onClick={handleBackToSearch}
                className="text-muted-foreground hover:text-foreground transition-colors min-h-[44px] px-4 py-2 rounded-lg hover:bg-secondary/30"
                aria-label="Return to search page"
                role="button"
                tabIndex={0}
              >
                ← Back to Search
              </button>
            </div>
          </section>
        )}

        {currentView === 'explanation' && movieExplanation && currentMovie && (
          <section aria-label="Movie explanation section">
          <MovieExplanation
            movieTitle={currentMovie.title}
            explanation={movieExplanation}
            onBack={handleBackToMovie}
          />
          </section>
        )}

        {currentView === 'streaming' && currentMovie && (
          <section aria-label="Streaming availability section">
          <StreamingAvailability
            movieTitle={currentMovie.title}
            options={streamingOptions}
            onBack={handleBackToMovie}
          />
          </section>
        )}

        {currentView === 'similar-movies' && currentMovie && (
          <section aria-label="Similar movies section">
            <SimilarMovies
              originalMovie={currentMovie}
              similarMovies={similarMovies}
              onBack={handleBackToMovie}
              onMovieSearch={(query) => {
                // Go back to search view and trigger a search
                setCurrentView('search');
                handleSearch(query);
              }}
            />
          </section>
        )}
      </main>

              {/* Loading Overlay */}
              {isLoading && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          role="status"
          aria-live="polite"
          aria-label="Loading content"
        >
                  <div className="neural-card p-8 flex flex-col items-center space-y-4">
            <div 
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            />
                    <p className="text-muted-foreground">
                      {loadingMessage || "Processing your memory..."}
                    </p>
            <div className="flex space-x-1" aria-hidden="true">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-0" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-150" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-300" />
                    </div>
                  </div>
                </div>
              )}

      {/* Footer */}
      <footer className="mt-8 py-4 border-t border-border/50" role="contentinfo">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>© 2024 CineMind</span>
            <span>•</span>
            <span>AI Movie Memory Companion</span>
            <span>•</span>
            <Button 
              variant="link" 
              className="text-xs p-0 h-auto"
              onClick={() => navigate("/settings")}
            >
              Settings
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};