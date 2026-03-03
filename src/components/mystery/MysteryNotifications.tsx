import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { HelpCircle, CheckCircle, MessageSquare, Trophy } from 'lucide-react';

// Cast for tables not in generated types
const db = supabase as any;

const MYSTERY_CHECK_KEY = 'cinemind_mystery_check';
const CHECK_INTERVAL = 60000;

export function MysteryNotifications() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const lastCheckRef = useRef<number>(0);
  const userIdRef = useRef<string | null>(null);

  const checkMysteryUpdates = useCallback(async () => {
    if (!userIdRef.current) return;

    const now = Date.now();
    const lastCheck = parseInt(localStorage.getItem(MYSTERY_CHECK_KEY) || '0');
    
    if (now - lastCheck < CHECK_INTERVAL) return;
    
    try {
      const { data: newAttempts } = await db
        .from('mystery_attempts')
        .select(`
          id,
          movie_title,
          mystery_id,
          memory_mysteries!inner(user_id, description)
        `)
        .eq('memory_mysteries.user_id', userIdRef.current)
        .gt('created_at', new Date(lastCheck).toISOString())
        .limit(5);

      if (newAttempts && newAttempts.length > 0) {
        const count = newAttempts.length;
        toast({
          title: `🔔 ${count} new solution${count > 1 ? 's' : ''} submitted!`,
          description: `Someone tried to solve your mystery${count > 1 ? 'ies' : ''}`,
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/mysteries/${newAttempts[0].mystery_id}`)}
              className="gap-1"
            >
              <MessageSquare className="h-3 w-3" />
              View
            </Button>
          ),
          duration: 8000,
        });
      }

      const { data: solvedMysteries } = await db
        .from('memory_mysteries')
        .select('id, solution_movie_title')
        .eq('user_id', userIdRef.current)
        .eq('status', 'solved')
        .gt('solved_at', new Date(lastCheck).toISOString())
        .limit(3);

      if (solvedMysteries && solvedMysteries.length > 0) {
        solvedMysteries.forEach((mystery: any) => {
          toast({
            title: '🎉 Mystery Solved!',
            description: `Your mystery was identified as "${mystery.solution_movie_title}"`,
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/mysteries/${mystery.id}`)}
                className="gap-1"
              >
                <CheckCircle className="h-3 w-3 text-green-400" />
                View
              </Button>
            ),
            duration: 10000,
          });
        });
      }

      const { data: acceptedSolutions } = await db
        .from('mystery_attempts')
        .select(`
          id,
          movie_title,
          mystery_id
        `)
        .eq('user_id', userIdRef.current)
        .eq('is_accepted', true)
        .gt('accepted_at', new Date(lastCheck).toISOString())
        .limit(3);

      if (acceptedSolutions && acceptedSolutions.length > 0) {
        acceptedSolutions.forEach((solution: any) => {
          toast({
            title: '🏆 Your solution was accepted!',
            description: `"${solution.movie_title}" was the correct answer!`,
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/mysteries/${solution.mystery_id}`)}
                className="gap-1"
              >
                <Trophy className="h-3 w-3 text-yellow-400" />
                View
              </Button>
            ),
            duration: 10000,
          });
        });
      }

      localStorage.setItem(MYSTERY_CHECK_KEY, now.toString());
    } catch (error) {
    }
  }, [toast, navigate]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      userIdRef.current = session?.user?.id || null;
      if (session?.user) {
        setTimeout(checkMysteryUpdates, 5000);
      }
    });

    const interval = setInterval(checkMysteryUpdates, CHECK_INTERVAL);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [checkMysteryUpdates]);

  return null;
}

export function useMysteryNotifications() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const notifyMysteryPosted = () => {
    toast({
      title: '🎬 Mystery Posted!',
      description: 'Your mystery is now live. The community will help find the answer!',
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/mysteries')}
          className="gap-1"
        >
          <HelpCircle className="h-3 w-3" />
          View
        </Button>
      ),
      duration: 6000,
    });
  };

  const notifySolutionSubmitted = () => {
    toast({
      title: '✅ Solution Submitted!',
      description: 'The mystery poster will review your answer.',
      duration: 5000,
    });
  };

  const notifyRankUp = (newRank: string) => {
    toast({
      title: '🎖️ Rank Up!',
      description: `You've been promoted to ${newRank}!`,
      duration: 8000,
    });
  };

  const notifySolveStreak = (streak: number) => {
    if (streak >= 3 && streak % 3 === 0) {
      toast({
        title: `🔥 ${streak} Solve Streak!`,
        description: 'You\'re on fire! Keep solving mysteries!',
        duration: 6000,
      });
    }
  };

  return {
    notifyMysteryPosted,
    notifySolutionSubmitted,
    notifyRankUp,
    notifySolveStreak,
  };
}
