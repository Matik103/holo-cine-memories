import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const omdbApiKey = Deno.env.get("SC_OMDB_API_KEY")
    const openaiApiKey = Deno.env.get("SC_OPENAI_API_KEY")
    
    return new Response(
      JSON.stringify({ 
        secrets: {
          OMDB_API_KEY: omdbApiKey,
          OPENAI_API_KEY: openaiApiKey
        }
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch secrets" }),
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
