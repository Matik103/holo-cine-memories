import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY")
    
    if (!TMDB_API_KEY) {
      throw new Error('TMDB_API_KEY not configured')
    }
    
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: 'en-US',
      sort_by: 'vote_average.desc',
      'vote_average.gte': '7.5',
      'vote_count.gte': '100',
      'vote_count.lte': '2000',
      'with_original_language': 'en',
      include_adult: 'false',
      page: '1'
    })
    
    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?${params.toString()}`
    )
    
    if (!response.ok) {
      throw new Error('TMDB API request failed')
    }
    
    const data = await response.json()
    
    const results = data.results || []
    const shuffled = results
      .sort(() => Math.random() - 0.5)
      .slice(0, 15)
    
    return new Response(
      JSON.stringify({ ...data, results: shuffled }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 500
      }
    )
  }
})
