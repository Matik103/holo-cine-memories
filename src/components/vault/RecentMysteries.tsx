import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { HelpCircle, Eye, MessageSquare, Trophy, ArrowRight, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { translationService } from '@/services/translationService';

interface SimpleMystery {
  id: string;
  description: string;
  view_count: number;
  attempt_count: number;
  points_reward: number;
}

export function RecentMysteries() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [mysteries, setMysteries] = useState<SimpleMystery[]>([]);
  const [translatedDescriptions, setTranslatedDescriptions] = useState<Record<string, string>>({});
  const [unsolvedCount, setUnsolvedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    
    const fetchMysteries = async () => {
      try {
        const [{ data, error }, { count }] = await Promise.all([
          supabase
            .from('memory_mysteries')
            .select('id, description, view_count, attempt_count, points_reward')
            .eq('status', 'unsolved')
            .order('created_at', { ascending: false })
            .limit(3),
          supabase
            .from('memory_mysteries')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'unsolved')
        ]);

        if (mounted.current) {
          if (!error && data) {
            setMysteries(data);
          }
          setUnsolvedCount(count || 0);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching mysteries:', err);
        if (mounted.current) setIsLoading(false);
      }
    };

    fetchMysteries();
    
    return () => { mounted.current = false; };
  }, []);

  // Translate mystery descriptions when mysteries or language changes
  useEffect(() => {
    const translateDescriptions = async () => {
      if (mysteries.length === 0) return;
      
      if (currentLanguage === 'en') {
        const translations: Record<string, string> = {};
        mysteries.forEach(m => { translations[m.id] = m.description; });
        setTranslatedDescriptions(translations);
        return;
      }
      
      const translations: Record<string, string> = {};
      await Promise.all(
        mysteries.map(async (mystery) => {
          try {
            const translated = await translationService.translate(mystery.description, currentLanguage);
            translations[mystery.id] = translated;
          } catch {
            translations[mystery.id] = mystery.description;
          }
        })
      );
      
      if (mounted.current) {
        setTranslatedDescriptions(translations);
      }
    };
    
    translateDescriptions();
  }, [mysteries, currentLanguage]);

  const recentMysteries = mysteries;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (recentMysteries.length === 0) {
    return (
      <div className="text-center py-6">
        <HelpCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">{t('vault.mysteries.noMysteries')}</p>
        <Button 
          variant="link" 
          size="sm" 
          onClick={() => navigate('/mysteries')}
          className="mt-2"
        >
          {t('vault.mysteries.beFirst')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Stats bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {t('vault.mysteries.unsolvedCount', { count: unsolvedCount })}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/mysteries')}
          className="h-6 text-xs gap-1 px-2"
        >
          {t('vault.mysteries.viewAll')}
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>

      {/* Mystery list */}
      {recentMysteries.map((mystery) => (
        <div
          key={mystery.id}
          onClick={() => navigate(`/mysteries/${mystery.id}`)}
          className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 cursor-pointer transition-all group"
        >
          <p className="text-sm line-clamp-2 group-hover:text-purple-300 transition-colors">
            {translatedDescriptions[mystery.id] || mystery.description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {mystery.view_count}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {mystery.attempt_count}
              </span>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-primary">
              <Trophy className="h-3 w-3" />
              +{mystery.points_reward}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
