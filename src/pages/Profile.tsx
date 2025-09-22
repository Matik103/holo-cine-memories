import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Brain, Film, Heart, ArrowLeft, LogOut, RefreshCw } from "lucide-react";

interface MovieSearch {
  id: string;
  search_query: string;
  movie_title: string;
  movie_year: number;
  movie_poster_url: string;
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
    const genreCount = preferences?.favorite_genres?.length || 0;
    const cinednaScore = preferences?.cinedna_score;
    
    // If we have CineDNA score data, use it for more accurate progress
    if (cinednaScore && typeof cinednaScore === 'object') {
      const totalSearches = cinednaScore.total_searches || 0;
      const favoriteGenres = cinednaScore.favorite_genres || [];
      return Math.min(Math.floor((totalSearches * 10 + favoriteGenres.length * 5) / 2), 100);
    }
    
    // Fallback to basic calculation
    return Math.min(Math.floor((searchCount * 10 + genreCount * 5) / 2), 100);
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
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="flex items-center gap-2 self-end text-sm sm:text-base"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
            <span className="sm:hidden">Logout</span>
          </Button>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Movie Memory Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Memory Bank Completion</span>
                  <span className="font-bold text-primary">{calculateCineDNAProgress()}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary to-accent h-3 rounded-full neural-glow"
                    style={{ width: `${calculateCineDNAProgress()}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{movieSearches.length}</div>
                    <div className="text-sm text-muted-foreground">Movies Recalled</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{preferences?.favorite_genres?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Genres Explored</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Preferred Genres</h3>
              <div className="flex flex-wrap gap-2">
                {preferences?.favorite_genres?.length ? 
                  preferences.favorite_genres.map((genre) => (
                    <Badge key={genre} variant="secondary" className="bg-primary/10 text-primary">
                      {genre}
                    </Badge>
                  )) :
                  <p className="text-muted-foreground italic">
                    Keep searching movies to build your genre preferences!
                  </p>
                }
              </div>
              {preferences?.preferred_mood && (
                <div className="mt-4">
                  <h4 className="font-semibold">Current Mood Preference</h4>
                  <Badge variant="outline" className="mt-2">
                    {preferences.preferred_mood}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Recent Movie Memories */}
        <Card className="neural-card p-4 sm:p-8">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Film className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold">Recent Movie Memories</h2>
          </div>

          {movieSearches.length > 0 ? (
            <div className="grid gap-4">
              {movieSearches.map((search) => (
                <div 
                  key={search.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  {search.movie_poster_url && (
                    <img 
                      src={search.movie_poster_url} 
                      alt={search.movie_title}
                      className="w-12 h-16 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold">
                      {search.movie_title} 
                      {search.movie_year && (
                        <span className="text-muted-foreground ml-2">({search.movie_year})</span>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground italic">
                      "{search.search_query}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(search.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Start searching for movies to build your personal movie memory bank!
              </p>
              <Button 
                onClick={() => navigate("/")}
                className="mt-4 neural-button"
              >
                Start Exploring Movies
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};