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

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Generating recommendations for mood:', mood, 'time:', timePreference);

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
            - Use real movie poster URLs if possible
            - Consider runtime for time preference
            - Choose diverse but personalized recommendations
            - Always return exactly 3 recommendations
            
            Only return valid JSON.`
          },
          { 
            role: 'user', 
            content: `Recommend 3 movies for someone feeling ${mood} with ${timePreference} time available. ${userContext ? 'User context: ' + userContext : ''}` 
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log('OpenAI recommendation response received');
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    let recommendations;
    try {
      const responseContent = data.choices[0].message.content;
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
      
      recommendations = JSON.parse(jsonContent);
      console.log('Parsed recommendations:', recommendations);
      
      // Ensure proper structure
      if (!recommendations.recommendations || !Array.isArray(recommendations.recommendations)) {
        console.warn('Invalid recommendations structure, creating fallback');
        recommendations = { recommendations: [] };
      }
    } catch (parseError) {
      console.error('Failed to parse recommendations response:', data.choices[0].message.content);
      console.error('Parse error:', parseError);
      
      // Return fallback recommendations instead of throwing error
      recommendations = {
        recommendations: [
          {
            title: "The Shawshank Redemption",
            year: 1994,
            reason: "A timeless classic that offers hope and redemption, perfect for thoughtful reflection.",
            mood_match: "Matches your curious and thoughtful mood with its deep themes and character development.",
            poster_url: "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGc@._V1_SX300.jpg",
            runtime: "142 min"
          },
          {
            title: "Inception",
            year: 2010,
            reason: "A mind-bending sci-fi thriller that challenges your perception of reality.",
            mood_match: "Perfect for curious minds who enjoy complex narratives and thought-provoking concepts.",
            poster_url: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
            runtime: "148 min"
          },
          {
            title: "The Grand Budapest Hotel",
            year: 2014,
            reason: "A whimsical and visually stunning comedy-drama with intricate storytelling.",
            mood_match: "Matches your thoughtful mood with its layered narrative and artistic beauty.",
            poster_url: "https://m.media-amazon.com/images/M/MV5BMzM5NjUxOTEyMl5BMl5BanBnXkFtZTgwNjEyMDM0MDE@._V1_SX300.jpg",
            runtime: "99 min"
          }
        ]
      };
    }

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in movie-recommend function:', error);
    
    // Return fallback recommendations instead of error
    const fallbackRecommendations = {
      recommendations: [
        {
          title: "The Shawshank Redemption",
          year: 1994,
          reason: "A timeless classic that offers hope and redemption, perfect for thoughtful reflection.",
          mood_match: "Matches your curious and thoughtful mood with its deep themes and character development.",
          poster_url: "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGc@._V1_SX300.jpg",
          runtime: "142 min"
        },
        {
          title: "Inception",
          year: 2010,
          reason: "A mind-bending sci-fi thriller that challenges your perception of reality.",
          mood_match: "Perfect for curious minds who enjoy complex narratives and thought-provoking concepts.",
          poster_url: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
          runtime: "148 min"
        },
        {
          title: "The Grand Budapest Hotel",
          year: 2014,
          reason: "A whimsical and visually stunning comedy-drama with intricate storytelling.",
          mood_match: "Matches your thoughtful mood with its layered narrative and artistic beauty.",
          poster_url: "https://m.media-amazon.com/images/M/MV5BMzM5NjUxOTEyMl5BMl5BanBnXkFtZTgwNjEyMDM0MDE@._V1_SX300.jpg",
          runtime: "99 min"
        }
      ]
    };
    
    return new Response(JSON.stringify(fallbackRecommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  }
});