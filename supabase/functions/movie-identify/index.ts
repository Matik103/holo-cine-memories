import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const omdbApiKey = Deno.env.get('OMDB_API_KEY');
const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to fetch movie poster from OMDb with multiple fallback strategies
async function fetchMoviePoster(title: string, year?: number): Promise<string | null> {
  if (!omdbApiKey) {
    console.log('OMDb API key not available, skipping poster fetch');
    return null;
  }

  // Try multiple search strategies
  const searchStrategies = [
    // Strategy 1: Title + Year
    year ? `${title} ${year}` : null,
    // Strategy 2: Just title
    title,
    // Strategy 3: Remove common words and try again
    title.replace(/\b(the|a|an)\b/gi, '').trim(),
    // Strategy 4: Try without year if year was provided
    year ? title : null
  ].filter(Boolean);

  for (const searchQuery of searchStrategies) {
    if (!searchQuery) continue;
    
    try {
      const omdbUrl = `https://www.omdbapi.com/?apikey=${omdbApiKey}&t=${encodeURIComponent(searchQuery)}&plot=short`;
      
      console.log('Fetching poster from OMDb for:', searchQuery);
      
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
        continue;
      }
      
      const data = await response.json();
      
      if (data.Response === 'True' && data.Poster && data.Poster !== 'N/A') {
        console.log('Found poster:', data.Poster);
        return data.Poster;
      } else {
        console.log(`No poster found for search: "${searchQuery}". Response:`, data.Response);
        if (data.Error) {
          console.log('OMDb error:', data.Error);
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log(`OMDb request timeout for "${searchQuery}"`);
      } else {
        console.error(`Error fetching poster for "${searchQuery}":`, error);
      }
      continue;
    }
  }
  
  console.log('No poster found after trying all search strategies for:', title);
  
  // Final fallback: Try TMDB API (free, no key required for basic searches)
  try {
    console.log('Trying TMDB fallback for:', title);
    const tmdbSearchUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}${year ? `&year=${year}` : ''}`;
    
    const tmdbResponse = await fetch(tmdbSearchUrl);
    if (tmdbResponse.ok) {
      const tmdbData = await tmdbResponse.json();
      
      if (tmdbData.results && tmdbData.results.length > 0) {
        const movie = tmdbData.results[0];
        if (movie.poster_path) {
          const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
          console.log('Found poster via TMDB fallback:', posterUrl);
          return posterUrl;
        }
      }
    }
  } catch (error) {
    console.error('TMDB fallback failed:', error);
  }
  
  return null;
}

// Function to fetch movie trailer from YouTube
async function fetchMovieTrailer(title: string, year?: number): Promise<string | null> {
  if (!youtubeApiKey) {
    console.log('YouTube API key not available, skipping trailer fetch');
    return null;
  }

  try {
    const searchQuery = year ? `${title} ${year} official trailer` : `${title} official trailer`;
    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&videoCategoryId=24&key=${youtubeApiKey}&maxResults=1`;
    
    console.log('Fetching trailer from YouTube for:', searchQuery);
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(youtubeUrl, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'CineMind/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`YouTube API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const videoId = data.items[0].id.videoId;
      const trailerUrl = `https://www.youtube.com/watch?v=${videoId}`;
      console.log('Found trailer:', trailerUrl);
      return trailerUrl;
    } else {
      console.log('No trailer found in YouTube for:', searchQuery);
      return null;
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.log('YouTube request timeout for:', title);
    } else {
      console.error('Error fetching trailer from YouTube:', error);
    }
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    console.log('Received movie identification query:', query);

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiController = new AbortController();
    const aiTimeout = setTimeout(() => aiController.abort(), 18000);
    const aiResponse = await fetch('https://open-ai21.p.rapidapi.com/conversationllama', {
      method: 'POST',
      signal: aiController.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'open-ai21.p.rapidapi.com',
        'x-rapidapi-key': Deno.env.get('RAPIDAPI_KEY')!,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'From the user\'s input (few words, quote, scene, or feeling), identify the movie. Reply with ONLY valid JSON, nothing else. Format: {"title":"Movie Title","year":2020,"confidence":0.9,"plot":"brief plot","director":"Name","genre":["Drama"]}. If unknown: {"title":null,"confidence":0}. Keep response minimal.'
          },
          { role: 'user', content: String(query).trim() }
        ],
        web_access: false,
      }),
    });
    clearTimeout(aiTimeout);

    let rawBody: string;
    try {
      rawBody = await aiResponse.text();
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        console.error('AI request timed out');
        return new Response(JSON.stringify({
          error: 'AI request timed out',
          title: null,
          confidence: 0
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      }
      throw err;
    }
    if (!aiResponse.ok) {
      console.error('AI API error:', aiResponse.status, rawBody.slice(0, 500));
      return new Response(JSON.stringify({
        error: 'AI service unavailable',
        title: null,
        confidence: 0
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      console.error('AI API returned non-JSON:', rawBody.slice(0, 500));
      return new Response(JSON.stringify({
        error: 'Invalid response format from AI',
        title: null,
        confidence: 0
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    // Log raw shape for debugging (Supabase function logs)
    console.log('AI response keys:', Object.keys(data).join(', '));

    // Support multiple response shapes from RapidAPI / AI providers
    let responseContent: unknown = data.result ?? data.message ?? data.output ?? data.response ?? data.text ?? data.body ?? data.data ?? data.content ?? data.reply ?? data.answer;
    if (responseContent == null && Array.isArray(data.choices)?.[0]) {
      const first = data.choices[0] as Record<string, unknown>;
      const msg = first?.message as Record<string, unknown> | undefined;
      responseContent = msg?.content ?? msg?.text;
    }
    if (responseContent == null && Array.isArray(data.messages)) {
      const last = data.messages[data.messages.length - 1] as Record<string, unknown> | undefined;
      responseContent = last?.content ?? last?.text ?? last?.message;
    }
    if (typeof responseContent === 'object' && responseContent != null && responseContent !== null) {
      const obj = responseContent as Record<string, unknown>;
      if (typeof obj.content === 'string') responseContent = obj.content;
      else if (typeof obj.text === 'string') responseContent = obj.text;
      else if (typeof obj.message === 'string') responseContent = obj.message;
    }
    const responseStr = typeof responseContent === 'string' ? responseContent : JSON.stringify(responseContent ?? '');
    console.log('AI response received, length:', responseStr.length);

    let movieData: { title?: string | null; confidence?: number; year?: number; [k: string]: unknown };
    try {
      console.log('Raw AI response:', responseStr.slice(0, 500));
      
      // Try to extract JSON: markdown code block, then raw {...}, then parse whole string
      let jsonContent = responseStr.trim();
      if (responseStr.includes('```json')) {
        const jsonMatch = responseStr.match(/```json\s*([\s\S]*?)```/);
        if (jsonMatch) jsonContent = jsonMatch[1].trim();
      } else if (responseStr.includes('```')) {
        const jsonMatch = responseStr.match(/```\s*([\s\S]*?)```/);
        if (jsonMatch) jsonContent = jsonMatch[1].trim();
      }
      if (!jsonContent.startsWith('{')) {
        const start = responseStr.indexOf('{');
        if (start >= 0) {
          let depth = 0;
          let end = start;
          for (let i = start; i < responseStr.length; i++) {
            if (responseStr[i] === '{') depth++;
            else if (responseStr[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
          }
          if (depth === 0) jsonContent = responseStr.slice(start, end);
        }
      }
      
      // Strip BOM and any leading/trailing whitespace
      jsonContent = jsonContent.replace(/^\uFEFF/, '').trim();
      movieData = JSON.parse(jsonContent) as typeof movieData;
      if (movieData && typeof movieData !== 'object') {
        throw new Error('Parsed value is not an object');
      }
      movieData = movieData ?? {};
      if (movieData.title === undefined) movieData.title = null;
      if (movieData.confidence === undefined) movieData.confidence = 0;
      // Coerce confidence if API returned string
      if (typeof movieData.confidence === 'string') {
        movieData.confidence = parseFloat(movieData.confidence) || 0;
      }
      console.log('Parsed movie data:', movieData);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseStr.slice(0, 500));
      console.error('Parse error:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid response format from AI',
        title: null,
        confidence: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // Fetch poster and trailer with short timeout; never throw so we don't return 500
    if (movieData.title && (movieData.confidence ?? 0) >= 0.45) {
      const withTimeout = <T>(p: Promise<T>, ms: number): Promise<T | null> =>
        Promise.race([p, new Promise<null>((r) => setTimeout(() => r(null), ms))]);
      const safe = <T>(p: Promise<T>): Promise<T | null> => p.catch(() => null);
      const [posterUrl, trailerUrl] = await Promise.all([
        withTimeout(safe(fetchMoviePoster(movieData.title!, movieData.year as number | undefined)), 3200),
        withTimeout(safe(fetchMovieTrailer(movieData.title!, movieData.year as number | undefined)), 3200)
      ]);
      movieData.poster_url = posterUrl ?? null;
      movieData.trailer_url = trailerUrl ?? null;
    }

    // If movie identified, save search to database
    if (movieData.title && (movieData.confidence ?? 0) >= 0.45) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: userData } = await supabase.auth.getUser(token);
        
        if (userData.user) {
          await supabase.from('movie_searches').insert({
            user_id: userData.user.id,
            search_query: query,
            movie_title: movieData.title,
            movie_year: movieData.year,
            movie_poster_url: movieData.poster_url,
            movie_trailer_url: movieData.trailer_url,
            movie_plot: movieData.plot
          });
          console.log('Saved search to database for user:', userData.user.id);
          
          // Update CineDNA profile asynchronously
          try {
            const cinednaResponse = await fetch(`${supabaseUrl}/functions/v1/update-cinedna`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ userId: userData.user.id })
            });
            
            if (cinednaResponse.ok) {
              console.log('CineDNA profile updated for user:', userData.user.id);
            } else {
              console.log('Failed to update CineDNA profile, but search was saved');
            }
          } catch (cinednaError) {
            console.log('Error updating CineDNA profile:', cinednaError);
            // Don't fail the main request if CineDNA update fails
          }
        }
      }
    }

    return new Response(JSON.stringify(movieData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in movie-identify function:', error);
    return new Response(JSON.stringify({ 
      error: (error as Error).message,
      title: null,
      confidence: 0.0 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});