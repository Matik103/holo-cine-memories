import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, systemPrompt } = await req.json();
    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');

    const formattedMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    const response = await fetch('https://open-ai21.p.rapidapi.com/conversationllama', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'open-ai21.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY!,
      },
      body: JSON.stringify({
        messages: formattedMessages,
        web_access: false,
      }),
    });

    const data = await response.json();

    return new Response(
      JSON.stringify({ content: data.result || data.message || data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
