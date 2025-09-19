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
    const { mood, timePreference, userId } = await req.json();
    console.log('Generating recommendations for user:', userId);

    // Get user's movie history and preferences
    let userContext = '';
    if (userId) {
      const { data: searches } = await supabase
        .from('movie_searches')
        .select('movie_title, search_query')
        .eq('user_id', userId)
        .limit(10);

      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: favorites } = await supabase
        .from('favorites')
        .select('movie_title')
        .eq('user_id', userId)
        .limit(5);

      if (searches && searches.length > 0) {
        userContext += `Previous searches: ${searches.map(s => s.movie_title || s.search_query).join(', ')}. `;
      }
      if (preferences) {
        userContext += `Preferred genres: ${preferences.favorite_genres?.join(', ') || 'Unknown'}. `;
        userContext += `Preferred mood: ${preferences.preferred_mood || 'Unknown'}. `;
      }
      if (favorites && favorites.length > 0) {
        userContext += `Favorite movies: ${favorites.map(f => f.movie_title).join(', ')}. `;
      }
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are a movie recommendation expert. Based on user mood and preferences, suggest 3 perfect movies. Return ONLY a JSON object with this exact format:
            {
              "recommendations": [
                {
                  "title": "Movie Title",
                  "year": 2023,
                  "reason": "Why this movie matches their mood and preferences",
                  "mood_match": "How it matches the requested mood",
                  "poster_url": "https://example.com/poster.jpg",
                  "runtime": "120 min"
                }
              ]
            }
            
            Guidelines:
            - Consider the user's mood: ${mood}
            - Time preference: ${timePreference}
            - User context: ${userContext}
            - Reason should be 2-3 sentences explaining the perfect match
            - Mood_match should explain how it fits their current mood
            - Use real movie posters URLs
            - Consider runtime for time preference
            - Choose diverse but personalized recommendations
            
            Only return valid JSON.`
          },
          { 
            role: 'user', 
            content: `Recommend 3 movies for someone feeling ${mood} with ${timePreference} time available. ${userContext ? 'User context: ' + userContext : ''}` 
          }
        ],
        max_completion_tokens: 800,
      }),
    });

    const data = await response.json();
    console.log('OpenAI recommendation response received');
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const recommendations = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in movie-recommend function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      recommendations: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});