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
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
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
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
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

    const similarMovies: any[] = [];
    
    // Search for movies in each genre
    for (const genreItem of genre.slice(0, 3)) { // Limit to first 3 genres
      console.log(`Searching for movies in genre: ${genreItem}`);
      
      const genreMovies = await searchMoviesByGenre(genreItem, year);
      
      for (const movie of genreMovies) {
        if (movie.imdbID) {
          console.log(`Getting details for: ${movie.Title} (${movie.Year})`);
          const details = await getMovieDetails(movie.imdbID);
          
          if (details) {
            const transformedMovie = transformOMDbMovie(details);
            // Avoid duplicates and the original movie
            if (transformedMovie.title.toLowerCase() !== title.toLowerCase() && 
                !similarMovies.some(m => m.title.toLowerCase() === transformedMovie.title.toLowerCase())) {
              similarMovies.push(transformedMovie);
            }
          }
        }
      }
      
      // If we have enough movies, break
      if (similarMovies.length >= 6) {
        break;
      }
    }
    
    console.log(`Found ${similarMovies.length} similar movies`);
    
    // If we don't have enough movies, try searching without year constraint
    if (similarMovies.length < 3) {
      console.log('Not enough movies found, trying without year constraint');
      
      for (const genreItem of genre.slice(0, 2)) {
        const genreMovies = await searchMoviesByGenre(genreItem);
        
        for (const movie of genreMovies) {
          if (movie.imdbID && similarMovies.length < 6) {
            const details = await getMovieDetails(movie.imdbID);
            
            if (details) {
              const transformedMovie = transformOMDbMovie(details);
              if (transformedMovie.title.toLowerCase() !== title.toLowerCase() && 
                  !similarMovies.some(m => m.title.toLowerCase() === transformedMovie.title.toLowerCase())) {
                similarMovies.push(transformedMovie);
              }
            }
          }
        }
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
