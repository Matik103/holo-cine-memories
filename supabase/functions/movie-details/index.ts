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
    const omdbApiKey = Deno.env.get('OMDB_API_KEY');

    if (!movieTitle || !omdbApiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing movie title or API key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching details for: ${movieTitle} (${movieYear || 'any year'})`);

    // Build OMDB API URL
    let omdbUrl = `http://www.omdbapi.com/?apikey=${omdbApiKey}&t=${encodeURIComponent(movieTitle)}&plot=full`;
    if (movieYear) {
      omdbUrl += `&y=${movieYear}`;
    }

    // Fetch from OMDB API
    const omdbResponse = await fetch(omdbUrl);
    const omdbData = await omdbResponse.json();

    if (omdbData.Response === 'False') {
      console.error('OMDB API Error:', omdbData.Error);
      return new Response(
        JSON.stringify({ error: 'Movie not found', details: omdbData.Error }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform OMDB data to our format
    const movieDetails = {
      title: omdbData.Title,
      year: omdbData.Year,
      director: omdbData.Director,
      genre: omdbData.Genre,
      plot: omdbData.Plot,
      imdbRating: omdbData.imdbRating,
      runtime: omdbData.Runtime,
      cast: omdbData.Actors,
      poster: omdbData.Poster !== 'N/A' ? omdbData.Poster : null,
      awards: omdbData.Awards,
      boxOffice: omdbData.BoxOffice,
      country: omdbData.Country,
      language: omdbData.Language,
      rated: omdbData.Rated,
      released: omdbData.Released,
      writer: omdbData.Writer,
      metascore: omdbData.Metascore,
      imdbVotes: omdbData.imdbVotes,
      type: omdbData.Type,
      dvd: omdbData.DVD,
      production: omdbData.Production,
      website: omdbData.Website
    };

    console.log('Successfully fetched movie details:', movieDetails.title);

    return new Response(
      JSON.stringify({ movieDetails }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in movie-details function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch movie details', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});