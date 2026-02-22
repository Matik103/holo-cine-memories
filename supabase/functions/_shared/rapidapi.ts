export async function callRapidAPI(messages: Array<{role: string, content: string}>) {
  const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
  
  const response = await fetch('https://open-ai21.p.rapidapi.com/conversationllama', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': 'open-ai21.p.rapidapi.com',
      'x-rapidapi-key': RAPIDAPI_KEY!,
    },
    body: JSON.stringify({ messages, web_access: false }),
  });

  const data = await response.json();
  return data.result || data.message || data;
}
