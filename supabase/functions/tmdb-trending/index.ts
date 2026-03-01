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
    
    const response = await fetch(
      `https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API_KEY}`
    )
    
    if (!response.ok) {
      throw new Error('TMDB API request failed')
    }
    
    const data = await response.json()
    
    return new Response(
      JSON.stringify(data),
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
