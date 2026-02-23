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

  let movieTitle = 'Unknown Movie'; // Default fallback
  
  try {
    const requestData = await req.json();
    movieTitle = requestData.movieTitle;
    console.log('Finding streaming options for:', movieTitle);

    if (!movieTitle) {
      return new Response(JSON.stringify({ error: 'Movie title is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const fallbackStreaming = [
      { platform: "Search manually", type: "search", price: "Various", url: "https://www.google.com/search?q=" + encodeURIComponent(movieTitle + " streaming"), quality: "Various" }
    ];

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 12000);
    let response: Response;
    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'Reply with ONLY a JSON array of 3-5 streaming options. Each: {"platform":"Name","type":"subscription|rent|buy|free","price":"...","url":"https://...","quality":"4K|HD|SD"}. Real platforms only. No other text.' },
            { role: 'user', content: `Streaming options for "${movieTitle}".` }
          ],
          max_tokens: 350,
          temperature: 0.3,
        }),
      });
      clearTimeout(t);
    } catch (err) {
      clearTimeout(t);
      if ((err as Error).name === 'AbortError') console.error('Streaming request timed out');
      return new Response(JSON.stringify(fallbackStreaming), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    const data = await response.json();
    console.log('OpenAI streaming response received');
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    let streamingOptions;
    try {
      const responseContent = data.choices[0].message.content;
      console.log('Raw streaming response:', responseContent);
      
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
      
      streamingOptions = JSON.parse(jsonContent);
      console.log('Parsed streaming options:', streamingOptions);
      
      // Ensure it's an array
      if (!Array.isArray(streamingOptions)) {
        console.warn('Streaming options is not an array, wrapping in array');
        streamingOptions = [];
      }
    } catch (parseError) {
      console.error('Failed to parse streaming response:', data.choices[0].message.content);
      console.error('Parse error:', parseError);
      
      streamingOptions = fallbackStreaming;
    }

    return new Response(JSON.stringify(streamingOptions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in movie-streaming function:', error);
    const fallback = [
      { platform: "Search manually", type: "search", price: "Various", url: "https://www.google.com/search?q=" + encodeURIComponent(movieTitle + " streaming"), quality: "Various" }
    ];
    return new Response(JSON.stringify({ error: (error as Error).message, fallback }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});