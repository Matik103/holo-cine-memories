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
    console.log('Calling movie-identify function with query:', query);
    
    const { data, error } = await supabase.functions.invoke('movie-identify', {
      body: { query }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }
    
    console.log('Movie-identify response:', data);
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
  // Enhanced fallback with more variety and better matching
  const fallbackMovies = [
    // Sci-Fi Movies
    {
      title: "The Matrix",
      year: 1999,
      director: "The Wachowskis",
      genre: ["Action", "Sci-Fi"],
      plot: "A computer hacker learns about the true nature of reality.",
      imdbRating: 8.7,
      runtime: 136,
      cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
      poster: "https://m.media-amazon.com/images/M/MV5BN2NmN2VhMTQtMDNiOS00NDlhLTliMjgtODE2ZTY0ODQyNDRhXkEyXkFqcGc@._V1_SX300.jpg"
    },
    {
      title: "Blade Runner",
      year: 1982,
      director: "Ridley Scott",
      genre: ["Sci-Fi", "Thriller"],
      plot: "A blade runner must pursue and terminate four replicants.",
      imdbRating: 8.1,
      runtime: 117,
      cast: ["Harrison Ford", "Rutger Hauer", "Sean Young"],
      poster: "https://m.media-amazon.com/images/M/MV5BNzA1Njg4NzYxOV5BMl5BanBnXkFtZTcwODk5MzU1Mw@@._V1_SX300.jpg"
    },
    {
      title: "Interstellar",
      year: 2014,
      director: "Christopher Nolan",
      genre: ["Adventure", "Drama", "Sci-Fi"],
      plot: "A team of explorers travel through a wormhole in space.",
      imdbRating: 8.6,
      runtime: 169,
      cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
      poster: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGc@._V1_SX300.jpg"
    },
    {
      title: "Ex Machina",
      year: 2014,
      director: "Alex Garland",
      genre: ["Drama", "Sci-Fi", "Thriller"],
      plot: "A young programmer is selected to participate in a breakthrough experiment in artificial intelligence.",
      imdbRating: 7.7,
      runtime: 108,
      cast: ["Domhnall Gleeson", "Alicia Vikander", "Oscar Isaac"],
      poster: "https://m.media-amazon.com/images/M/MV5BMTUxNzc0OTIxMV5BMl5BanBnXkFtZTgwNDI3NzU2NDE@._V1_SX300.jpg"
    },
    // Action Movies
    {
      title: "John Wick",
      year: 2014,
      director: "Chad Stahelski",
      genre: ["Action", "Crime", "Thriller"],
      plot: "An ex-hit-man comes out of retirement to track down the gangsters that took everything from him.",
      imdbRating: 7.4,
      runtime: 101,
      cast: ["Keanu Reeves", "Michael Nyqvist", "Alfie Allen"],
      poster: "https://m.media-amazon.com/images/M/MV5BMTU2NjA1ODgzMF5BMl5BanBnXkFtZTgwMTM2MTI4MjE@._V1_SX300.jpg"
    },
    {
      title: "Mad Max: Fury Road",
      year: 2015,
      director: "George Miller",
      genre: ["Action", "Adventure", "Sci-Fi"],
      plot: "In a post-apocalyptic wasteland, Max teams up with a mysterious woman to escape from a tyrannical warlord.",
      imdbRating: 8.1,
      runtime: 120,
      cast: ["Tom Hardy", "Charlize Theron", "Nicholas Hoult"],
      poster: "https://m.media-amazon.com/images/M/MV5BN2EwM2I0OWMtMGQyMi00Zjg1LTk1MzEtNjFkMGFiNzNkODNhXkEyXkFqcGc@._V1_SX300.jpg"
    },
    // Drama Movies
    {
      title: "The Shawshank Redemption",
      year: 1994,
      director: "Frank Darabont",
      genre: ["Drama"],
      plot: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      imdbRating: 9.3,
      runtime: 142,
      cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
      poster: "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGc@._V1_SX300.jpg"
    },
    {
      title: "Forrest Gump",
      year: 1994,
      director: "Robert Zemeckis",
      genre: ["Drama", "Romance"],
      plot: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man.",
      imdbRating: 8.8,
      runtime: 142,
      cast: ["Tom Hanks", "Robin Wright", "Gary Sinise"],
      poster: "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGc@._V1_SX300.jpg"
    },
    // Comedy Movies
    {
      title: "The Grand Budapest Hotel",
      year: 2014,
      director: "Wes Anderson",
      genre: ["Adventure", "Comedy", "Crime"],
      plot: "The adventures of Gustave H, a legendary concierge at a famous European hotel, and his protégé Zero Moustafa.",
      imdbRating: 8.1,
      runtime: 99,
      cast: ["Ralph Fiennes", "F. Murray Abraham", "Mathieu Amalric"],
      poster: "https://m.media-amazon.com/images/M/MV5BMzM5NjUxOTEyMl5BMl5BanBnXkFtZTgwNjEyMDM0MDE@._V1_SX300.jpg"
    },
    {
      title: "Deadpool",
      year: 2016,
      director: "Tim Miller",
      genre: ["Action", "Adventure", "Comedy"],
      plot: "A wisecracking mercenary gets experimented on and becomes immortal but ugly, and sets out to track down the man who ruined his looks.",
      imdbRating: 8.0,
      runtime: 108,
      cast: ["Ryan Reynolds", "Morena Baccarin", "T.J. Miller"],
      poster: "https://m.media-amazon.com/images/M/MV5BYzE5MjY1ZDgtMTkyNC00MTJlLWE1M2YtMjM2YjQ0YzQzYzQzXkEyXkFqcGc@._V1_SX300.jpg"
    },
    // Horror Movies
    {
      title: "Get Out",
      year: 2017,
      director: "Jordan Peele",
      genre: ["Horror", "Mystery", "Thriller"],
      plot: "A young African-American visits his white girlfriend's parents for the weekend, where his uneasiness about their reception of him eventually reaches a boiling point.",
      imdbRating: 7.7,
      runtime: 104,
      cast: ["Daniel Kaluuya", "Allison Williams", "Bradley Whitford"],
      poster: "https://m.media-amazon.com/images/M/MV5BMjUxMDQwNjcyNl5BMl5BanBnXkFtZTgwNzcwMzc0MTI@._V1_SX300.jpg"
    },
    {
      title: "Hereditary",
      year: 2018,
      director: "Ari Aster",
      genre: ["Drama", "Horror", "Mystery"],
      plot: "A grieving family is haunted by tragic and disturbing occurrences.",
      imdbRating: 7.3,
      runtime: 127,
      cast: ["Toni Collette", "Milly Shapiro", "Gabriel Byrne"],
      poster: "https://m.media-amazon.com/images/M/MV5BOTU5MDg3OGItZWQ1OO00YjI0LTk0YzUtN2RjYzQzYzQzYzQzXkEyXkFqcGc@._V1_SX300.jpg"
    }
  ];

  // Enhanced matching logic
  const movieGenres = movie.genre || [];
  const movieYear = movie.year || 0;
  const movieDirector = movie.director || '';
  
  // Score movies based on multiple factors
  const scoredMovies = fallbackMovies.map(fallbackMovie => {
    let score = 0;
    
    // Genre matching (40% weight)
    const genreMatches = fallbackMovie.genre.filter(genre => movieGenres.includes(genre)).length;
    score += (genreMatches / fallbackMovie.genre.length) * 40;
    
    // Director matching (20% weight)
    if (movieDirector && fallbackMovie.director.toLowerCase().includes(movieDirector.toLowerCase())) {
      score += 20;
    }
    
    // Year proximity (20% weight)
    const yearDiff = Math.abs(fallbackMovie.year - movieYear);
    if (yearDiff <= 5) score += 20;
    else if (yearDiff <= 10) score += 15;
    else if (yearDiff <= 20) score += 10;
    
    // IMDB rating (20% weight)
    if (fallbackMovie.imdbRating >= 8.0) score += 20;
    else if (fallbackMovie.imdbRating >= 7.0) score += 15;
    else if (fallbackMovie.imdbRating >= 6.0) score += 10;
    
    return { ...fallbackMovie, score };
  });
  
  // Sort by score and return top 3
  return scoredMovies
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ score, ...movie }) => movie);
};