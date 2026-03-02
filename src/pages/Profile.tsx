import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShareMovieMenu } from "@/components/ShareMovieMenu";
import { User, Brain, Film, Heart, ArrowLeft, LogOut, RefreshCw, Settings, Check, List, MessageSquare, Pencil } from "lucide-react";
import { scrollInputIntoView } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { translationService } from "@/services/translationService";

interface MovieSearch {
  id: string;
  search_query: string;
  movie_title: string;
  movie_year: number;
  movie_poster_url: string;
  movie_plot?: string;
  created_at: string;
}

interface FavoriteMovie {
  id: string;
  movie_title: string;
  movie_year: number;
  movie_poster_url: string;
  rating: number | null;
  is_watched: boolean;
  review: string | null;
  review_updated_at: string | null;
  created_at: string;
}

type WatchlistFilter = "all" | "want-to-watch" | "watched";

interface UserProfile {
  display_name: string;
  avatar_url?: string;
}

interface UserPreferences {
  favorite_genres: string[];
  preferred_mood: string;
  cinedna_score: any;
}

const PAGE_SIZE = 10;

export const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [movieSearches, setMovieSearches] = useState<MovieSearch[]>([]);
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [hasMoreSearches, setHasMoreSearches] = useState(true);
  const [hasMoreFavorites, setHasMoreFavorites] = useState(true);
  const [loadingMoreSearches, setLoadingMoreSearches] = useState(false);
  const [loadingMoreFavorites, setLoadingMoreFavorites] = useState(false);
  const [watchlistFilter, setWatchlistFilter] = useState<WatchlistFilter>("all");
  const [updatingFavoriteId, setUpdatingFavoriteId] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewDraft, setReviewDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [translatedPlots, setTranslatedPlots] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language?.split('-')[0] || 'en';

  const filteredFavorites =
    watchlistFilter === "all"
      ? favorites
      : watchlistFilter === "watched"
        ? favorites.filter((f) => f.is_watched)
        : favorites.filter((f) => !f.is_watched);
  const wantCount = favorites.filter((f) => !f.is_watched).length;
  const watchedCount = favorites.filter((f) => f.is_watched).length;

  // Add a refresh function that can be called from outside
  const refreshProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setUser(user);

      // Fetch all data in parallel (first page of lists)
      const [profileRes, preferencesRes, searchesRes, favoritesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('user_preferences').select('*').eq('user_id', user.id).single(),
        supabase.from('movie_searches').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).range(0, PAGE_SIZE - 1),
        supabase.from('favorites').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).range(0, PAGE_SIZE - 1)
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (preferencesRes.data) setPreferences(preferencesRes.data);
      if (searchesRes.data) {
        setMovieSearches(searchesRes.data);
        setHasMoreSearches(searchesRes.data.length === PAGE_SIZE);
      }
      if (favoritesRes.data) {
        setFavorites(favoritesRes.data);
        setHasMoreFavorites(favoritesRes.data.length === PAGE_SIZE);
      }

    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: t('common.error'),
        description: t('profile.errorLoadingData'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const translatePlots = async () => {
      if (currentLanguage === 'en') {
        const plots: Record<string, string> = {};
        movieSearches.forEach(search => {
          if (search.movie_plot) plots[search.id] = search.movie_plot;
        });
        setTranslatedPlots(plots);
        return;
      }
      
      const plots: Record<string, string> = {};
      await Promise.all(
        movieSearches.map(async (search) => {
          if (search.movie_plot) {
            try {
              const translated = await translationService.translateText(search.movie_plot, currentLanguage);
              if (mounted) plots[search.id] = translated;
            } catch {
              plots[search.id] = search.movie_plot;
            }
          }
        })
      );
      
      if (mounted) setTranslatedPlots(plots);
    };

    translatePlots();
    
    return () => { mounted = false; };
  }, [movieSearches, currentLanguage]);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/auth");
          return;
        }

        setUser(user);

        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }

        // Fetch user preferences
        const { data: preferencesData } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (preferencesData) {
          setPreferences(preferencesData);
        }

        // Fetch movie searches (first page)
        const { data: searchesData } = await supabase
          .from('movie_searches')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(0, PAGE_SIZE - 1);

        if (searchesData) {
          setMovieSearches(searchesData);
          setHasMoreSearches(searchesData.length === PAGE_SIZE);
        }

        // Fetch favorites (first page)
        const { data: favoritesData } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(0, PAGE_SIZE - 1);

        if (favoritesData) {
          setFavorites(favoritesData);
          setHasMoreFavorites(favoritesData.length === PAGE_SIZE);
        }

      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: t('common.error'),
          description: t('profile.errorLoadingData'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [navigate, toast, t]);

  // Listen for focus events to refresh data when user comes back to the profile
  useEffect(() => {
    const handleFocus = () => {
      console.log('Profile page focused, refreshing data...');
      refreshProfile();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Also refresh when navigating to this page
  useEffect(() => {
    // Check if we came from a search by looking at localStorage
    const shouldRefresh = localStorage.getItem('refreshProfile');
    if (shouldRefresh) {
      localStorage.removeItem('refreshProfile');
      refreshProfile();
    }
  }, []);

  const loadMoreSearches = async () => {
    if (!user || loadingMoreSearches || !hasMoreSearches) return;
    setLoadingMoreSearches(true);
    try {
      const { data } = await supabase
        .from('movie_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(movieSearches.length, movieSearches.length + PAGE_SIZE - 1);
      if (data?.length) {
        setMovieSearches((prev) => [...prev, ...data]);
        setHasMoreSearches(data.length === PAGE_SIZE);
      } else {
        setHasMoreSearches(false);
      }
    } catch (e) {
      toast({ title: t('common.error'), description: t('profile.errorLoadingMore'), variant: "destructive" });
    } finally {
      setLoadingMoreSearches(false);
    }
  };

  const loadMoreFavorites = async () => {
    if (!user || loadingMoreFavorites || !hasMoreFavorites) return;
    setLoadingMoreFavorites(true);
    try {
      const { data } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(favorites.length, favorites.length + PAGE_SIZE - 1);
      if (data?.length) {
        setFavorites((prev) => [...prev, ...data]);
        setHasMoreFavorites(data.length === PAGE_SIZE);
      } else {
        setHasMoreFavorites(false);
      }
    } catch (e) {
      toast({ title: t('common.error'), description: t('profile.errorLoadingMore'), variant: "destructive" });
    } finally {
      setLoadingMoreFavorites(false);
    }
  };

  const updateFavoriteWatched = async (id: string, isWatched: boolean) => {
    if (!user) return;
    setUpdatingFavoriteId(id);
    try {
      const { error } = await supabase.from("favorites").update({ is_watched: isWatched }).eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      setFavorites((prev) => prev.map((f) => (f.id === id ? { ...f, is_watched: isWatched } : f)));
      toast({ title: isWatched ? t('profile.markedAsWatched') : t('profile.markedAsWantToWatch') });
    } catch (e) {
      toast({ title: t('common.error'), description: t('profile.errorCouldNotUpdate'), variant: "destructive" });
    } finally {
      setUpdatingFavoriteId(null);
    }
  };

  const updateFavoriteRating = async (id: string, rating: number) => {
    if (!user) return;
    setUpdatingFavoriteId(id);
    try {
      const { error } = await supabase.from("favorites").update({ rating }).eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      setFavorites((prev) => prev.map((f) => (f.id === id ? { ...f, rating } : f)));
      toast({ title: t('profile.ratingSaved') });
    } catch (e) {
      toast({ title: t('common.error'), description: t('profile.errorCouldNotSaveRating'), variant: "destructive" });
    } finally {
      setUpdatingFavoriteId(null);
    }
  };

  const updateFavoriteReview = async (id: string, review: string) => {
    if (!user) return;
    setUpdatingFavoriteId(id);
    try {
      const { error } = await supabase
        .from("favorites")
        .update({ review: review.trim() || null, review_updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      setFavorites((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, review: review.trim() || null, review_updated_at: new Date().toISOString() } : f
        )
      );
      setEditingReviewId(null);
      setReviewDraft("");
      toast({ title: t('profile.reviewSaved') });
    } catch (e) {
      toast({ title: t('common.error'), description: t('profile.errorCouldNotSaveReview'), variant: "destructive" });
    } finally {
      setUpdatingFavoriteId(null);
    }
  };

  const startEditingReview = (favorite: FavoriteMovie) => {
    setEditingReviewId(favorite.id);
    setReviewDraft(favorite.review ?? "");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("skipLanding");
    navigate("/");
  };

  const refreshCineDNA = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('update-cinedna', {
        body: { userId: user.id }
      });

      if (error) {
        console.error('Error updating CineDNA:', error);
        toast({
          title: t('common.error'),
          description: t('profile.errorUpdatingCineDNA'),
          variant: "destructive",
        });
        return;
      }

      // Refresh the preferences data
      const { data: preferencesData } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (preferencesData) {
        setPreferences(preferencesData);
        toast({
          title: t('profile.cineDNAUpdated'),
          description: t('profile.cineDNARefreshed'),
        });
      }
    } catch (error) {
      console.error('Error refreshing CineDNA:', error);
      toast({
        title: t('common.error'),
        description: t('profile.errorRefreshingCineDNA'),
        variant: "destructive",
      });
    }
  };

  const calculateCineDNAProgress = () => {
    const searchCount = movieSearches.length;
    const cinednaScore = preferences?.cinedna_score;
    
    // Use CineDNA score data if available (more accurate)
    if (cinednaScore && typeof cinednaScore === 'object') {
      const totalSearches = cinednaScore.total_searches || searchCount;
      const favoriteGenres = cinednaScore.favorite_genres || [];
      const genreScores = cinednaScore.genre_scores || {};
      const decadePreferences = cinednaScore.decade_preferences || {};
      
      const genreCount = Object.keys(genreScores).length || favoriteGenres.length;
      const decadeCount = Object.keys(decadePreferences).length;
      
      // Enhanced algorithm that considers multiple factors
      // Base score from searches (faster growth initially, then slower)
      const searchScore = totalSearches <= 5 
        ? totalSearches * 12  // Fast growth for first 5 searches
        : 60 + (totalSearches - 5) * 6; // Slower growth after 5
      
      // Genre diversity bonus (encourage exploring different genres)
      const genreScore = genreCount <= 6 
        ? genreCount * 4 
        : 24 + (genreCount - 6) * 2;
      
      // Decade exploration bonus
      const decadeScore = decadeCount * 3;
      
      // Total score with gentle curve
      const totalScore = searchScore + genreScore + decadeScore;
      
      // Convert to percentage (aiming for ~90% at 10 searches + 8 genres + 3 decades)
      return Math.floor(Math.min(totalScore * 0.7, 95));
    }
    
    // Fallback calculation for basic data
    const basicScore = searchCount * 8 + (preferences?.favorite_genres?.length || 0) * 4;
    return Math.floor(Math.min(basicScore * 0.8, 85));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 relative pt-safe-top">
      {/* Background Neural Network Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/3 right-1/3 w-32 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-2 pt-6 sm:pt-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm sm:text-base">{t('profile.backToCineMind')}</span>
          </Button>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/settings")}
              className="flex items-center gap-2 text-sm sm:text-base"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.settings')}</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.signOut')}</span>
              <span className="sm:hidden">{t('profile.logout')}</span>
            </Button>
          </div>
        </div>

        {/* Profile Header */}
        <Card className="neural-card p-4 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center neural-glow">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent break-words">
                {profile?.display_name || user?.email || t('profile.movieExplorer')}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                {t('profile.memberSince')} {new Date(user?.created_at).toLocaleDateString(currentLanguage)}
              </p>
            </div>
          </div>
        </Card>

        {/* CineDNA Profile */}
        <Card className="neural-card p-4 sm:p-8 mb-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-xl sm:text-2xl font-bold">{t('profile.yourCineDNAProfile')}</h2>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshCineDNA}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">{t('common.refresh')}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4">{t('profile.movieMemoryProgress')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base">{t('profile.memoryBankCompletion')}</span>
                  <span className="font-bold text-primary text-sm sm:text-base">{calculateCineDNAProgress()}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 sm:h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-primary to-accent h-2 sm:h-3 rounded-full neural-glow transition-all duration-1000 ease-out"
                    style={{ width: `${calculateCineDNAProgress()}%` }}
                  />
                </div>
                
                {/* Enhanced Progress Insights */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4">
                  <div className="text-center p-2 sm:p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="text-xl sm:text-2xl font-bold text-primary">{movieSearches.length}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{t('profile.moviesRecalled')}</div>
                    {movieSearches.length > 0 && (
                      <div className="text-xs text-primary mt-1">
                        +{movieSearches.filter(s => {
                          const dayAgo = new Date();
                          dayAgo.setDate(dayAgo.getDate() - 1);
                          return new Date(s.created_at) > dayAgo;
                        }).length} {t('profile.today')}
                      </div>
                    )}
                  </div>
                  <div className="text-center p-2 sm:p-3 rounded-lg bg-accent/5 border border-accent/10">
                    <div className="text-xl sm:text-2xl font-bold text-accent">
                      {(() => {
                        // Try cinedna_score first (new format), then fall back to favorite_genres (old format)
                        const cinednaScore = preferences?.cinedna_score;
                        if (cinednaScore && typeof cinednaScore === 'object') {
                          const genreScores = cinednaScore.genre_scores || {};
                          const favoriteGenres = cinednaScore.favorite_genres || [];
                          return Object.keys(genreScores).length || favoriteGenres.length;
                        }
                        if (Array.isArray(preferences?.favorite_genres)) {
                          return preferences.favorite_genres.length;
                        }
                        return 0;
                      })()}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{t('profile.genresExplored')}</div>
                    {preferences?.cinedna_score?.decade_preferences && (
                      <div className="text-xs text-accent mt-1">
                        {Object.keys(preferences.cinedna_score.decade_preferences).length} {t('profile.decadesExplored')}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress Level Indicator */}
                <div className="mt-4 p-2 sm:p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-xs sm:text-sm font-medium">{t('profile.cineDNALevel')}</span>
                    <Badge variant="secondary" className="bg-gradient-to-r from-primary to-accent text-primary-foreground self-start sm:self-auto">
                      {calculateCineDNAProgress() < 20 ? t('profile.level.novice') : 
                       calculateCineDNAProgress() < 40 ? t('profile.level.explorer') :
                       calculateCineDNAProgress() < 60 ? t('profile.level.enthusiast') :
                       calculateCineDNAProgress() < 80 ? t('profile.level.connoisseur') : t('profile.level.master')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
                <span>{t('profile.preferredGenres')}</span>
                {(() => {
                  const cinednaScore = preferences?.cinedna_score;
                  const genreCount = cinednaScore?.favorite_genres?.length || preferences?.favorite_genres?.length || 0;
                  return genreCount > 0 && (
                    <Badge variant="outline" className="text-xs self-start sm:self-auto">{genreCount} {t('profile.discovered')}</Badge>
                  );
                })()}
              </h3>
              <div className="space-y-3">
                {(() => {
                  // Get genres with their scores for ranking
                  const cinednaScore = preferences?.cinedna_score;
                  let genresWithScores = [];
                  
                  if (cinednaScore && typeof cinednaScore === 'object') {
                    if (cinednaScore.genre_scores && typeof cinednaScore.genre_scores === 'object') {
                      // New format: has genre scores
                      genresWithScores = Object.entries(cinednaScore.genre_scores)
                        .map(([genre, score]) => ({ genre, score: Number(score) }))
                        .sort((a, b) => b.score - a.score);
                    } else if (Array.isArray(cinednaScore.favorite_genres)) {
                      // New format: just favorite genres array
                      genresWithScores = cinednaScore.favorite_genres.map(genre => ({ genre, score: 50 }));
                    }
                  } else if (Array.isArray(preferences?.favorite_genres)) {
                    // Old format: just favorite genres array
                    genresWithScores = preferences.favorite_genres.map(genre => ({ genre, score: 50 }));
                  }
                  
                  if (genresWithScores.length === 0) {
                    return (
                      <div className="text-center py-6 px-4 rounded-lg bg-secondary/20 border-2 border-dashed border-secondary">
                        <Film className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground italic text-sm">
                          {t('profile.keepSearchingGenres')}
                        </p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-2">
                      {genresWithScores.slice(0, 8).map(({ genre, score }, index) => {
                        const isTopGenre = index < 3;
                        const percentage = Math.min(score, 100);
                        return (
                          <div key={genre} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors">
                            <div className="flex items-center gap-2 flex-1">
                              <div className={`w-2 h-2 rounded-full ${isTopGenre ? 'bg-primary' : 'bg-accent'}`} />
                              <Badge 
                                variant={isTopGenre ? "secondary" : "outline"} 
                                className={`${isTopGenre ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary/50'}`}
                              >
                                {genre}
                              </Badge>
                              {index === 0 && <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">{t('profile.topChoice')}</Badge>}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${isTopGenre ? 'bg-primary' : 'bg-accent'}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-8">{percentage}%</span>
                            </div>
                          </div>
                        );
                      })}
                      
                      {genresWithScores.length > 8 && (
                        <div className="text-center pt-2">
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            +{genresWithScores.length - 8} {t('profile.moreGenresDiscovered')}
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
              
              {/* Mood Analysis */}
              {preferences?.cinedna_score?.mood_preferences && Object.keys(preferences.cinedna_score.mood_preferences).length > 0 && (
                <div className="mt-6 pt-4 border-t border-secondary">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    {t('profile.moodPatterns')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(preferences.cinedna_score.mood_preferences)
                      .sort(([,a], [,b]) => (Number(b) || 0) - (Number(a) || 0))
                      .slice(0, 4)
                      .map(([mood, score]) => (
                        <Badge key={mood} variant="outline" className="bg-accent/10 text-accent border-accent/20">
                          {mood} ({Math.round(Number(score) || 0)}%)
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Watchlist / My Favorite Movies */}
        {favorites.length > 0 && (
          <Card className="neural-card p-4 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">{t('profile.watchlist')}</h2>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {favorites.length}
                </Badge>
              </div>
              <div className="flex rounded-lg bg-secondary/50 p-1 gap-0.5" role="tablist" aria-label={t('profile.filterWatchlist')}>
                {([
                  { value: "all" as const, labelKey: "profile.filter.all", count: favorites.length },
                  { value: "want-to-watch" as const, labelKey: "profile.filter.wantToWatch", count: wantCount },
                  { value: "watched" as const, labelKey: "profile.filter.watched", count: watchedCount },
                ]).map(({ value, labelKey, count }) => (
                  <button
                    key={value}
                    role="tab"
                    aria-selected={watchlistFilter === value}
                    onClick={() => setWatchlistFilter(value)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors touch-manipulation ${
                      watchlistFilter === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t(labelKey)} ({count})
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4">
              {filteredFavorites.map((favorite) => (
                <div 
                  key={favorite.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto flex-1 min-w-0">
                    {favorite.movie_poster_url && (
                      <img
                        src={favorite.movie_poster_url}
                        alt={favorite.movie_title}
                        loading="lazy"
                        decoding="async"
                        className="w-16 h-20 sm:w-12 sm:h-16 object-cover rounded flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base">
                        {favorite.movie_title} 
                        {favorite.movie_year && (
                          <span className="text-muted-foreground ml-1 sm:ml-2 text-xs sm:text-sm">({favorite.movie_year})</span>
                        )}
                      </h4>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                        <div className="flex items-center gap-1" title={t('profile.yourRating')}>
                          <span className="text-xs text-muted-foreground sr-only sm:not-sr-only">{t('profile.rate')}:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => updateFavoriteRating(favorite.id, star)}
                              disabled={updatingFavoriteId === favorite.id}
                              className="p-0.5 rounded touch-manipulation disabled:opacity-50"
                              aria-label={t('profile.rateOutOf5', { star })}
                            >
                              <Heart
                                className={`w-3 h-3 sm:w-3 sm:h-3 ${
                                  (favorite.rating ?? 0) >= star ? "fill-primary text-primary" : "text-muted-foreground"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        {favorite.is_watched && (
                          <Badge variant="outline" className="text-xs">
                            {t('profile.filter.watched')}
                          </Badge>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {t('profile.added')} {new Date(favorite.created_at).toLocaleDateString(currentLanguage)}
                        </p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateFavoriteWatched(favorite.id, !favorite.is_watched)}
                          disabled={updatingFavoriteId === favorite.id}
                          className="text-xs h-8"
                          aria-label={favorite.is_watched ? t('profile.markAsWantToWatch') : t('profile.markAsWatched')}
                        >
                          {favorite.is_watched ? (
                            <>
                              <List className="w-3 h-3 mr-1" />
                              {t('profile.wantToWatch')}
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              {t('profile.markWatched')}
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditingReview(favorite)}
                          className="text-xs h-8"
                          aria-label={favorite.review ? t('profile.editReview') : t('profile.writeReview')}
                        >
                          {favorite.review ? <Pencil className="w-3 h-3 mr-1" /> : <MessageSquare className="w-3 h-3 mr-1" />}
                          {favorite.review ? t('profile.editReview') : t('profile.writeReview')}
                        </Button>
                        <ShareMovieMenu
                          title={favorite.movie_title}
                          year={favorite.movie_year}
                          variant="ghost"
                          size="sm"
                          triggerClassName="text-xs h-8"
                        />
                      </div>
                      {editingReviewId === favorite.id ? (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            value={reviewDraft}
                            onChange={(e) => setReviewDraft(e.target.value)}
                            onFocus={(e) => scrollInputIntoView(e.target)}
                            placeholder={t('profile.reviewPlaceholder')}
                            className="min-h-[80px] text-sm resize-y"
                            maxLength={2000}
                            aria-label={t('profile.yourReview')}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateFavoriteReview(favorite.id, reviewDraft)}
                              disabled={updatingFavoriteId === favorite.id}
                            >
                              {t('profile.saveReview')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingReviewId(null);
                                setReviewDraft("");
                              }}
                            >
                              {t('common.cancel')}
                            </Button>
                          </div>
                        </div>
                      ) : (favorite.review ?? "").trim() ? (
                        <div className="mt-3 p-3 rounded-lg bg-secondary/40 border border-secondary/60">
                          <p className="text-sm text-muted-foreground italic">&ldquo;{(favorite.review ?? "").trim()}&rdquo;</p>
                          {favorite.review_updated_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {t('profile.updated')} {new Date(favorite.review_updated_at).toLocaleDateString(currentLanguage)}
                            </p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredFavorites.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">
                {watchlistFilter === "watched" ? t('profile.noWatchedMovies') : t('profile.noWantToWatchItems')}
              </p>
            )}
            {hasMoreFavorites && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMoreFavorites}
                  disabled={loadingMoreFavorites}
                  aria-label={t('profile.loadMoreFavorites')}
                >
                  {loadingMoreFavorites ? t('common.loading') : t('profile.loadMore')}
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Recent Movie Memories */}
        <Card className="neural-card p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <Film className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">{t('profile.recentMovieMemories')}</h2>
              {movieSearches.length > 0 && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {movieSearches.length} {t('profile.memories')}
                </Badge>
              )}
            </div>
            {movieSearches.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/")}
                className="text-xs sm:text-sm self-start sm:self-auto"
              >
                {t('profile.addMore')}
              </Button>
            )}
          </div>

          {movieSearches.length > 0 ? (
            <>
            <div className="space-y-4 sm:space-y-6">
              {/* Group by time periods */}
              {(() => {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                
                const todaySearches = movieSearches.filter(s => new Date(s.created_at) >= today);
                const weekSearches = movieSearches.filter(s => {
                  const searchDate = new Date(s.created_at);
                  return searchDate >= weekAgo && searchDate < today;
                });
                const olderSearches = movieSearches.filter(s => new Date(s.created_at) < weekAgo);
                
                const sections = [
                  { titleKey: "profile.today", searches: todaySearches, color: "text-primary" },
                  { titleKey: "profile.thisWeek", searches: weekSearches, color: "text-accent" },
                  { titleKey: "profile.earlier", searches: olderSearches, color: "text-muted-foreground" }
                ].filter(section => section.searches.length > 0);
                
                return sections.map(({ titleKey, searches, color }) => (
                  <div key={titleKey} className="space-y-3">
                    <h3 className={`text-sm sm:text-base font-semibold ${color} flex items-center gap-2`}>
                      {t(titleKey)}
                      <Badge variant="outline" className="text-xs">{searches.length}</Badge>
                    </h3>
                    <div className="grid gap-3 pl-2 sm:pl-4 border-l-2 border-secondary">
                      {searches.map((search) => (
                        <div 
                          key={search.id}
                          className="group flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all duration-200 cursor-pointer touch-manipulation"
                          onClick={() => {
                            // Store the search query and navigate to search
                            window.localStorage.setItem('lastSearchQuery', search.search_query);
                            navigate("/");
                          }}
                        >
                          <div className="flex items-start gap-3 w-full sm:w-auto">
                            <div className="relative flex-shrink-0">
                              {search.movie_poster_url ? (
                                <img
                                  src={search.movie_poster_url}
                                  alt={search.movie_title}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-16 h-20 sm:w-12 sm:h-16 object-cover rounded shadow-sm"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-16 h-20 sm:w-12 sm:h-16 bg-secondary rounded flex items-center justify-center">
                                  <Film className="w-6 h-6 sm:w-4 sm:h-4 text-muted-foreground" />
                                </div>
                              )}
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowLeft className="w-3 h-3 text-primary-foreground rotate-180" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                                <h4 className="font-semibold text-sm sm:text-base leading-tight">
                                  {search.movie_title} 
                                  {search.movie_year && (
                                    <span className="text-muted-foreground ml-1 sm:ml-2 text-xs sm:text-sm">({search.movie_year})</span>
                                  )}
                                </h4>
                                <div className="text-xs text-muted-foreground flex-shrink-0 sm:ml-2">
                                  {new Date(search.created_at).toLocaleDateString(currentLanguage)}
                                </div>
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground italic mt-1 line-clamp-1 sm:line-clamp-none">
                                "{search.search_query}"
                              </p>
                              {search.movie_plot && (
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 sm:line-clamp-2 leading-relaxed">
                                  {translatedPlots[search.id] || search.movie_plot}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
            {hasMoreSearches && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMoreSearches}
                  disabled={loadingMoreSearches}
                  aria-label={t('profile.loadMoreMemories')}
                >
                  {loadingMoreSearches ? t('common.loading') : t('profile.loadMore')}
                </Button>
              </div>
            )}
            </>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Film className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">{t('profile.noMovieMemoriesYet')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                {t('profile.startSearchingMovies')}
              </p>
              <Button 
                onClick={() => navigate("/")}
                className="neural-button px-4 sm:px-6 text-sm sm:text-base"
              >
                <Film className="w-4 h-4 mr-2" />
                {t('profile.startExploringMovies')}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};