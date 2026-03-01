import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Industry-standard: Retry with exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, maxRetries = 3): Promise<Response> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      
      if (attempt === maxRetries) throw new Error(`HTTP ${response.status}`);
      
      // Exponential backoff: 1s, 2s, 4s
      const delayMs = Math.pow(2, attempt - 1) * 1000;
      console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
      await delay(delayMs);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delayMs = Math.pow(2, attempt - 1) * 1000;
      console.log(`Network error on attempt ${attempt}, retrying in ${delayMs}ms...`);
      await delay(delayMs);
    }
  }
  throw new Error('All retry attempts failed');
};

// Language-specific trailer keywords
const TRAILER_KEYWORDS: Record<string, string[]> = {
  en: ['official trailer', 'trailer official', 'movie trailer', 'trailer'],
  es: ['tráiler oficial', 'trailer oficial', 'tráiler', 'trailer español'],
  fr: ['bande-annonce officielle', 'bande annonce', 'trailer vf', 'bande-annonce'],
  de: ['offizieller trailer', 'trailer deutsch', 'filmtrailer', 'trailer'],
  pt: ['trailer oficial', 'trailer legendado', 'trailer dublado', 'trailer'],
  zh: ['官方预告片', '预告片', '中文预告', 'trailer'],
  ja: ['予告編', '公式予告', 'トレーラー', 'trailer'],
  ko: ['공식 예고편', '예고편', '트레일러', 'trailer'],
  ar: ['الإعلان الرسمي', 'إعلان الفيلم', 'تريلر', 'trailer'],
  hi: ['आधिकारिक ट्रेलर', 'ट्रेलर', 'हिंदी ट्रेलर', 'trailer'],
  id: ['trailer resmi', 'cuplikan film', 'trailer', 'trailer indonesia'],
  ht: ['bann anons ofisyèl', 'trailer', 'bann anons', 'trailer'],
};

// Industry-standard: Multiple search strategies with language support
const generateSearchQueries = (movieTitle: string, movieYear?: string, language?: string): string[] => {
  const baseTitle = movieTitle.trim();
  const queries = [];
  
  // Get language-specific keywords, fallback to English
  const langKeywords = TRAILER_KEYWORDS[language || 'en'] || TRAILER_KEYWORDS.en;
  const englishKeywords = TRAILER_KEYWORDS.en;
  
  // First, try language-specific searches if not English
  if (language && language !== 'en') {
    if (movieYear) {
      langKeywords.forEach(keyword => {
        queries.push(`${baseTitle} ${movieYear} ${keyword}`);
      });
    }
    langKeywords.forEach(keyword => {
      queries.push(`${baseTitle} ${keyword}`);
    });
  }
  
  // Then fall back to English searches
  if (movieYear) {
    englishKeywords.forEach(keyword => {
      queries.push(`${baseTitle} ${movieYear} ${keyword}`);
    });
  }
  
  englishKeywords.forEach(keyword => {
    queries.push(`${baseTitle} ${keyword}`);
  });
  
  // Remove duplicates while preserving order
  return [...new Set(queries)];
};

// Industry-standard: Official channel prioritization
const OFFICIAL_CHANNELS = [
  'sony pictures entertainment',
  'warner bros pictures',
  'disney movie trailers',
  'universal pictures',
  'marvel entertainment',
  'dc',
  'paramount pictures',
  'fox movies',
  '20th century studios',
  'lionsgate movies',
  'mgm',
  'a24',
  'neon',
  'focus features',
  'searchlight pictures',
  'columbia pictures',
  'tristar pictures'
];

const isOfficialChannel = (channelTitle: string): boolean => {
  const normalizedChannel = channelTitle.toLowerCase();
  return OFFICIAL_CHANNELS.some(official => 
    normalizedChannel.includes(official) || official.includes(normalizedChannel)
  );
};

// Industry-standard: Content quality scoring
const scoreTrailer = (item: any, movieTitle: string, movieYear?: string): number => {
  let score = 0;
  const title = item.snippet.title.toLowerCase();
  const channelTitle = item.snippet.channelTitle.toLowerCase();
  const description = item.snippet.description?.toLowerCase() || '';
  
  // Title matching
  if (title.includes(movieTitle.toLowerCase())) score += 40;
  if (movieYear && title.includes(movieYear)) score += 20;
  
  // Trailer keywords
  if (title.includes('official trailer')) score += 30;
  else if (title.includes('official')) score += 20;
  else if (title.includes('trailer')) score += 15;
  
  // Channel authority
  if (isOfficialChannel(channelTitle)) score += 25;
  
  // Quality indicators
  if (title.includes('hd') || title.includes('4k')) score += 5;
  if (description.includes('in theaters') || description.includes('coming soon')) score += 10;
  
  // Negative indicators
  if (title.includes('reaction') || title.includes('review') || title.includes('breakdown')) score -= 20;
  if (title.includes('fan made') || title.includes('fanmade')) score -= 30;
  if (title.includes('unofficial')) score -= 25;
  
  return score;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { movieTitle, movieYear, language } = await req.json();
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');

    if (!movieTitle || !youtubeApiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing movie title or API key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🎬 Searching for trailer: ${movieTitle} (${movieYear || 'any year'}) [Language: ${language || 'en'}]`);

    // Generate multiple search strategies with language support
    const searchQueries = generateSearchQueries(movieTitle, movieYear, language);
    console.log(`📝 Generated ${searchQueries.length} search queries`);

    let allTrailers: any[] = [];
    
    // Try each search query until we get good results
    for (let i = 0; i < searchQueries.length && allTrailers.length < 15; i++) {
      const query = searchQueries[i];
      console.log(`🔍 Trying query ${i + 1}: "${query}"`);
      
      try {
        const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&videoDuration=short&videoDefinition=high&order=relevance&key=${youtubeApiKey}`;
        
        const youtubeResponse = await fetchWithRetry(youtubeUrl);
        const youtubeData = await youtubeResponse.json();

        if (youtubeData.error) {
          console.error('YouTube API Error:', youtubeData.error);
          continue;
        }

        if (youtubeData.items?.length > 0) {
          allTrailers.push(...youtubeData.items);
          console.log(`✓ Found ${youtubeData.items.length} videos`);
        }
        
        // If we found official trailers in first few searches, we can be more selective
        if (i < 2 && youtubeData.items?.some((item: any) => 
          item.snippet.title.toLowerCase().includes('official trailer'))) {
          break;
        }
        
      } catch (error) {
        console.error(`❌ Query ${i + 1} failed:`, (error as Error).message);
        continue;
      }
    }

    if (allTrailers.length === 0) {
      console.log('❌ No trailers found after all search attempts');
      return new Response(
        JSON.stringify({ trailer: null, message: 'No trailer found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Score and rank all trailers
    const scoredTrailers = allTrailers
      .map(item => ({
        ...item,
        score: scoreTrailer(item, movieTitle, movieYear)
      }))
      .sort((a, b) => b.score - a.score);

    console.log(`🏆 Top 3 trailer candidates:`);
    scoredTrailers.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. "${item.snippet.title}" (Score: ${item.score}) - ${item.snippet.channelTitle}`);
    });

    const bestTrailer = scoredTrailers[0];

    const trailer = {
      videoId: bestTrailer.id.videoId,
      title: bestTrailer.snippet.title,
      description: bestTrailer.snippet.description,
      thumbnail: bestTrailer.snippet.thumbnails.high?.url || bestTrailer.snippet.thumbnails.default?.url,
      channelTitle: bestTrailer.snippet.channelTitle,
      publishedAt: bestTrailer.snippet.publishedAt,
      embedUrl: `https://www.youtube.com/embed/${bestTrailer.id.videoId}`,
      watchUrl: `https://www.youtube.com/watch?v=${bestTrailer.id.videoId}`,
      score: bestTrailer.score
    };

    console.log(`🎯 Selected trailer: "${trailer.title}" (Score: ${trailer.score})`);

    return new Response(
      JSON.stringify({ trailer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Critical error in movie-trailer function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch trailer', details: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});