import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  Users, 
  Mic, 
  Type, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowLeft 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AnalyticsData {
  date: string;
  query_type: 'text' | 'voice';
  success: boolean;
  query_count: number;
  avg_confidence: number;
  avg_duration_ms: number;
  unique_users: number;
  movies_found: string[];
}

interface QueryData {
  id: string;
  query_text: string;
  query_type: 'text' | 'voice';
  success: boolean;
  movie_identified: string;
  confidence_score: number;
  created_at: string;
}

export const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [recentQueries, setRecentQueries] = useState<QueryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(7); // Default 7 days
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);
      const endDate = new Date();

      // Load aggregated analytics
      const { data: analytics, error: analyticsError } = await supabase
        .rpc('get_admin_query_insights', {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        });

      if (analyticsError) {
        throw analyticsError;
      }

      // Load recent individual queries
      const { data: queries, error: queriesError } = await supabase
        .from('user_query_analytics')
        .select('id, query_text, query_type, success, movie_identified, confidence_score, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (queriesError) {
        throw queriesError;
      }

      setAnalyticsData(analytics as AnalyticsData[] || []);
      setRecentQueries(queries as QueryData[] || []);

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error Loading Analytics",
        description: "Failed to load analytics data. Make sure you have admin access.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    return analyticsData.reduce((acc, item) => ({
      totalQueries: acc.totalQueries + item.query_count,
      totalUsers: acc.totalUsers + item.unique_users,
      successfulQueries: acc.successfulQueries + (item.success ? item.query_count : 0),
      voiceQueries: acc.voiceQueries + (item.query_type === 'voice' ? item.query_count : 0),
      textQueries: acc.textQueries + (item.query_type === 'text' ? item.query_count : 0),
    }), {
      totalQueries: 0,
      totalUsers: 0,
      successfulQueries: 0,
      voiceQueries: 0,
      textQueries: 0,
    });
  };

  const totals = calculateTotals();
  const successRate = totals.totalQueries > 0 ? (totals.successfulQueries / totals.totalQueries * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 relative">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Admin Analytics
              </h1>
              <p className="text-muted-foreground">User query insights and app performance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={dateRange === 7 ? "default" : "outline"}
              onClick={() => setDateRange(7)}
              size="sm"
            >
              7 Days
            </Button>
            <Button
              variant={dateRange === 30 ? "default" : "outline"}
              onClick={() => setDateRange(30)}
              size="sm"
            >
              30 Days
            </Button>
            <Button
              variant={dateRange === 90 ? "default" : "outline"}
              onClick={() => setDateRange(90)}
              size="sm"
            >
              90 Days
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="neural-card p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totals.totalQueries}</p>
                <p className="text-sm text-muted-foreground">Total Queries</p>
              </div>
            </div>
          </Card>

          <Card className="neural-card p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{totals.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </Card>

          <Card className="neural-card p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{successRate}%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </Card>

          <Card className="neural-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <Mic className="w-4 h-4 text-primary" />
                <Type className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totals.voiceQueries + totals.textQueries}</p>
                <p className="text-sm text-muted-foreground">
                  {totals.voiceQueries} voice, {totals.textQueries} text
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Queries */}
        <Card className="neural-card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Queries ({recentQueries.length})
          </h2>
          
          <div className="space-y-3">
            {recentQueries.slice(0, 20).map((query) => (
              <div 
                key={query.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {query.query_type === 'voice' ? 
                      <Mic className="w-4 h-4 text-primary" /> : 
                      <Type className="w-4 h-4 text-accent" />
                    }
                    {query.success ? 
                      <CheckCircle className="w-4 h-4 text-green-500" /> :
                      <XCircle className="w-4 h-4 text-red-500" />
                    }
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{query.query_text}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(query.created_at).toLocaleDateString()}</span>
                      {query.movie_identified && (
                        <>
                          <span>•</span>
                          <span>Found: {query.movie_identified}</span>
                        </>
                      )}
                      {query.confidence_score && (
                        <>
                          <span>•</span>
                          <span>Confidence: {Math.round(query.confidence_score * 100)}%</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <Badge 
                  variant={query.success ? "secondary" : "destructive"}
                  className="ml-2 flex-shrink-0"
                >
                  {query.success ? 'Success' : 'Failed'}
                </Badge>
              </div>
            ))}
          </div>
          
          {recentQueries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No queries found in the selected time range.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};