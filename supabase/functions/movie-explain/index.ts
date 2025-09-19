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
    console.log('Explaining movie:', movieTitle);

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
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are a film analysis expert. Explain movies in three different ways. Return ONLY a JSON object with this exact format:
            {
              "simple": "Simple explanation for a general audience",
              "detailed": "Detailed analysis of themes, character development, and plot significance",
              "symbolism": "Deep dive into symbolism, metaphors, hidden meanings, and cultural context"
            }
            
            Keep each explanation:
            - Simple: 2-3 sentences, accessible to anyone
            - Detailed: 4-6 sentences, covers main themes and character arcs
            - Symbolism: 5-8 sentences, explores deeper meanings, metaphors, and cultural significance
            
            Only return valid JSON.`
          },
          { role: 'user', content: `Explain the movie "${movieTitle}" in three different ways as specified.` }
        ],
        max_completion_tokens: 800,
      }),
    });

    const data = await response.json();
    console.log('OpenAI explanation response received');
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const explanation = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(explanation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in movie-explain function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});