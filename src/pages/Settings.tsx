import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield, FileText, Scale, Cookie, Database, HelpCircle, Info, Trash2, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      // Delete user data from all tables
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);
      
      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', user.id);
      
      const { error: searchesError } = await supabase
        .from('movie_searches')
        .delete()
        .eq('user_id', user.id);
      
      const { error: favoritesError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id);
      
      const { error: analyticsError } = await supabase
        .from('user_query_analytics')
        .delete()
        .eq('user_id', user.id);

      if (profileError || preferencesError || searchesError || favoritesError || analyticsError) {
        console.error('Error deleting user data:', { profileError, preferencesError, searchesError, favoritesError, analyticsError });
        toast({
          title: "Error",
          description: "Failed to delete some account data. Please contact support.",
          variant: "destructive"
        });
        return;
      }

      // Sign out first
      await supabase.auth.signOut();
      
      // Note: User account deletion requires admin privileges
      // For now, we'll delete all user data and sign them out
      // The account will be effectively disabled
      toast({
        title: "Account Data Deleted",
        description: "All your data has been permanently deleted. Please contact support to complete account deletion.",
      });
      
      navigate("/");
      
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const legalItems = [
    { icon: Shield, label: "Privacy Policy", path: "/privacy" },
    { icon: FileText, label: "Terms of Service", path: "/terms" },
    { icon: Scale, label: "License Agreement", path: "/license" },
    { icon: Cookie, label: "Cookie Policy", path: "/cookies" },
    { icon: Database, label: "Data Usage", path: "/data-usage" },
  ];

  const supportItems = [
    { icon: HelpCircle, label: "Help Center", path: "/help" },
    { icon: Info, label: "About CineMind", path: "/about" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Account Section */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-muted-foreground">Account created</p>
                  </div>
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        className="w-full justify-start"
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {isDeleting ? "Deleting Account..." : "Delete Account"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account 
                          and remove all your data from our servers, including:
                          <br />
                          <br />
                          • Your profile and preferences
                          <br />
                          • Movie search history
                          <br />
                          • Favorite movies
                          <br />
                          • CineDNA data
                          <br />
                          • All analytics data
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Legal Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legal & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {legalItems.map((item, index) => (
                <div key={item.path}>
                  <Link to={item.path}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 px-3"
                    >
                      <item.icon className="h-5 w-5 mr-3 text-muted-foreground" />
                      <span className="text-left">{item.label}</span>
                    </Button>
                  </Link>
                  {index < legalItems.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Support Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Support & Help</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {supportItems.map((item, index) => (
                <div key={item.path}>
                  <Link to={item.path}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 px-3"
                    >
                      <item.icon className="h-5 w-5 mr-3 text-muted-foreground" />
                      <span className="text-left">{item.label}</span>
                    </Button>
                  </Link>
                  {index < supportItems.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                For support and inquiries, reach us at:
              </p>
              <p className="text-sm font-medium mt-2">ernst@cinemind.tech</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};