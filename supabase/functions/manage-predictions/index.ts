import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PREDICTION_TEMPLATES = [
  {
    type: 'movie_specific',
    title: 'Which classic will be searched most?',
    description: 'Predict which iconic movie gets the most searches this week',
    options: [
      { id: 'godfather', label: 'The Godfather', icon: '🎩' },
      { id: 'pulp', label: 'Pulp Fiction', icon: '💼' },
      { id: 'matrix', label: 'The Matrix', icon: '💊' },
      { id: 'inception', label: 'Inception', icon: '🌀' }
    ],
    points: 100
  },
  {
    type: 'genre_battle',
    title: 'Genre Battle: Which wins?',
    description: 'Action vs Horror - which genre dominates searches?',
    options: [
      { id: 'action', label: 'Action 💥', icon: '💥' },
      { id: 'horror', label: 'Horror 👻', icon: '👻' },
      { id: 'tie', label: 'Tie', icon: '🤝' }
    ],
    points: 75
  },
  {
    type: 'community_milestone',
    title: 'Will we hit 500 searches?',
    description: 'Can the community reach 500 total searches this week?',
    options: [
      { id: 'yes', label: 'Yes! 🚀', icon: '🚀' },
      { id: 'no', label: 'Not yet', icon: '🎯' },
      { id: 'exceed', label: 'Exceed 1000!', icon: '🔥' }
    ],
    points: 50
  }
];

Deno.serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: expired } = await supabaseClient
      .from('vault_predictions')
      .select('id')
      .eq('is_active', true)
      .lt('ends_at', new Date().toISOString());

    if (expired && expired.length > 0) {
      await supabaseClient
        .from('vault_predictions')
        .update({ is_active: false })
        .in('id', expired.map(p => p.id));
    }

    const { data: active } = await supabaseClient
      .from('vault_predictions')
      .select('id')
      .eq('is_active', true)
      .gte('ends_at', new Date().toISOString());

    if (!active || active.length < 3) {
      const now = new Date();
      const endsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      for (const template of PREDICTION_TEMPLATES) {
        await supabaseClient
          .from('vault_predictions')
          .insert({
            prediction_type: template.type,
            title: template.title,
            description: template.description,
            options: template.options,
            points_reward: template.points,
            starts_at: now.toISOString(),
            ends_at: endsAt.toISOString(),
            is_active: true,
            is_resolved: false
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        expired: expired?.length || 0,
        active: active?.length || 0
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
