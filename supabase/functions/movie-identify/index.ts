import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const omdbApiKey = Deno.env.get('OMDB_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to fetch movie poster from OMDb
async function fetchMoviePoster(title: string, year?: number): Promise<string | null> {
  if (!omdbApiKey) {
    console.log('OMDb API key not available, skipping poster fetch');
    return null;
  }

  try {
    const searchQuery = year ? `${title} ${year}` : title;
    const omdbUrl = `https://www.omdbapi.com/?apikey=${omdbApiKey}&t=${encodeURIComponent(searchQuery)}&plot=short`;
    
    console.log('Fetching poster from OMDb for:', searchQuery);
    const response = await fetch(omdbUrl);
    const data = await response.json();
    
    if (data.Response === 'True' && data.Poster && data.Poster !== 'N/A') {
      console.log('Found poster:', data.Poster);
      return data.Poster;
    } else {
      console.log('No poster found in OMDb for:', searchQuery);
      return null;
    }
  } catch (error) {
    console.error('Error fetching poster from OMDb:', error);
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

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a movie identification expert. Based on user descriptions, identify movies and return ONLY a JSON object with this exact format:
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
            
            If you can't identify the movie with high confidence (>0.7), return:
            {
              "title": null,
              "confidence": 0.0,
              "error": "Could not identify movie from description"
            }
            
            Rules:
            - Only return valid JSON
            - DO NOT include poster_url in the response (it will be fetched separately)
            - Confidence should be 0.0-1.0
            - Include genre as an array of strings
            - Include runtime in minutes as integer
            - Include main cast members (3-5 actors)
            - If multiple movies match, pick the most famous/likely one`
          },
          { role: 'user', content: query }
        ],
        max_tokens: 400,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    console.log('OpenAI response received, status:', response.status);
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    let movieData;
    try {
      movieData = JSON.parse(data.choices[0].message.content);
      console.log('Parsed movie data:', movieData);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', data.choices[0].message.content);
      throw new Error('Invalid response format from AI');
    }

    // Fetch poster from OMDb if movie was identified
    if (movieData.title && movieData.confidence > 0.7) {
      console.log('Fetching poster for:', movieData.title, movieData.year);
      const posterUrl = await fetchMoviePoster(movieData.title, movieData.year);
      if (posterUrl) {
        movieData.poster_url = posterUrl;
        console.log('Added poster URL:', posterUrl);
      } else {
        console.log('No poster found, will use fallback');
        movieData.poster_url = null;
      }
    }

    // If movie identified, save search to database
    if (movieData.title && movieData.confidence > 0.7) {
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
            movie_plot: movieData.plot
          });
          console.log('Saved search to database for user:', userData.user.id);
        }
      }
    }

    return new Response(JSON.stringify(movieData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in movie-identify function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      title: null,
      confidence: 0.0 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});