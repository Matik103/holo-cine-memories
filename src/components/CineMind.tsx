import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MemorySearch } from "./MemorySearch";
import { MovieCard, Movie } from "./MovieCard";
import { MovieCardSkeleton } from "./MovieCardSkeleton";
import { MovieExplanation } from "./MovieExplanation";
import { StreamingAvailability } from "./StreamingAvailability";
import { SimilarMovies } from "./SimilarMovies";
import { LandingPage } from "./LandingPage";
import { LoadingScreen } from "./LoadingScreen";
import { identifyMovie, explainMovie, getStreamingOptions, findSimilarMovies } from "@/lib/openai";
import { withAmazonPrime, type StreamingOption } from "@/lib/streaming";
import { validateSearchQuery } from "@/lib/validation";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { vaultService } from "@/services/vaultService";
import { supabase } from "@/integrations/supabase/client";
import { Brain, User, Compass, Menu, Settings, Vault, HelpCircle, Users } from "lucide-react";
import { CreateMysteryDialog } from "./mystery/CreateMysteryDialog";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

type ViewState = 'search' | 'movie-details' | 'explanation' | 'streaming' | 'similar-movies';

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
  const [failedSearch, setFailedSearch] = useState<{ query: string; aiSuggestions?: any } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const isOnline = useNetworkStatus();

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
        
        setShowLanding(false);
        setIsGuestMode(false);
        localStorage.removeItem('guestMode');
        localStorage.removeItem('skipLanding');
      } else {
        // No session: show landing only if not in guest mode (guest chose "Continue as Guest")
        if (localStorage.getItem('guestMode') !== 'true') {
          setShowLanding(true);
        }
        localStorage.removeItem('skipLanding');
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
        setIsGuestMode(false);
        localStorage.removeItem('guestMode');
        localStorage.removeItem('skipLanding');
      } else {
        // No session: keep guest in app, show landing for others
        if (localStorage.getItem('guestMode') !== 'true') {
          setShowLanding(true);
        }
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

  const handleStartJourney = () => {
    // Redirect to authentication page
    navigate("/auth");
  };


  const handleSearch = async (query: string) => {
    const validation = validateSearchQuery(query);
    if (!validation.valid) {
      toast({
        title: t('toast.invalidInput'),
        description: validation.error,
        variant: "destructive",
      });
      return;
    }
    
    const searchStartTime = Date.now();
    setIsLoading(true);
    setLoadingMessage(t('search.analyzingDescription'));
    setRetryCount(0);
    setFailedSearch(null);
    
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
      
      if (rawMovie && rawMovie.title && (rawMovie.confidence ?? 0) >= 0.45) {
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
        toast({
          title: t('toast.movieFound'),
          description: t('toast.movieIdentified', { title: movie.title, year: movie.year })
        });

        // Save search and CineDNA in background so UX feels faster
        if (user) {
          (async () => {
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
              if (searchError) console.error('Error saving search:', searchError);
              else {
                localStorage.setItem('refreshProfile', 'true');
                
                // Record search in vault
                try {
                  await vaultService.recordSearch(
                    user.id,
                    movie.title,
                    movie.year,
                    movie.genre
                  );
                  
                  // Check for new badges
                  const newBadges = await vaultService.checkAndUnlockBadges(user.id);
                  if (newBadges.length > 0) {
                    toast({
                      title: `🎉 ${t('toast.badgeUnlocked')}`,
                      description: t('toast.badgeEarned', { badges: newBadges.map(b => b.name).join(', ') }),
                    });
                  }
                } catch (vaultError) {
                  console.error('Vault integration error:', vaultError);
                }
                
                const { error: cineDNAError } = await supabase.functions.invoke('update-cinedna', { body: { userId: user.id } });
                if (cineDNAError) console.error('Error updating CineDNA:', cineDNAError);
              }
            } catch (e) {
              console.error('Failed to save search/CineDNA:', e);
            }
          })();
        }
      } else {
        console.log('No movie found or low confidence:', rawMovie);
        
        // Update analytics for unsuccessful search
        if (analyticsData) {
          analyticsData.success = false;
          analyticsData.confidence_score = rawMovie?.confidence || 0;
        }
        
        // Store failed search for "Ask Community" option
        setFailedSearch({
          query: query,
          aiSuggestions: rawMovie?.title ? { suggestedTitle: rawMovie.title, confidence: rawMovie.confidence } : null
        });
        
        // Show friendly message encouraging community help
        toast({
          title: t('toast.noExactMatch'),
          description: t('toast.communityHelp'),
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      
      // Update analytics for error case
      if (analyticsData) {
        analyticsData.success = false;
        analyticsData.search_duration_ms = Date.now() - searchStartTime;
      }
      
      // Always show the "Ask Community" option on any error
      setFailedSearch({
        query: query,
        aiSuggestions: null
      });
      
      // Show a friendly message encouraging community help
      toast({
        title: t('toast.aiNoMatch'),
        description: t('toast.communityCanHelp'),
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
    setLoadingMessage(t('search.explainMeaning'));
    
    try {
      const explanation = await explainMovie(currentMovie.title);
      if (explanation) {
        setMovieExplanation(explanation);
        setPreviousView('movie-details');
        setCurrentView('explanation');
        toast({
          title: t('toast.explanationReady'),
          description: t('toast.explanationComplete')
        });
      } else {
        toast({
          title: t('toast.noExplanation'),
          description: t('toast.noExplanationDesc'),
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
        title: t('toast.fallbackExplanation'),
        description: t('toast.fallbackExplanationDesc'),
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
    setLoadingMessage(t('search.whereToWatch'));
    
    try {
      let options: StreamingOption[] = [];
      try {
        const data = await getStreamingOptions(currentMovie.title);
        options = Array.isArray(data) ? data : (data?.streamingOptions ?? []);
      } catch {
        options = [];
      }
      const optionsWithAmazon = withAmazonPrime(options);
      setStreamingOptions(optionsWithAmazon);
      setPreviousView('movie-details');
      setCurrentView('streaming');
      if (optionsWithAmazon.length > 0) {
        toast({
          title: t('toast.whereToWatch'),
          description: options.length > 0
            ? t('toast.foundWaysToWatch', { count: optionsWithAmazon.length, title: currentMovie.title })
            : t('toast.checkAmazon'),
        });
      }
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
    setLoadingMessage(t('search.similarMovies'));
    
    try {
      // For now, we'll create a simple similar movies list based on genre and year
      // In a real implementation, you'd call an API or use a recommendation service
      const similarMoviesData = await findSimilarMovies(currentMovie);
      
      if (similarMoviesData && similarMoviesData.length > 0) {
        setSimilarMovies(similarMoviesData);
        setPreviousView('movie-details');
        setCurrentView('similar-movies');
        toast({
          title: t('toast.similarMoviesFound'),
          description: t('toast.foundSimilarMovies', { count: similarMoviesData.length, title: currentMovie.title })
        });
      } else {
        toast({
          title: t('toast.noSimilarMovies'),
          description: t('toast.noSimilarMoviesDesc'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Similar movies error:', error);
      
      let errorMessage = t('errors.generic');
      if (error instanceof Error) {
        if (error.message.includes('CORS')) {
          errorMessage = t('errors.server');
        } else if (error.message.includes('API')) {
          errorMessage = t('errors.server');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = t('errors.network');
        }
      }
      
      toast({
        title: t('toast.similarMoviesFailed'),
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
    <div className="min-h-screen p-2 sm:p-4 relative pt-safe-top">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground p-2 text-center z-50 text-sm">
          You're offline. Some features may not work.
        </div>
      )}
      
      {/* Background Neural Network Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/3 right-1/3 w-32 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <div className="floating-particle absolute top-20 right-20 w-2 h-2 bg-primary rounded-full opacity-30"></div>
        <div className="floating-particle absolute bottom-32 left-32 w-1 h-1 bg-accent rounded-full opacity-50 animation-delay-3s"></div>
      </div>

      {/* Header - safe area so title is not overlapped by notch on mobile */}
      <div className="max-w-6xl mx-auto mb-4 sm:mb-8 px-2 pt-safe-top pt-6 sm:pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CineMind
            </h1>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/mysteries")}
              className="flex items-center gap-1 hover:bg-secondary/60 text-xs px-1.5 sm:px-3 h-7 sm:h-8"
            >
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">{t('nav.mysteries')}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/vault")}
              className="flex items-center gap-1 hover:bg-secondary/60 text-xs px-1.5 sm:px-3 h-7 sm:h-8"
            >
              <Vault className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">{t('nav.vault')}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/discover")}
              className="flex items-center gap-1 hover:bg-secondary/60 text-xs px-1.5 sm:px-3 h-7 sm:h-8"
            >
              <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">{t('nav.discover')}</span>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1 px-1.5 sm:px-3 h-7 sm:h-8">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <Menu className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="w-4 h-4 mr-2" />
                    {t('nav.profileCineDNA')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="w-4 h-4 mr-2" />
                    {t('nav.settings')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => supabase.auth.signOut()}>
                    {t('nav.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <Button
                  onClick={() => navigate("/auth")}
                  variant="outline"
                  size="sm"
                  className="text-[10px] sm:text-xs px-1.5 sm:px-3 h-7 sm:h-8 whitespace-nowrap"
                >
                  {t('auth.signIn')}
                </Button>
                <Button
                  onClick={() => navigate("/auth")}
                  size="sm"
                  className="neural-button text-[10px] sm:text-xs px-1.5 sm:px-3 h-7 sm:h-8 whitespace-nowrap"
                >
                  {t('auth.signup')}
                </Button>
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-muted-foreground text-xs sm:text-sm px-2">
          {t('app.tagline')}
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {currentView === 'search' && (
          <div className="flex flex-col items-center justify-center space-y-8">
            <MemorySearch onSearch={handleSearch} isLoading={isLoading} />
            
            {/* Ask Community Card - shown after failed search */}
            {failedSearch && !isLoading && (
              <div className="w-full max-w-2xl mx-auto px-4">
                <div className="neural-card rounded-2xl p-4 sm:p-6 border-purple-500/30 bg-purple-500/5 relative">
                  <button 
                    onClick={() => setFailedSearch(null)}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-foreground p-1 text-xl leading-none"
                    aria-label={t('community.dismiss')}
                  >
                    ×
                  </button>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 rounded-full bg-purple-500/20 flex-shrink-0">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{t('community.cantFindIt')}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                        {t('community.movieDetectives')}
                      </p>
                      <CreateMysteryDialog
                        initialDescription={failedSearch.query}
                        originalSearchQuery={failedSearch.query}
                        aiSuggestions={failedSearch.aiSuggestions}
                        onSuccess={() => {
                          setFailedSearch(null);
                          navigate('/mysteries');
                        }}
                        trigger={
                          <Button className="neural-button gap-2 bg-purple-600 hover:bg-purple-700 text-sm sm:text-base px-3 sm:px-4 py-2 h-auto whitespace-nowrap">
                            <HelpCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{t('community.postMystery')}</span>
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'movie-details' && (
          <div className="space-y-6">
            {isLoading ? (
              <MovieCardSkeleton />
            ) : currentMovie ? (
              <>
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
              </>
            ) : null}
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
                      {loadingMessage || t('search.processingMemory')}
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