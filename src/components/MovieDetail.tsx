import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { VideoPlayer } from "./VideoPlayer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Play, 
  Star, 
  Clock, 
  Calendar,
  User,
  Award,
  Eye,
  Heart,
  Share,
  ExternalLink,
  Loader2
} from "lucide-react";

interface MovieDetails {
  title: string;
  year: string;
  director: string;
  genre: string;
  plot: string;
  imdbRating: string;
  runtime: string;
  cast: string;
  poster: string;
  awards?: string;
  rated?: string;
  released?: string;
  metascore?: string;
  imdbVotes?: string;
}

interface Trailer {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  embedUrl: string;
  watchUrl: string;
}

interface Insights {
  summary: string;
  themes: string;
  symbolism: string;
  culturalImpact: string;
  similarMovies: string[];
}

interface StreamingOption {
  platform: string;
  type: string;
  url: string;
  price?: string;
}

export const MovieDetail = () => {
  const { movieTitle } = useParams<{ movieTitle: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [trailer, setTrailer] = useState<Trailer | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [streamingOptions, setStreamingOptions] = useState<StreamingOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'themes' | 'similar'>('summary');

  useEffect(() => {
    if (movieTitle) {
      fetchMovieData();
    }
  }, [movieTitle]);

  const fetchMovieData = async () => {
    if (!movieTitle) return;

    try {
      setIsLoading(true);
      setInsightsLoading(true);
      
      // Extract year from movie title if present (e.g., "Inception 2010" -> "Inception", "2010")
      const titleMatch = movieTitle.match(/^(.+?)\s+(\d{4})$/);
      const title = titleMatch ? titleMatch[1] : movieTitle;
      const year = titleMatch ? titleMatch[2] : undefined;

      console.log('Fetching data for:', title, year);

      // Fetch essential data first (details, trailer, streaming) in parallel for immediate display
      const [detailsResponse, trailerResponse, streamingResponse] = await Promise.allSettled([
        supabase.functions.invoke('movie-details', {
          body: { movieTitle: title, movieYear: year }
        }),
        supabase.functions.invoke('movie-trailer', {
          body: { movieTitle: title, movieYear: year }
        }),
        supabase.functions.invoke('movie-streaming', {
          body: { movieTitle: title }
        })
      ]);

      // Handle movie details
      if (detailsResponse.status === 'fulfilled' && detailsResponse.value.data?.movieDetails) {
        setMovieDetails(detailsResponse.value.data.movieDetails);
        
        // Load insights in the background after basic data is shown
        setTimeout(async () => {
          try {
            const insightsResponse = await supabase.functions.invoke('movie-insights', {
              body: { 
                movieTitle: title, 
                movieYear: year,
                moviePlot: detailsResponse.value.data.movieDetails.plot
              }
            });
            
            if (insightsResponse.data?.insights) {
              setInsights(insightsResponse.data.insights);
            }
          } catch (insightsError) {
            console.error('Error loading insights:', insightsError);
          } finally {
            setInsightsLoading(false);
          }
        }, 100); // Small delay to show main content first
        
      } else {
        throw new Error('Failed to fetch movie details');
      }

      // Handle trailer
      if (trailerResponse.status === 'fulfilled' && trailerResponse.value.data?.trailer) {
        setTrailer(trailerResponse.value.data.trailer);
      }

      // Handle streaming options - check both possible response formats
      if (streamingResponse.status === 'fulfilled') {
        const streamingData = streamingResponse.value.data;
        if (Array.isArray(streamingData)) {
          setStreamingOptions(streamingData);
        } else if (streamingData?.streamingOptions) {
          setStreamingOptions(streamingData.streamingOptions);
        }
      }

    } catch (error) {
      console.error('Error fetching movie data:', error);
      toast({
        title: "Error",
        description: "Failed to load movie details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${movieDetails?.title} (${movieDetails?.year}) - CineMind`,
      text: `Check out ${movieDetails?.title} on CineMind - Your AI movie memory companion!`,
      url: window.location.href
    };

    try {
      // Try native sharing first (mobile devices)
      if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        toast({
          title: "Link copied!",
          description: "Movie link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      // Final fallback: Copy just the URL
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Movie link has been copied to your clipboard.",
        });
      } catch (clipboardError) {
        toast({
          title: "Share failed",
          description: "Unable to share or copy link. Please copy the URL manually.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Loading movie details...</h3>
            <p className="text-sm text-muted-foreground">Fetching data from multiple sources</p>
          </div>
        </div>
      </div>
    );
  }

  if (!movieDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">Movie not found</h3>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold truncate">{movieDetails.title}</h1>
              <p className="text-sm text-muted-foreground">{movieDetails.year}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Poster */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden group">
              <CardContent className="p-0 relative">
                <div className="aspect-[2/3] relative">
                  <img
                    src={movieDetails.poster || '/placeholder.svg'}
                    alt={movieDetails.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  {trailer && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button
                        size="lg"
                        onClick={() => setIsVideoPlayerOpen(true)}
                        className="bg-primary/90 hover:bg-primary text-white"
                      >
                        <Play className="w-6 h-6 mr-2" />
                        Watch Trailer
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Movie Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{movieDetails.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <Badge variant="secondary">{movieDetails.year}</Badge>
                {movieDetails.rated && (
                  <Badge variant="outline">{movieDetails.rated}</Badge>
                )}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {movieDetails.runtime}
                </div>
                {movieDetails.imdbRating && movieDetails.imdbRating !== 'N/A' && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{movieDetails.imdbRating}</span>
                    <span className="text-muted-foreground">/10</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <span className="font-medium">Director:</span> {movieDetails.director}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <span className="font-medium">Released:</span> {movieDetails.released}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Eye className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <span className="font-medium">Genre:</span> {movieDetails.genre}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {trailer && (
                <Button
                  onClick={() => setIsVideoPlayerOpen(true)}
                  className="flex-1 sm:flex-initial"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Trailer
                </Button>
              )}
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-initial"
                onClick={() => navigate('/auth')}
              >
                <Heart className="w-4 h-4 mr-2" />
                Add to Favorites
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleShare}
              >
                <Share className="w-4 h-4" />
              </Button>
            </div>

            {/* Plot */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Plot</h3>
              <p className="text-muted-foreground leading-relaxed">{movieDetails.plot}</p>
            </div>

            {/* Cast */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Cast</h3>
              <p className="text-muted-foreground">{movieDetails.cast}</p>
            </div>
          </div>
        </div>

        {/* AI Insights Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 text-primary" />
              </div>
              AI-Powered Insights
              {insightsLoading && (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-2" />
              )}
            </h2>
            
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
              {[
                { key: 'summary', label: 'Summary' },
                { key: 'themes', label: 'Themes & Meaning' },
                { key: 'similar', label: 'Similar Movies' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-4 min-h-[200px]">
              {activeTab === 'summary' && (
                <div>
                  {insightsLoading ? (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AI is analyzing the movie...</span>
                    </div>
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">
                      {insights?.summary || 'AI insights will appear here once analysis is complete.'}
                    </p>
                  )}
                </div>
              )}
              
              {activeTab === 'themes' && (
                <div className="space-y-4">
                  {insightsLoading ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Discovering themes and meanings...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h4 className="font-semibold mb-2">Main Themes</h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {insights?.themes || 'Theme analysis will appear here.'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Symbolism & Hidden Meanings</h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {insights?.symbolism || 'Symbolism analysis will appear here.'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Cultural Impact</h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {insights?.culturalImpact || 'Cultural impact analysis will appear here.'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {activeTab === 'similar' && (
                <div>
                  <h4 className="font-semibold mb-3">Movies You Might Like</h4>
                  {insightsLoading ? (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Finding similar movies...</span>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {insights?.similarMovies?.map((movie, index) => (
                        <Card key={index} className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                          <p className="font-medium">{movie}</p>
                        </Card>
                      )) || (
                        <p className="text-muted-foreground col-span-full">Similar movie recommendations will appear here.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Where to Watch */}
        {streamingOptions.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Where to Watch</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {streamingOptions.map((option, index) => (
                  <Card key={index} className="p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{option.platform}</p>
                        <p className="text-sm text-muted-foreground capitalize">{option.type}</p>
                        {option.price && (
                          <p className="text-sm font-medium text-primary">{option.price}</p>
                        )}
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={option.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Video Player Modal */}
      {trailer && (
        <VideoPlayer
          isOpen={isVideoPlayerOpen}
          onClose={() => setIsVideoPlayerOpen(false)}
          videoUrl={trailer.embedUrl}
          title={`${movieDetails.title} - Trailer`}
        />
      )}
    </div>
  );
};