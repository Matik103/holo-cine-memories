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