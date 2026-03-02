const TMDB_API_KEY = '2dca580c2a14b55200e784d157207b4d'; // Free public API key for demo
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  tagline: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  genres: { id: number; name: string }[];
}

interface TMDBSearchResult {
  results: {
    id: number;
    title: string;
    release_date: string;
  }[];
}

const movieIdCache: Map<string, number> = new Map();

async function searchMovieId(title: string, year: string): Promise<number | null> {
  const cacheKey = `${title}_${year}`;
  if (movieIdCache.has(cacheKey)) {
    return movieIdCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&year=${year}`
    );
    
    if (!response.ok) return null;
    
    const data: TMDBSearchResult = await response.json();
    
    if (data.results && data.results.length > 0) {
      const movieId = data.results[0].id;
      movieIdCache.set(cacheKey, movieId);
      return movieId;
    }
    
    return null;
  } catch {
    return null;
  }
}

export async function getLocalizedMovie(
  title: string,
  year: string,
  language: string = 'en'
): Promise<TMDBMovie | null> {
  const movieId = await searchMovieId(title, year);
  if (!movieId) return null;

  try {
    const langCode = language.split('-')[0];
    
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=${langCode}`
    );
    
    if (!response.ok) return null;
    
    const data: TMDBMovie = await response.json();
    return data;
  } catch {
    return null;
  }
}

export async function getLocalizedMovies(
  movies: { title: string; year: string }[],
  language: string = 'en'
): Promise<Map<string, TMDBMovie>> {
  const results = new Map<string, TMDBMovie>();
  
  const promises = movies.map(async (movie) => {
    const localized = await getLocalizedMovie(movie.title, movie.year, language);
    if (localized) {
      results.set(`${movie.title}_${movie.year}`, localized);
    }
  });
  
  await Promise.all(promises);
  return results;
}

export function getTMDBPosterUrl(posterPath: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w500'): string {
  if (!posterPath) return '/placeholder.svg';
  return `${TMDB_IMAGE_BASE}/${size}${posterPath}`;
}

export function getTMDBBackdropUrl(backdropPath: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w780'): string {
  if (!backdropPath) return '/placeholder.svg';
  return `${TMDB_IMAGE_BASE}/${size}${backdropPath}`;
}

const localizedMovieCache: Map<string, TMDBMovie> = new Map();

export async function getCachedLocalizedMovie(
  title: string,
  year: string,
  language: string
): Promise<TMDBMovie | null> {
  const cacheKey = `${title}_${year}_${language}`;
  
  if (localizedMovieCache.has(cacheKey)) {
    return localizedMovieCache.get(cacheKey)!;
  }
  
  const movie = await getLocalizedMovie(title, year, language);
  if (movie) {
    localizedMovieCache.set(cacheKey, movie);
  }
  
  return movie;
}
