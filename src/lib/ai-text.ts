import { supabase } from '@/integrations/supabase/client';

export const generateAIText = async (prompt: string, systemPrompt?: string) => {
  const { data, error } = await supabase.functions.invoke('ai-text-generate', {
    body: {
      messages: [{ role: 'user', content: prompt }],
      systemPrompt,
    },
  });

  if (error) throw error;
  return data.content;
};
