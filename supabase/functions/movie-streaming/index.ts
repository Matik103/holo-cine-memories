import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { movieTitle } = await req.json();
    console.log('Finding streaming options for:', movieTitle);

    if (!movieTitle) {
      return new Response(JSON.stringify({ error: 'Movie title is required' }), {
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
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are a streaming service expert. Provide realistic streaming options for movies. Return ONLY a JSON array with this exact format:
            [
              {
                "platform": "Netflix",
                "type": "subscription",
                "price": "Monthly subscription",
                "url": "https://netflix.com",
                "quality": "4K"
              },
              {
                "platform": "Amazon Prime Video",
                "type": "rent",
                "price": "$3.99",
                "url": "https://primevideo.com",
                "quality": "HD"
              }
            ]
            
            Guidelines:
            - Include 3-5 realistic streaming options
            - Types: "subscription", "rent", "buy", "free"
            - Use real platform names: Netflix, Hulu, Disney+, Amazon Prime, Apple TV, Vudu, Tubi, Crackle, etc.
            - Price examples: "Monthly subscription", "$3.99", "$12.99", "Free with ads"
            - Quality: "4K", "HD", "SD"
            - Always include at least one free option if realistic
            - Use real platform URLs
            
            Only return valid JSON array.`
          },
          { role: 'user', content: `Find streaming options for the movie "${movieTitle}".` }
        ],
        max_completion_tokens: 500,
      }),
    });

    const data = await response.json();
    console.log('OpenAI streaming response received');
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const streamingOptions = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(streamingOptions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in movie-streaming function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallback: [
        {
          platform: "Search manually",
          type: "search",
          price: "Various",
          url: "https://www.google.com/search?q=" + encodeURIComponent(movieTitle + " streaming"),
          quality: "Various"
        }
      ]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});