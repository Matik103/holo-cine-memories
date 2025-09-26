import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MemorySearch } from "./MemorySearch";
import { MovieCard, Movie } from "./MovieCard";
import { MovieExplanation } from "./MovieExplanation";
import { StreamingAvailability } from "./StreamingAvailability";
import { SimilarMovies } from "./SimilarMovies";
import { LandingPage } from "./LandingPage";
import { LoadingScreen } from "./LoadingScreen";
import { initializeOpenAI, identifyMovie, explainMovie, getStreamingOptions, findSimilarMovies } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, User, Compass, Menu, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

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
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
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

  useEffect(() => {
    // Check for guest mode
    const guestMode = localStorage.getItem('guestMode') === 'true';
    if (guestMode) {
      setIsGuestMode(true);
    }

    // Check if user wants to skip landing page
    const skipLanding = localStorage.getItem('skipLanding') === 'true';
    if (skipLanding) {
      setShowLanding(false);
    }

    // Set a minimum loading time for better UX
    const minLoadingTime = 1500; // 1.5 seconds
    const startTime = Date.now();
    
    const finishLoading = () => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsed);
      
      setTimeout(() => {
        setIsAppLoading(false);
      }, remainingTime);
    };

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
        setIsGuestMode(false); // Clear guest mode when user signs in
        localStorage.removeItem('guestMode'); // Clear guest mode flag
        localStorage.removeItem('skipLanding'); // Clear skip landing flag
        // Initialize OpenAI with the main API key from Supabase
        initializeOpenAIFromSupabase();
      }
      
      // Finish loading when auth state is determined
      finishLoading();
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
        setIsGuestMode(false); // Clear guest mode when user signs in
        localStorage.removeItem('guestMode'); // Clear guest mode flag
        localStorage.removeItem('skipLanding'); // Clear skip landing flag
        initializeOpenAIFromSupabase();
      }
      
      // Finish loading when initial session is checked
      finishLoading();
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
    const searchStartTime = Date.now();
    setIsLoading(true);
    setLoadingMessage("Analyzing your description...");
    setRetryCount(0);
    
    // Clear previous state to prevent stale data
    setCurrentMovie(null);
    setMovieExplanation(null);
    setStreamingOptions([]);
    setSimilarMovies([]);
    
    // Prepare analytics data (only for authenticated users)
    let analyticsData = user ? {
      user_id: user.id,
      query_text: query,
      query_type: 'text' as const,
      search_result: null as any,
      success: false,
      confidence_score: null as number | null,
      movie_identified: null as string | null,
      movie_year: null as number | null,
      genres: null as string[] | null,
      search_duration_ms: null as number | null,
      user_agent: navigator.userAgent
    } : null;
    
    try {
      console.log('Starting search for:', query);
      const rawMovie = await identifyMovie(query);
      console.log('Raw movie response:', rawMovie);
      
      const searchDuration = Date.now() - searchStartTime;
      if (analyticsData) {
        analyticsData.search_duration_ms = searchDuration;
        analyticsData.search_result = rawMovie;
      }
      
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
        
        // Update analytics data with successful result
        if (analyticsData) {
          analyticsData.success = true;
          analyticsData.confidence_score = rawMovie.confidence;
          analyticsData.movie_identified = movie.title;
          analyticsData.movie_year = movie.year;
          analyticsData.genres = movie.genre;
        }
        
        setCurrentMovie(movie);
        setCurrentView('movie-details');
        
        // Save the search to the database
        if (user) {
          try {
            const { error: searchError } = await supabase
              .from('movie_searches')
              .insert({
                user_id: user.id,
                search_query: query,
                movie_title: movie.title,
                movie_year: movie.year,
                movie_poster_url: movie.poster,
                movie_plot: movie.plot
              });
            
            if (searchError) {
              console.error('Error saving search:', searchError);
            } else {
              console.log('Search saved successfully to database');
              // Set flag to refresh profile page when user visits it next
              localStorage.setItem('refreshProfile', 'true');
              
              // Also trigger CineDNA update immediately
              try {
                const { error: cineDNAError } = await supabase.functions.invoke('update-cinedna', {
                  body: { userId: user.id }
                });
                
                if (cineDNAError) {
                  console.error('Error updating CineDNA:', cineDNAError);
                } else {
                  console.log('CineDNA updated successfully after search');
                }
              } catch (error) {
                console.error('Failed to update CineDNA:', error);
              }
            }
          } catch (error) {
            console.error('Failed to save search to database:', error);
          }
        }
        
        toast({
          title: "Movie Found!",
          description: `Identified: ${movie.title} (${movie.year})`
        });
      } else {
        console.log('No movie found or low confidence:', rawMovie);
        
        // Update analytics for unsuccessful search
        if (analyticsData) {
          analyticsData.success = false;
          analyticsData.confidence_score = rawMovie?.confidence || 0;
        }
        
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
      
      // Update analytics for error case
      if (analyticsData) {
        analyticsData.success = false;
        analyticsData.search_duration_ms = Date.now() - searchStartTime;
      }
      
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
      // Save analytics data regardless of success/failure
      if (user && analyticsData && analyticsData.user_id) {
        try {
          const { error: analyticsError } = await supabase
            .from('user_query_analytics')
            .insert(analyticsData);
          
          if (analyticsError) {
            console.error('Error saving analytics:', analyticsError);
          } else {
            console.log('Analytics data saved successfully');
          }
        } catch (error) {
          console.error('Failed to save analytics:', error);
        }
      }
      
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

  // Show loading screen while app is initializing
  if (isAppLoading) {
    return <LoadingScreen />;
  }

  // Check if this is a password reset session
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const isPasswordReset = urlParams.get('type') === 'recovery' || 
                         urlParams.get('reset') === 'true' ||
                         hashParams.get('type') === 'recovery' ||
                         hashParams.has('access_token');

  // Show landing page only for password reset sessions
  if (isPasswordReset) {
    return <LandingPage onStart={handleStartJourney} />;
  }

  // Show landing page if showLanding is true (for all users initially)
  if (showLanding) {
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
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => supabase.auth.signOut()}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigate("/auth")}
                  variant="outline"
                  className="text-xs sm:text-sm px-2 sm:px-4"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate("/auth")}
                  className="neural-button text-xs sm:text-sm px-2 sm:px-4"
                >
                  Sign Up
                </Button>
              </div>
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
              onFindSimilarMovies={handleFindSimilarMovies}
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

        {currentView === 'similar-movies' && currentMovie && (
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