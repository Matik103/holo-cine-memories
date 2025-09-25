import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface MovieSearch {
  movie_title: string;
  movie_year: number;
  search_query: string;
  created_at: string;
}

interface CineDNAScore {
  total_searches: number;
  favorite_genres: string[];
  genre_scores: Record<string, number>;
  mood_preferences: Record<string, number>;
  decade_preferences: Record<string, number>;
  director_preferences: Record<string, number>;
  last_updated: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'User ID is required' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    console.log('Updating CineDNA for user:', userId);

    // Get user's movie search history
    const { data: searches, error: searchesError } = await supabase
      .from('movie_searches')
      .select('movie_title, movie_year, search_query, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (searchesError) {
      console.error('Error fetching searches:', searchesError);
      throw searchesError;
    }

    if (!searches || searches.length === 0) {
      console.log('No searches found for user');
      return new Response(JSON.stringify({ 
        message: 'No movie searches found',
        cinedna_score: {
          total_searches: 0,
          favorite_genres: [],
          genre_scores: {},
          mood_preferences: {},
          decade_preferences: {},
          director_preferences: {},
          last_updated: new Date().toISOString()
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // Analyze search patterns to build CineDNA
    const cinednaScore = await analyzeMoviePatterns(searches);
    
    // Update user preferences with new CineDNA score
    const { error: updateError } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        favorite_genres: cinednaScore.favorite_genres,
        cinedna_score: cinednaScore,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (updateError) {
      console.error('Error updating preferences:', updateError);
      throw updateError;
    }

    console.log('CineDNA updated successfully for user:', userId);

    return new Response(JSON.stringify({ 
      message: 'CineDNA updated successfully',
      cinedna_score: cinednaScore
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error in update-cinedna function:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to update CineDNA profile',
      details: (error as Error).message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

async function analyzeMoviePatterns(searches: MovieSearch[]): Promise<CineDNAScore> {
  const genreCounts: Record<string, number> = {};
  const moodCounts: Record<string, number> = {};
  const decadeCounts: Record<string, number> = {};
  const directorCounts: Record<string, number> = {};
  
  // Get detailed movie information for analysis
  for (const search of searches) {
    if (search.movie_title) {
      // Try to get movie details from OMDb for better analysis
      try {
        const omdbApiKey = Deno.env.get('OMDB_API_KEY');
        if (omdbApiKey) {
          const omdbUrl = `https://www.omdbapi.com/?apikey=${omdbApiKey}&t=${encodeURIComponent(search.movie_title)}&y=${search.movie_year || ''}&plot=short`;
          const response = await fetch(omdbUrl);
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.Response === 'True') {
              // Analyze genres
              if (data.Genre) {
                const genres = data.Genre.split(',').map((g: string) => g.trim());
                genres.forEach((genre: string) => {
                  genreCounts[genre] = (genreCounts[genre] || 0) + 1;
                });
              }
              
              // Analyze decade
              if (data.Year) {
                const year = parseInt(data.Year);
                const decade = Math.floor(year / 10) * 10;
                const decadeKey = `${decade}s`;
                decadeCounts[decadeKey] = (decadeCounts[decadeKey] || 0) + 1;
              }
              
              // Analyze director
              if (data.Director) {
                const directors = data.Director.split(',').map((d: string) => d.trim());
                directors.forEach((director: string) => {
                  directorCounts[director] = (directorCounts[director] || 0) + 1;
                });
              }
            }
          }
        }
      } catch (error) {
        console.log('Error fetching movie details for analysis:', error);
      }
    }
    
    // Analyze search query for mood patterns
    const query = search.search_query.toLowerCase();
    if (query.includes('scary') || query.includes('horror') || query.includes('thriller')) {
      moodCounts['thriller'] = (moodCounts['thriller'] || 0) + 1;
    } else if (query.includes('funny') || query.includes('comedy') || query.includes('laugh')) {
      moodCounts['comedy'] = (moodCounts['comedy'] || 0) + 1;
    } else if (query.includes('romantic') || query.includes('love') || query.includes('romance')) {
      moodCounts['romance'] = (moodCounts['romance'] || 0) + 1;
    } else if (query.includes('action') || query.includes('fight') || query.includes('adventure')) {
      moodCounts['action'] = (moodCounts['action'] || 0) + 1;
    } else if (query.includes('drama') || query.includes('emotional') || query.includes('sad')) {
      moodCounts['drama'] = (moodCounts['drama'] || 0) + 1;
    } else if (query.includes('sci-fi') || query.includes('space') || query.includes('future')) {
      moodCounts['sci-fi'] = (moodCounts['sci-fi'] || 0) + 1;
    }
  }
  
  // Calculate genre scores (normalized)
  const totalSearches = searches.length;
  const genreScores: Record<string, number> = {};
  Object.entries(genreCounts).forEach(([genre, count]) => {
    genreScores[genre] = Math.round((count / totalSearches) * 100);
  });
  
  // Get top 5 favorite genres
  const favoriteGenres = Object.entries(genreCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([genre]) => genre);
  
  // Calculate mood preferences (normalized)
  const moodPreferences: Record<string, number> = {};
  Object.entries(moodCounts).forEach(([mood, count]) => {
    moodPreferences[mood] = Math.round((count / totalSearches) * 100);
  });
  
  // Calculate decade preferences (normalized)
  const decadePreferences: Record<string, number> = {};
  Object.entries(decadeCounts).forEach(([decade, count]) => {
    decadePreferences[decade] = Math.round((count / totalSearches) * 100);
  });
  
  // Calculate director preferences (normalized)
  const directorPreferences: Record<string, number> = {};
  Object.entries(directorCounts).forEach(([director, count]) => {
    directorPreferences[director] = Math.round((count / totalSearches) * 100);
  });
  
  return {
    total_searches: totalSearches,
    favorite_genres: favoriteGenres,
    genre_scores: genreScores,
    mood_preferences: moodPreferences,
    decade_preferences: decadePreferences,
    director_preferences: directorPreferences,
    last_updated: new Date().toISOString()
  };
}
