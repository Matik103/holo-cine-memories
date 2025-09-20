import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
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
        headers: { "Content-Type": "application/json" },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch secrets" }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 500
      }
    )
  }
})
