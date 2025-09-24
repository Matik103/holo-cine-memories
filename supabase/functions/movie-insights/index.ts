import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { movieTitle, movieYear, moviePlot } = await req.json();
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!movieTitle || !openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing movie title or API key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating insights for: ${movieTitle} (${movieYear || 'unknown year'})`);

    const movieInfo = `${movieTitle}${movieYear ? ` (${movieYear})` : ''}`;
    const plotInfo = moviePlot ? `\n\nPlot: ${moviePlot}` : '';

    const systemPrompt = `You are a film expert and critic who provides insightful analysis of movies. Generate comprehensive insights about the given movie in JSON format with the following structure:

{
  "summary": "A compelling 2-3 sentence summary of the movie",
  "themes": "Deep analysis of the main themes and meanings (2-3 sentences)",
  "symbolism": "Explanation of key symbols and hidden meanings (2-3 sentences)",
  "culturalImpact": "Brief discussion of the movie's cultural significance (1-2 sentences)",
  "similarMovies": ["Movie 1", "Movie 2", "Movie 3"]
}

Focus on what makes this movie special, its deeper meanings, and why it resonates with audiences. Be insightful but accessible.`;

    const userPrompt = `Analyze this movie: ${movieInfo}${plotInfo}

Provide insights about its themes, symbolism, cultural impact, and suggest 3 similar movies.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    let insights;

    try {
      const content = data.choices[0].message.content;
      
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      
      // Fallback insights
      insights = {
        summary: `${movieTitle} is a compelling film that explores complex themes and characters, leaving a lasting impact on viewers.`,
        themes: "This movie delves into universal themes of human nature, relationships, and the complexities of life, presenting them through engaging storytelling.",
        symbolism: "The film uses visual and narrative symbols to convey deeper meanings, inviting viewers to look beyond the surface story.",
        culturalImpact: "This movie has influenced popular culture and continues to resonate with audiences across generations.",
        similarMovies: ["The Shawshank Redemption", "Pulp Fiction", "The Dark Knight"]
      };
    }

    console.log('Generated insights for:', movieTitle);

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in movie-insights function:', error);
    
    // Return fallback insights on error
    const fallbackInsights = {
      summary: "This is a remarkable film that showcases exceptional storytelling and memorable characters.",
      themes: "The movie explores themes of human resilience, moral complexity, and the power of storytelling.",
      symbolism: "Rich in symbolism and metaphor, this film rewards careful viewing and analysis.",
      culturalImpact: "A culturally significant work that has influenced cinema and popular culture.",
      similarMovies: ["The Godfather", "Citizen Kane", "Casablanca"]
    };

    return new Response(
      JSON.stringify({ insights: fallbackInsights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});