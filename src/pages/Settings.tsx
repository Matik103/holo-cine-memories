import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield, FileText, Scale, Cookie, Database, HelpCircle, Info, Trash2, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DeleteAccountModal } from "@/components/DeleteAccountModal";

export const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    navigate("/");
  };

  const legalItems = [
    { icon: Shield, label: "Privacy Policy", path: "/privacy" },
    { icon: FileText, label: "Terms of Service", path: "/terms" },
    { icon: Scale, label: "Legal", path: "/legal" },
  ];

  const supportItems = [
    { icon: HelpCircle, label: "Help Center", path: "/help" },
    { icon: Info, label: "About", path: "/about" },
  ];

  return (
    <div className="min-h-screen bg-background p-4 pt-safe-top">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-6 sm:pt-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Settings
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Account Section */}
        <Card className="neural-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Account</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{user?.email || "Loading..."}</p>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data.
              </p>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteModal(true)}
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Legal Section */}
        <Card className="neural-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Scale className="w-5 h-5" />
              <span>Legal</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {legalItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="neural-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5" />
              <span>Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {supportItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy Section */}
        <Card className="neural-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Data & Privacy</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Data Collection</p>
                  <p className="text-xs text-muted-foreground">
                    We collect minimal data to provide personalized recommendations
                  </p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Data Storage</p>
                  <p className="text-xs text-muted-foreground">
                    Your data is stored securely and encrypted
                  </p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Third-Party Sharing</p>
                  <p className="text-xs text-muted-foreground">
                    We don't sell or share your personal data
                  </p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Version */}
        <div className="text-center text-xs text-muted-foreground">
          <p>CineMind v1.0.2</p>
          <p className="mt-1">Your Personal AI Movie Memory Companion</p>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={handleDeleteSuccess}
        user={user}
      />
    </div>
  );
};