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
    const { movieTitle, movieYear } = await req.json();
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');

    if (!movieTitle || !youtubeApiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing movie title or API key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Searching for trailer: ${movieTitle} (${movieYear || 'any year'})`);

    // Build search query
    const searchQuery = movieYear 
      ? `${movieTitle} ${movieYear} official trailer`
      : `${movieTitle} official trailer`;

    // Search YouTube for the trailer
    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(searchQuery)}&type=video&key=${youtubeApiKey}`;

    const youtubeResponse = await fetch(youtubeUrl);
    const youtubeData = await youtubeResponse.json();

    if (youtubeData.error) {
      console.error('YouTube API Error:', youtubeData.error);
      return new Response(
        JSON.stringify({ error: 'YouTube API error', details: youtubeData.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the best trailer from results
    let bestTrailer = null;
    
    if (youtubeData.items && youtubeData.items.length > 0) {
      // Look for official trailers first
      const officialTrailer = youtubeData.items.find(item => 
        item.snippet.title.toLowerCase().includes('official') && 
        item.snippet.title.toLowerCase().includes('trailer')
      );

      // If no official trailer, look for any trailer
      const anyTrailer = youtubeData.items.find(item => 
        item.snippet.title.toLowerCase().includes('trailer')
      );

      // Use the first result if nothing else found
      bestTrailer = officialTrailer || anyTrailer || youtubeData.items[0];
    }

    if (!bestTrailer) {
      console.log('No trailer found for:', movieTitle);
      return new Response(
        JSON.stringify({ trailer: null, message: 'No trailer found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trailer = {
      videoId: bestTrailer.id.videoId,
      title: bestTrailer.snippet.title,
      description: bestTrailer.snippet.description,
      thumbnail: bestTrailer.snippet.thumbnails.high?.url || bestTrailer.snippet.thumbnails.default?.url,
      channelTitle: bestTrailer.snippet.channelTitle,
      publishedAt: bestTrailer.snippet.publishedAt,
      embedUrl: `https://www.youtube.com/embed/${bestTrailer.id.videoId}`,
      watchUrl: `https://www.youtube.com/watch?v=${bestTrailer.id.videoId}`
    };

    console.log('Found trailer:', trailer.title);

    return new Response(
      JSON.stringify({ trailer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in movie-trailer function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch trailer', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});