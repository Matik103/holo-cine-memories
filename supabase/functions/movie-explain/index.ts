import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
            content: `You are a film analysis expert. Explain movies in three different ways. Return ONLY a JSON object:
            {
              "simple": "Simple explanation for a general audience",
              "detailed": "Detailed analysis of themes and plot",
              "symbolism": "Deep dive into symbolism and hidden meanings"
            }`
          },
          { role: 'user', content: `Explain the movie "${movieTitle}" in three different ways.` }
        ],
        web_access: false,
      }),
    });

    const data = await aiResponse.json();
    const responseContent = data.result || data.message || data;
    console.log('AI explanation response received');

    let explanation;
    try {
      console.log('Raw explanation response:', responseContent);
      
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
      
      explanation = JSON.parse(jsonContent);
      console.log('Parsed explanation:', explanation);
    } catch (parseError) {
      console.error('Failed to parse explanation response:', responseContent);
      console.error('Parse error:', parseError);
      
      // Return fallback explanation instead of throwing error
      explanation = {
        simple: "This movie explores complex themes and storytelling techniques that make it engaging for audiences.",
        detailed: "The film presents a multi-layered narrative that examines human nature, relationships, and the human condition through its characters and plot development.",
        symbolism: "The movie uses various symbolic elements and metaphors to convey deeper meanings about life, society, and the human experience."
      };
    }

    return new Response(JSON.stringify(explanation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in movie-explain function:', error);
    
    // Return fallback explanation instead of error
    const fallbackExplanation = {
      simple: "This movie explores complex themes and storytelling techniques that make it engaging for audiences.",
      detailed: "The film presents a multi-layered narrative that examines human nature, relationships, and the human condition through its characters and plot development.",
      symbolism: "The movie uses various symbolic elements and metaphors to convey deeper meanings about life, society, and the human experience."
    };
    
    return new Response(JSON.stringify(fallbackExplanation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  }
});