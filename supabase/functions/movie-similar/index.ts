import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const omdbApiKey = Deno.env.get('OMDB_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to search movies by genre using OMDb API
async function searchMoviesByGenre(genre: string, year?: number): Promise<any[]> {
  if (!omdbApiKey) {
    console.log('OMDb API key not available, skipping genre search');
    return [];
  }

  try {
    // Search for movies by genre
    const searchQuery = year ? `${genre} movie ${year}` : `${genre} movie`;
    const omdbUrl = `https://www.omdbapi.com/?apikey=${omdbApiKey}&s=${encodeURIComponent(searchQuery)}&type=movie&page=1`;
    
    console.log('Searching movies by genre:', searchQuery);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    
    const response = await fetch(omdbUrl, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'CineMind/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`OMDb API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    
    if (data.Response === 'True' && data.Search && data.Search.length > 0) {
      console.log(`Found ${data.Search.length} movies for genre: ${genre}`);
      return data.Search.slice(0, 6); // Limit to 6 movies
    } else {
      console.log(`No movies found for genre: ${genre}`);
      return [];
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.log(`OMDb request timeout for genre: ${genre}`);
    } else {
      console.error(`Error searching movies for genre "${genre}":`, error);
    }
    return [];
  }
}

// Function to get detailed movie info including poster
async function getMovieDetails(imdbId: string): Promise<any | null> {
  if (!omdbApiKey) {
    console.log('OMDb API key not available, skipping movie details');
    return null;
  }

  try {
    const omdbUrl = `https://www.omdbapi.com/?apikey=${omdbApiKey}&i=${imdbId}&plot=short`;
    
    console.log('Getting movie details for IMDB ID:', imdbId);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    
    const response = await fetch(omdbUrl, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'CineMind/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`OMDb API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.Response === 'True') {
      console.log('Got movie details for:', data.Title);
      return data;
    } else {
      console.log('No details found for IMDB ID:', imdbId);
      return null;
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.log(`OMDb request timeout for IMDB ID: ${imdbId}`);
    } else {
      console.error(`Error getting movie details for IMDB ID "${imdbId}":`, error);
    }
    return null;
  }
}

// Function to transform OMDb data to our Movie format
function transformOMDbMovie(omdbData: any): any {
  return {
    title: omdbData.Title || 'Unknown Title',
    year: parseInt(omdbData.Year) || new Date().getFullYear(),
    director: omdbData.Director || 'Unknown Director',
    genre: omdbData.Genre ? omdbData.Genre.split(', ').map((g: string) => g.trim()) : [],
    plot: omdbData.Plot || 'No plot available',
    imdbRating: parseFloat(omdbData.imdbRating) || 0,
    runtime: parseInt(omdbData.Runtime?.replace(' min', '')) || 0,
    cast: omdbData.Actors ? omdbData.Actors.split(', ').map((a: string) => a.trim()).slice(0, 5) : [],
    poster: omdbData.Poster && omdbData.Poster !== 'N/A' ? omdbData.Poster : undefined
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, year, genre, director } = await req.json();
    
    console.log('Finding similar movies for:', { title, year, genre, director });
    
    if (!genre || !Array.isArray(genre) || genre.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Genre information is required',
        similarMovies: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const seen = new Set<string>();
    const addIfNew = (m: any) => {
      const key = m.title.toLowerCase();
      if (key === title.toLowerCase() || seen.has(key)) return false;
      seen.add(key);
      return true;
    };
    const similarMovies: any[] = [];

    for (const genreItem of genre.slice(0, 3)) {
      const genreMovies = await searchMoviesByGenre(genreItem, year);
      const ids = genreMovies.filter((m: any) => m.imdbID).slice(0, 6).map((m: any) => m.imdbID);
      const detailsList = await Promise.all(ids.map((id: string) => getMovieDetails(id)));
      for (const details of detailsList) {
        if (details) {
          const transformed = transformOMDbMovie(details);
          if (addIfNew(transformed)) similarMovies.push(transformed);
        }
        if (similarMovies.length >= 6) break;
      }
      if (similarMovies.length >= 6) break;
    }

    if (similarMovies.length < 3) {
      for (const genreItem of genre.slice(0, 2)) {
        const genreMovies = await searchMoviesByGenre(genreItem);
        const ids = genreMovies.filter((m: any) => m.imdbID).slice(0, 4).map((m: any) => m.imdbID);
        const detailsList = await Promise.all(ids.map((id: string) => getMovieDetails(id)));
        for (const details of detailsList) {
          if (details && similarMovies.length < 6) {
            const transformed = transformOMDbMovie(details);
            if (addIfNew(transformed)) similarMovies.push(transformed);
          }
        }
        if (similarMovies.length >= 6) break;
      }
    }
    
    // Sort by IMDB rating (highest first)
    similarMovies.sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0));
    
    // Return top 6 movies
    const finalMovies = similarMovies.slice(0, 6);
    
    console.log(`Returning ${finalMovies.length} similar movies`);
    
    return new Response(JSON.stringify({ 
      similarMovies: finalMovies
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    console.error('Error in movie-similar function:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to find similar movies',
      similarMovies: []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
