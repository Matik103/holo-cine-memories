import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Brain, Film, Heart, ArrowLeft, LogOut, RefreshCw, Settings } from "lucide-react";

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
  rating: number;
  is_watched: boolean;
  created_at: string;
}

interface UserProfile {
  display_name: string;
  avatar_url?: string;
}

interface UserPreferences {
  favorite_genres: string[];
  preferred_mood: string;
  cinedna_score: any;
}

export const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [movieSearches, setMovieSearches] = useState<MovieSearch[]>([]);
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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

        // Fetch movie searches
        const { data: searchesData } = await supabase
          .from('movie_searches')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (searchesData) {
          setMovieSearches(searchesData);
        }

        // Fetch favorites
        const { data: favoritesData } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (favoritesData) {
          setFavorites(favoritesData);
        }

      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [navigate, toast]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
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
          title: "Error",
          description: "Failed to update CineDNA profile",
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
          title: "CineDNA Updated!",
          description: "Your movie profile has been refreshed",
        });
      }
    } catch (error) {
      console.error('Error refreshing CineDNA:', error);
      toast({
        title: "Error",
        description: "Failed to refresh CineDNA profile",
        variant: "destructive",
      });
    }
  };

  const calculateCineDNAProgress = () => {
    const searchCount = movieSearches.length;
    const cinednaScore = preferences?.cinedna_score;
    
    // Use CineDNA score data if available (more accurate)
    if (cinednaScore && typeof cinednaScore === 'object') {
      const totalSearches = cinednaScore.total_searches || 0;
      const favoriteGenres = cinednaScore.favorite_genres || [];
      const genreCount = favoriteGenres.length;
      
      // Dynamic scaling algorithm that grows continuously but slows down over time
      // Base score from searches (diminishing returns after 10 searches)
      const searchScore = totalSearches <= 10 
        ? totalSearches * 8 
        : 80 + Math.log(totalSearches - 9) * 15;
      
      // Genre diversity bonus (diminishing returns after 8 genres)
      const genreScore = genreCount <= 8 
        ? genreCount * 2.5 
        : 20 + Math.log(genreCount - 7) * 5;
      
      // Total score with gentle curve, allowing growth beyond traditional 100%
      const totalScore = searchScore + genreScore;
      
      // Convert to percentage (aiming for ~85% at 15 searches + 10 genres)
      return Math.floor(Math.min(totalScore * 0.8, 95));
    }
    
    // Fallback calculation for basic data
    const basicScore = searchCount * 6 + (preferences?.favorite_genres?.length || 0) * 3;
    return Math.floor(Math.min(basicScore * 0.9, 85));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 relative">
      {/* Background Neural Network Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/3 right-1/3 w-32 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm sm:text-base">Back to CineMind</span>
          </Button>
          
          <div className="flex items-center gap-2 self-end">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/settings")}
              className="flex items-center gap-2 text-sm sm:text-base"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
              <span className="sm:hidden">Logout</span>
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
                {profile?.display_name || user?.email || "Movie Explorer"}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Member since {new Date(user?.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        {/* CineDNA Profile */}
        <Card className="neural-card p-4 sm:p-8 mb-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-xl sm:text-2xl font-bold">Your CineDNA Profile</h2>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshCineDNA}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4">Movie Memory Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base">Memory Bank Completion</span>
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
                    <div className="text-xs sm:text-sm text-muted-foreground">Movies Recalled</div>
                    {movieSearches.length > 0 && (
                      <div className="text-xs text-primary mt-1">
                        +{movieSearches.filter(s => {
                          const dayAgo = new Date();
                          dayAgo.setDate(dayAgo.getDate() - 1);
                          return new Date(s.created_at) > dayAgo;
                        }).length} today
                      </div>
                    )}
                  </div>
                  <div className="text-center p-2 sm:p-3 rounded-lg bg-accent/5 border border-accent/10">
                    <div className="text-xl sm:text-2xl font-bold text-accent">
                      {(() => {
                        // Try cinedna_score first (new format), then fall back to favorite_genres (old format)
                        const cinednaScore = preferences?.cinedna_score;
                        if (cinednaScore && typeof cinednaScore === 'object' && Array.isArray(cinednaScore.favorite_genres)) {
                          return cinednaScore.favorite_genres.length;
                        }
                        if (Array.isArray(preferences?.favorite_genres)) {
                          return preferences.favorite_genres.length;
                        }
                        return 0;
                      })()}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Genres Explored</div>
                    {preferences?.cinedna_score?.decade_preferences && (
                      <div className="text-xs text-accent mt-1">
                        {Object.keys(preferences.cinedna_score.decade_preferences).length} decades
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress Level Indicator */}
                <div className="mt-4 p-2 sm:p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-xs sm:text-sm font-medium">CineDNA Level</span>
                    <Badge variant="secondary" className="bg-gradient-to-r from-primary to-accent text-primary-foreground self-start sm:self-auto">
                      {calculateCineDNAProgress() < 20 ? 'Novice' : 
                       calculateCineDNAProgress() < 40 ? 'Explorer' :
                       calculateCineDNAProgress() < 60 ? 'Enthusiast' :
                       calculateCineDNAProgress() < 80 ? 'Connoisseur' : 'Master'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
                <span>Preferred Genres</span>
                {(() => {
                  const cinednaScore = preferences?.cinedna_score;
                  const genreCount = cinednaScore?.favorite_genres?.length || preferences?.favorite_genres?.length || 0;
                  return genreCount > 0 && (
                    <Badge variant="outline" className="text-xs self-start sm:self-auto">{genreCount} discovered</Badge>
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
                          Keep searching movies to build your genre preferences!
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
                              {index === 0 && <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">Top Choice</Badge>}
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
                            +{genresWithScores.length - 8} more genres discovered
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
                    Mood Patterns
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

        {/* My Favorite Movies */}
        {favorites.length > 0 && (
          <Card className="neural-card p-4 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">My Favorite Movies</h2>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary self-start sm:self-auto">
                {favorites.length}
              </Badge>
            </div>

            <div className="grid gap-3 sm:gap-4">
              {favorites.map((favorite) => (
                <div 
                  key={favorite.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    {favorite.movie_poster_url && (
                      <img 
                        src={favorite.movie_poster_url} 
                        alt={favorite.movie_title}
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
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-2">
                        {favorite.rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs sm:text-sm text-muted-foreground">Rating:</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Heart 
                                  key={i} 
                                  className={`w-3 h-3 sm:w-3 sm:h-3 ${i < favorite.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {favorite.is_watched && (
                            <Badge variant="outline" className="text-xs">
                              Watched
                            </Badge>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Added {new Date(favorite.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Movie Memories */}
        <Card className="neural-card p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <Film className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Recent Movie Memories</h2>
              {movieSearches.length > 0 && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {movieSearches.length} memories
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
                Add More
              </Button>
            )}
          </div>

          {movieSearches.length > 0 ? (
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
                  { title: "Today", searches: todaySearches, color: "text-primary" },
                  { title: "This Week", searches: weekSearches, color: "text-accent" },
                  { title: "Earlier", searches: olderSearches, color: "text-muted-foreground" }
                ].filter(section => section.searches.length > 0);
                
                return sections.map(({ title, searches, color }) => (
                  <div key={title} className="space-y-3">
                    <h3 className={`text-sm sm:text-base font-semibold ${color} flex items-center gap-2`}>
                      {title}
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
                                  {new Date(search.created_at).toLocaleDateString()}
                                </div>
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground italic mt-1 line-clamp-1 sm:line-clamp-none">
                                "{search.search_query}"
                              </p>
                              {search.movie_plot && (
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 sm:line-clamp-2 leading-relaxed">
                                  {search.movie_plot}
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
          ) : (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Film className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">No Movie Memories Yet</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                Start searching for movies to build your personal movie memory bank and unlock your CineDNA profile!
              </p>
              <Button 
                onClick={() => navigate("/")}
                className="neural-button px-4 sm:px-6 text-sm sm:text-base"
              >
                <Film className="w-4 h-4 mr-2" />
                Start Exploring Movies
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};