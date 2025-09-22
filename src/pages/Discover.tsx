import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles, Clock, Heart, Play, ExternalLink } from "lucide-react";

interface Recommendation {
  title: string;
  year: number;
  reason: string;
  mood_match: string;
  poster_url: string;
  runtime: string;
}

export const Discover = () => {
  const [user, setUser] = useState<any>(null);
  const [mood, setMood] = useState("curious");
  const [timePreference, setTimePreference] = useState("90-120 minutes");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Load user's favorites if logged in
      if (user) {
        await loadFavorites(user.id);
      }
    };
    checkUser();
  }, []);

  const loadFavorites = async (userId: string) => {
    try {
      const { data: favorites } = await supabase
        .from('favorites')
        .select('movie_title, movie_year')
        .eq('user_id', userId);
      
      if (favorites) {
        const favoriteSet = new Set(
          favorites.map(fav => `${fav.movie_title}-${fav.movie_year}`)
        );
        setFavoriteIds(favoriteSet);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const addToFavorites = async (rec: Recommendation) => {
    if (!user) {
      toast({
        title: "Sign in Required",
        description: "Please sign in to add movies to your favorites.",
        variant: "destructive",
      });
      return;
    }

    const movieKey = `${rec.title}-${rec.year}`;
    
    try {
      const { error } = await supabase
        .from('favorites')
        .upsert({
          user_id: user.id,
          movie_title: rec.title,
          movie_year: rec.year,
          movie_poster_url: rec.poster_url,
        }, {
          onConflict: 'user_id, movie_title, movie_year'
        });

      if (error) {
        throw error;
      }

      // Update local state
      setFavoriteIds(prev => new Set([...prev, movieKey]));
      
      toast({
        title: "Added to Favorites!",
        description: `${rec.title} has been added to your favorites.`,
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast({
        title: "Error",
        description: "Failed to add movie to favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeFromFavorites = async (rec: Recommendation) => {
    if (!user) return;

    const movieKey = `${rec.title}-${rec.year}`;
    
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_title', rec.title)
        .eq('movie_year', rec.year);

      if (error) {
        throw error;
      }

      // Update local state
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(movieKey);
        return newSet;
      });
      
      toast({
        title: "Removed from Favorites",
        description: `${rec.title} has been removed from your favorites.`,
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast({
        title: "Error",
        description: "Failed to remove movie from favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFindWhereToWatch = (rec: Recommendation) => {
    // Navigate to main search page with the movie title as search query
    navigate("/", { 
      state: { 
        searchQuery: rec.title,
        fromDiscover: true 
      } 
    });
  };

  const handleGetRecommendations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('movie-recommend', {
        body: { 
          mood, 
          timePreference,
          userId: user?.id 
        },
      });

      if (error) throw error;

      if (data.recommendations) {
        setRecommendations(data.recommendations);
        toast({
          title: "Recommendations Ready!",
          description: `Found ${data.recommendations.length} perfect movies for your mood.`
        });
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to get recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const moodOptions = [
    { value: "curious", label: "Curious & Thoughtful", color: "bg-blue-500" },
    { value: "adventurous", label: "Adventurous & Excited", color: "bg-orange-500" },
    { value: "emotional", label: "Emotional & Deep", color: "bg-purple-500" },
    { value: "chill", label: "Chill & Relaxed", color: "bg-green-500" },
    { value: "mind-blown", label: "Mind-blown & Amazed", color: "bg-pink-500" },
    { value: "nostalgic", label: "Nostalgic & Warm", color: "bg-amber-500" },
    { value: "scary", label: "Thrilled & Scared", color: "bg-red-500" },
    { value: "romantic", label: "Romantic & Sweet", color: "bg-rose-500" }
  ];

  const timeOptions = [
    "Under 90 minutes",
    "90-120 minutes", 
    "2-3 hours",
    "I have all day"
  ];

  return (
    <div className="min-h-screen p-2 sm:p-4 relative">
      {/* Background Neural Network Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/3 right-1/3 w-32 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <div className="floating-particle absolute top-20 right-20 w-2 h-2 bg-primary rounded-full opacity-30" style={{ animationDelay: '0s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto px-2">
        {/* Header - Enhanced Mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 self-start touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm sm:text-base">Back to Search</span>
          </Button>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Discover Movies
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
              Let AI find the perfect movie for your current mood
            </p>
          </div>
        </div>

        {/* Mood Selection - Enhanced Mobile */}
        <Card className="neural-card p-3 sm:p-6 md:p-8 mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">What's your mood?</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {moodOptions.map((option) => (
              <Button
                key={option.value}
                variant={mood === option.value ? "default" : "outline"}
                onClick={() => setMood(option.value)}
                className={`text-left h-auto p-2 sm:p-3 md:p-4 touch-manipulation ${
                  mood === option.value 
                    ? "neural-button" 
                    : "hover:bg-secondary/60"
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${option.color}`} />
                  <span className="text-xs sm:text-sm font-medium truncate">{option.label}</span>
                </div>
              </Button>
            ))}
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h3 className="font-semibold text-sm sm:text-base">How much time do you have?</h3>
            </div>
            <Select value={timePreference} onValueChange={setTimePreference}>
              <SelectTrigger className="w-full h-10 sm:h-12 touch-manipulation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((option) => (
                  <SelectItem key={option} value={option} className="text-sm">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGetRecommendations}
            disabled={loading}
            className="w-full mt-4 sm:mt-6 neural-button h-10 sm:h-12 text-sm sm:text-base touch-manipulation"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="hidden sm:inline">{loading ? "Finding Perfect Movies..." : "Discover Movies for Me"}</span>
            <span className="sm:hidden">{loading ? "Finding Movies..." : "Discover Movies"}</span>
          </Button>
        </Card>

        {/* Recommendations - Enhanced Mobile */}
        {recommendations.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Perfect Movies for Your Mood
            </h2>

            {recommendations.map((rec, index) => {
              const movieKey = `${rec.title}-${rec.year}`;
              const isFavorite = favoriteIds.has(movieKey);
              
              return (
                <Card key={index} className="neural-card p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6">
                    {rec.poster_url && (
                      <div className="w-full sm:w-24 md:w-32 flex-shrink-0">
                        <img
                          src={rec.poster_url}
                          alt={rec.title}
                          className="w-full h-48 sm:h-36 md:h-48 object-cover rounded-lg mx-auto sm:mx-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-3 sm:space-y-4">
                      <div>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-center sm:text-left">
                          {rec.title} ({rec.year})
                        </h3>
                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {rec.runtime}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3 text-center sm:text-left">
                        <div>
                          <h4 className="font-semibold text-primary text-xs sm:text-sm md:text-base">Why it's perfect for you:</h4>
                          <p className="text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed">{rec.reason}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-accent text-xs sm:text-sm md:text-base">Mood Match:</h4>
                          <p className="text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed">{rec.mood_match}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                        <Button
                          onClick={() => isFavorite ? removeFromFavorites(rec) : addToFavorites(rec)}
                          className={`flex-1 text-xs sm:text-sm touch-manipulation ${
                            isFavorite 
                              ? "neural-button bg-red-500 hover:bg-red-600" 
                              : "neural-button"
                          }`}
                        >
                          <Heart className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${isFavorite ? "fill-current" : ""}`} />
                          <span className="hidden sm:inline">
                            {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                          </span>
                          <span className="sm:hidden">
                            {isFavorite ? "Remove" : "Favorite"}
                          </span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => handleFindWhereToWatch(rec)}
                          className="text-xs sm:text-sm touch-manipulation"
                        >
                          <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Find Where to Watch</span>
                          <span className="sm:hidden">Watch</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State - Enhanced Mobile */}
        {recommendations.length === 0 && !loading && (
          <Card className="neural-card p-6 sm:p-8 md:p-12 text-center">
            <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Ready to Discover?</h3>
            <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
              Select your mood and time preference above to get AI-powered movie recommendations
              tailored just for you.
            </p>
            {!user && (
              <p className="text-xs sm:text-sm text-muted-foreground">
                <Button 
                  variant="link" 
                  onClick={() => navigate("/auth")}
                  className="p-0 h-auto text-primary touch-manipulation"
                >
                  Sign in
                </Button> to get personalized recommendations based on your movie history!
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};