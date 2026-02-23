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

    const fallbackExplanation = {
      simple: "This movie explores complex themes and storytelling techniques that make it engaging for audiences.",
      detailed: "The film presents a multi-layered narrative that examines human nature, relationships, and the human condition through its characters and plot development.",
      symbolism: "The movie uses various symbolic elements and metaphors to convey deeper meanings about life, society, and the human experience."
    };

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 14000);
    let rawBody: string;
    try {
      const aiResponse = await fetch('https://open-ai21.p.rapidapi.com/conversationllama', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'open-ai21.p.rapidapi.com',
          'x-rapidapi-key': Deno.env.get('RAPIDAPI_KEY')!,
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Explain the film in 3 short ways. Reply ONLY with valid JSON: {"simple":"1-2 sentences","detailed":"themes and plot in 2-3 sentences","symbolism":"symbolism in 1-2 sentences"}. No other text.' },
            { role: 'user', content: `Explain "${movieTitle}" briefly.` }
          ],
          web_access: false,
        }),
      });
      clearTimeout(t);
      rawBody = await aiResponse.text();
      if (!aiResponse.ok) {
        console.error('AI API error:', aiResponse.status);
        return new Response(JSON.stringify(fallbackExplanation), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      }
    } catch (err) {
      clearTimeout(t);
      if ((err as Error).name === 'AbortError') console.error('Explain request timed out');
      return new Response(JSON.stringify(fallbackExplanation), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return new Response(JSON.stringify(fallbackExplanation), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    const responseContent = data.result ?? data.message ?? data.output ?? data.response ?? data;
    const responseStr = typeof responseContent === 'string' ? responseContent : JSON.stringify(responseContent ?? '');
    let explanation: typeof fallbackExplanation;
    try {
      let jsonStr = responseStr.trim();
      if (responseStr.includes('```json')) {
        const m = responseStr.match(/```json\s*([\s\S]*?)```/);
        if (m) jsonStr = m[1].trim();
      } else if (responseStr.includes('{')) {
        const start = responseStr.indexOf('{');
        let depth = 0, end = start;
        for (let i = start; i < responseStr.length; i++) {
          if (responseStr[i] === '{') depth++;
          else if (responseStr[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
        }
        if (depth === 0) jsonStr = responseStr.slice(start, end);
      }
      const parsed = JSON.parse(jsonStr) as Record<string, string>;
      explanation = {
        simple: parsed.simple ?? fallbackExplanation.simple,
        detailed: parsed.detailed ?? fallbackExplanation.detailed,
        symbolism: parsed.symbolism ?? fallbackExplanation.symbolism
      };
    } catch (parseError) {
      console.error('Parse explanation failed:', parseError);
      explanation = fallbackExplanation;
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