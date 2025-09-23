import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Shield, Bell, Trash2, Download, Settings as SettingsIcon, Accessibility } from "lucide-react";
import { PrivacyPolicy } from "@/components/PrivacyPolicy";
import { AccessibilitySettings } from "@/components/AccessibilitySettings";

export const Settings = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [dataCollection, setDataCollection] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data including your CineDNA profile, search history, and favorites."
    );
    
    if (!confirmed) return;
    
    try {
      // Delete user data from all tables
      await supabase.from('movie_searches').delete().eq('user_id', user.id);
      await supabase.from('user_preferences').delete().eq('user_id', user.id);
      await supabase.from('favorites').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('user_id', user.id);
      
      // Delete the user account
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently deleted.",
      });
      
      navigate("/auth");
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    
    try {
      // Fetch all user data
      const [searches, preferences, favorites, profile] = await Promise.all([
        supabase.from('movie_searches').select('*').eq('user_id', user.id),
        supabase.from('user_preferences').select('*').eq('user_id', user.id),
        supabase.from('favorites').select('*').eq('user_id', user.id),
        supabase.from('profiles').select('*').eq('user_id', user.id)
      ]);
      
      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        profile: profile.data?.[0] || null,
        preferences: preferences.data?.[0] || null,
        searches: searches.data || [],
        favorites: favorites.data || [],
        exported_at: new Date().toISOString()
      };
      
      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cinemind-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data Exported",
        description: "Your data has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 relative">
      {/* Background Neural Network Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/3 right-1/3 w-32 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-2">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm sm:text-base">Back to CineMind</span>
          </Button>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Account Settings */}
          <Card className="neural-card p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Account Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Member Since</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card className="neural-card p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Privacy & Data</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Data Collection</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow CineMind to collect usage data to improve the app
                  </p>
                </div>
                <Switch
                  checked={dataCollection}
                  onCheckedChange={setDataCollection}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Privacy Policy</Label>
                  <p className="text-xs text-muted-foreground">
                    Read our privacy policy and data handling practices
                  </p>
                </div>
                <PrivacyPolicy />
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="neural-card p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications about new features and recommendations
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </div>
          </Card>

          {/* Accessibility Settings */}
          <Card className="neural-card p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <Accessibility className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Accessibility</h2>
            </div>
            <AccessibilitySettings />
          </Card>

          {/* Data Management */}
          <Card className="neural-card p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Data Management</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Export Data</Label>
                  <p className="text-xs text-muted-foreground">
                    Download all your data including search history and preferences
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="neural-card p-4 sm:p-6 border-destructive/20">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-5 h-5 text-destructive" />
              <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium text-destructive">Delete Account</Label>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAccount}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
