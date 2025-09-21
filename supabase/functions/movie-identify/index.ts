import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    console.log('Received query:', query);

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a movie identification expert. Based on user descriptions, identify movies and return ONLY a JSON object with this exact format:
            {
              "title": "Movie Title",
              "year": 2023,
              "director": "Director Name",
              "plot": "Brief plot summary",
              "poster_url": "https://example.com/poster.jpg",
              "confidence": 0.95
            }
            
            If you can't identify the movie with high confidence (>0.7), return:
            {
              "title": null,
              "confidence": 0.0,
              "error": "Could not identify movie from description"
            }
            
            Rules:
            - Only return valid JSON
            - For poster_url, use a real movie poster URL from TMDB or similar
            - Confidence should be 0.0-1.0
            - If multiple movies match, pick the most famous/likely one`
          },
          { role: 'user', content: query }
        ],
        max_completion_tokens: 300,
      }),
    });

    const data = await response.json();
    console.log('OpenAI response:', data);
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const movieData = JSON.parse(data.choices[0].message.content);

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