import { supabase } from "@/integrations/supabase/client";

export interface Movie {
  title: string;
  year: number;
  director: string;
  genre: string[];
  plot: string;
  imdbRating: number;
  runtime: number;
  cast: string[];
  poster: string;
  confidence?: number;
}

let openai: any = null;

export const initializeOpenAI = (apiKey: string) => {
  // We'll use Supabase edge functions instead of direct OpenAI calls
  console.log('OpenAI API key configured for edge functions');
};

export const identifyMovie = async (query: string): Promise<Movie | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('movie-identify', {
      body: { query }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error identifying movie:', error);
    throw error;
  }
};

export const explainMovie = async (movieTitle: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('movie-explain', {
      body: { movieTitle }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error explaining movie:', error);
    throw error;
  }
};

export const getStreamingOptions = async (movieTitle: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('movie-streaming', {
      body: { movieTitle }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting streaming options:', error);
    throw error;
  }
};

export const findSimilarMovies = async (movie: Movie): Promise<Movie[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('movie-similar', {
      body: { 
        title: movie.title,
        year: movie.year,
        genre: movie.genre,
        director: movie.director
      }
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error finding similar movies:', error);
    // Return fallback similar movies based on genre
    return getFallbackSimilarMovies(movie);
  }
};

const getFallbackSimilarMovies = (movie: Movie): Movie[] => {
  // Simple fallback based on genre and year
  const similarMovies: Movie[] = [];
  
  // This is a basic fallback - in a real app you'd have a proper database
  const fallbackMovies = [
    {
      title: "The Matrix",
      year: 1999,
      director: "The Wachowskis",
      genre: ["Action", "Sci-Fi"],
      plot: "A computer hacker learns about the true nature of reality.",
      imdbRating: 8.7,
      runtime: 136,
      cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"]
    },
    {
      title: "Blade Runner",
      year: 1982,
      director: "Ridley Scott",
      genre: ["Sci-Fi", "Thriller"],
      plot: "A blade runner must pursue and terminate four replicants.",
      imdbRating: 8.1,
      runtime: 117,
      cast: ["Harrison Ford", "Rutger Hauer", "Sean Young"]
    },
    {
      title: "Interstellar",
      year: 2014,
      director: "Christopher Nolan",
      genre: ["Adventure", "Drama", "Sci-Fi"],
      plot: "A team of explorers travel through a wormhole in space.",
      imdbRating: 8.6,
      runtime: 169,
      cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"]
    }
  ];

  // Filter by genre similarity
  const movieGenres = movie.genre || [];
  return fallbackMovies.filter(fallbackMovie => 
    fallbackMovie.genre.some(genre => movieGenres.includes(genre))
  ).slice(0, 3);
};