import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const omdbApiKey = Deno.env.get('OMDB_API_KEY');
const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to fetch movie poster from OMDb with multiple fallback strategies
async function fetchMoviePoster(title: string, year?: number): Promise<string | null> {
  if (!omdbApiKey) {
    console.log('OMDb API key not available, skipping poster fetch');
    return null;
  }

  // Try multiple search strategies
  const searchStrategies = [
    // Strategy 1: Title + Year
    year ? `${title} ${year}` : null,
    // Strategy 2: Just title
    title,
    // Strategy 3: Remove common words and try again
    title.replace(/\b(the|a|an)\b/gi, '').trim(),
    // Strategy 4: Try without year if year was provided
    year ? title : null
  ].filter(Boolean);

  for (const searchQuery of searchStrategies) {
    if (!searchQuery) continue;
    
    try {
      const omdbUrl = `https://www.omdbapi.com/?apikey=${omdbApiKey}&t=${encodeURIComponent(searchQuery)}&plot=short`;
      
      console.log('Fetching poster from OMDb for:', searchQuery);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(omdbUrl, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'CineMind/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.log(`OMDb API error: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      
      if (data.Response === 'True' && data.Poster && data.Poster !== 'N/A') {
        console.log('Found poster:', data.Poster);
        return data.Poster;
      } else {
        console.log(`No poster found for search: "${searchQuery}". Response:`, data.Response);
        if (data.Error) {
          console.log('OMDb error:', data.Error);
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log(`OMDb request timeout for "${searchQuery}"`);
      } else {
        console.error(`Error fetching poster for "${searchQuery}":`, error);
      }
      continue;
    }
  }
  
  console.log('No poster found after trying all search strategies for:', title);
  
  // Final fallback: Try TMDB API (free, no key required for basic searches)
  try {
    console.log('Trying TMDB fallback for:', title);
    const tmdbSearchUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}${year ? `&year=${year}` : ''}`;
    
    const tmdbResponse = await fetch(tmdbSearchUrl);
    if (tmdbResponse.ok) {
      const tmdbData = await tmdbResponse.json();
      
      if (tmdbData.results && tmdbData.results.length > 0) {
        const movie = tmdbData.results[0];
        if (movie.poster_path) {
          const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
          console.log('Found poster via TMDB fallback:', posterUrl);
          return posterUrl;
        }
      }
    }
  } catch (error) {
    console.error('TMDB fallback failed:', error);
  }
  
  return null;
}

// Function to fetch movie trailer from YouTube
async function fetchMovieTrailer(title: string, year?: number): Promise<string | null> {
  if (!youtubeApiKey) {
    console.log('YouTube API key not available, skipping trailer fetch');
    return null;
  }

  try {
    const searchQuery = year ? `${title} ${year} official trailer` : `${title} official trailer`;
    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&videoCategoryId=24&key=${youtubeApiKey}&maxResults=1`;
    
    console.log('Fetching trailer from YouTube for:', searchQuery);
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(youtubeUrl, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'CineMind/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`YouTube API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const videoId = data.items[0].id.videoId;
      const trailerUrl = `https://www.youtube.com/watch?v=${videoId}`;
      console.log('Found trailer:', trailerUrl);
      return trailerUrl;
    } else {
      console.log('No trailer found in YouTube for:', searchQuery);
      return null;
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.log('YouTube request timeout for:', title);
    } else {
      console.error('Error fetching trailer from YouTube:', error);
    }
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    console.log('Received movie identification query:', query);

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = await fetch('https://open-ai21.p.rapidapi.com/conversationllama', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'open-ai21.p.rapidapi.com',
        'x-rapidapi-key': Deno.env.get('RAPIDAPI_KEY')!,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are an expert movie identification AI. Return ONLY a JSON object with this exact format:
            {
              "title": "Movie Title",
              "year": 2023,
              "director": "Director Name",
              "plot": "Brief plot summary",
              "confidence": 0.95,
              "genre": ["Drama", "Thriller"],
              "runtime": 120,
              "cast": ["Actor 1", "Actor 2", "Actor 3"]
            }
            If you cannot identify the movie, return: {"title": null, "confidence": 0.0}`
          },
          { role: 'user', content: query }
        ],
        web_access: false,
      }),
    });

    const data = await aiResponse.json();
    const responseContent = data.result || data.message || data;
    console.log('AI response received');

    let movieData;
    try {
      console.log('Raw AI response:', responseContent);
      
      // Try to extract JSON from the response if it's wrapped in markdown
      let jsonContent = responseContent;
      if (responseContent.includes('```json')) {
        const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1];
        }
      } else if (responseContent.includes('```')) {
        const jsonMatch = responseContent.match(/```\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1];
        }
      }
      
      movieData = JSON.parse(jsonContent);
      console.log('Parsed movie data:', movieData);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseContent);
      console.error('Parse error:', parseError);
      
      // Return a proper error response instead of throwing
      return new Response(JSON.stringify({ 
        error: 'Invalid response format from AI',
        title: null,
        confidence: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // Fetch poster and trailer if movie was identified
    if (movieData.title && movieData.confidence > 0.5) {
      console.log('Fetching media for:', movieData.title, movieData.year);
      
      // Fetch poster and trailer in parallel with timeout
      const [posterUrl, trailerUrl] = await Promise.allSettled([
        fetchMoviePoster(movieData.title, movieData.year),
        fetchMovieTrailer(movieData.title, movieData.year)
      ]).then(results => [
        results[0].status === 'fulfilled' ? results[0].value : null,
        results[1].status === 'fulfilled' ? results[1].value : null
      ]);
      
      if (posterUrl) {
        movieData.poster_url = posterUrl;
        console.log('Added poster URL:', posterUrl);
      } else {
        console.log('No poster found, will use fallback');
        movieData.poster_url = null;
      }
      
      if (trailerUrl) {
        movieData.trailer_url = trailerUrl;
        console.log('Added trailer URL:', trailerUrl);
      } else {
        console.log('No trailer found, will use fallback');
        movieData.trailer_url = null;
      }
    }

    // If movie identified, save search to database
    if (movieData.title && movieData.confidence > 0.5) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: userData } = await supabase.auth.getUser(token);
        
        if (userData.user) {
          await supabase.from('movie_searches').insert({
            user_id: userData.user.id,
            search_query: query,
            movie_title: movieData.title,
            movie_year: movieData.year,
            movie_poster_url: movieData.poster_url,
            movie_trailer_url: movieData.trailer_url,
            movie_plot: movieData.plot
          });
          console.log('Saved search to database for user:', userData.user.id);
          
          // Update CineDNA profile asynchronously
          try {
            const cinednaResponse = await fetch(`${supabaseUrl}/functions/v1/update-cinedna`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ userId: userData.user.id })
            });
            
            if (cinednaResponse.ok) {
              console.log('CineDNA profile updated for user:', userData.user.id);
            } else {
              console.log('Failed to update CineDNA profile, but search was saved');
            }
          } catch (cinednaError) {
            console.log('Error updating CineDNA profile:', cinednaError);
            // Don't fail the main request if CineDNA update fails
          }
        }
      }
    }

    return new Response(JSON.stringify(movieData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in movie-identify function:', error);
    return new Response(JSON.stringify({ 
      error: (error as Error).message,
      title: null,
      confidence: 0.0 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});