import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { emailService } from "@/lib/emailService";
import { Brain, Mail, Lock, User } from "lucide-react";

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle forgot password - Use Supabase's built-in flow
  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Use Supabase's built-in password reset which will trigger our webhook
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: "Password Reset Sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to send reset email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate passwords
    if (newPassword.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Check for custom reset token in URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const email = urlParams.get('email');
      
      console.log('URL params:', { token: token ? 'present' : 'missing', email });
      
      if (token && email) {
        // Verify the custom reset token
        const { data: tokenData, error: tokenError } = await supabase
          .from('password_reset_tokens')
          .select('*')
          .eq('token', token)
          .eq('email', email)
          .gt('expires_at', new Date().toISOString())
          .is('used_at', null)
          .single();

        if (tokenError || !tokenData) {
          throw new Error("Invalid or expired reset link. Please request a new password reset.");
        }

        // Mark token as used
        await supabase
          .from('password_reset_tokens')
          .update({ used_at: new Date().toISOString() })
          .eq('id', tokenData.id);

        // Call our custom reset password function
        const { data: resetData, error: resetError } = await supabase.functions.invoke('reset-password', {
          body: {
            email: email,
            token: token,
            newPassword: newPassword
          }
        });

        if (resetError) {
          throw new Error(resetError.message || "Failed to reset password");
        }

        if (!resetData.success) {
          throw new Error(resetData.error || "Failed to reset password");
        }
      } else {
        // Fallback: try to get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          throw new Error("No valid session found. Please request a new password reset.");
        }

        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) {
          throw error;
        }
      }

      toast({
        title: "Password Updated!",
        description: "Your password has been successfully updated.",
      });

      // Clear form and go back to sign in
      setNewPassword("");
      setConfirmPassword("");  
      setShowPasswordReset(false);
      
      // Clear the URL hash to remove the tokens
      window.location.hash = '';
      
    } catch (error: any) {
      console.error("Password update error:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    // Check URL parameters for password reset on initial load
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    console.log('URL params:', Object.fromEntries(urlParams.entries()));
    console.log('Hash params:', Object.fromEntries(hashParams.entries()));
    
    // Check for password reset indicators - look for access_token and type=recovery from Supabase verification
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const type = hashParams.get('type');
    
    if (accessToken && refreshToken && type === 'recovery') {
      console.log('Password reset detected from Supabase verification');
      setShowPasswordReset(true);
      return;
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      // Handle password recovery event specifically
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery event detected');
        setShowPasswordReset(true);
        return;
      }
      
      // For regular sign-in, check if we're not in password reset mode
      if (session && !showPasswordReset) {
        const currentHashParams = new URLSearchParams(window.location.hash.substring(1));
        const currentUrlParams = new URLSearchParams(window.location.search);
        
        // Double-check we're not in password reset mode
        const stillInPasswordReset = currentHashParams.get('type') === 'recovery' &&
                                   currentHashParams.has('access_token');
        
        if (!stillInPasswordReset) {
          console.log('Normal sign in, redirecting to app');
          navigate("/");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Attempting to sign in user:", { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Sign in response:", { data, error });

      if (error) {
        console.error("Sign in error details:", error);
        throw error;
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to CineMind.",
        });
        
        // Clear form
        setEmail("");
        setPassword("");
        setFullName("");
        
        navigate("/");
      } else {
        toast({
          title: "Sign In Failed",
          description: "Unable to sign in. Please check your credentials.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      
      // Handle specific error cases
      if (error.message.includes("Invalid login credentials")) {
        toast({
          title: "Invalid Credentials",
          description: "The email or password you entered is incorrect. Please try again.",
          variant: "destructive",
        });
      } else if (error.message.includes("Email not confirmed")) {
        toast({
          title: "Email Not Confirmed",
          description: "Please check your email and click the confirmation link.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign In Failed",
          description: error.message || "Invalid email or password.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate password length
    if (password.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting to sign up user:", { email, fullName });
      
      // Create the user account first (users are now auto-confirmed)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      console.log("Sign up response:", { data, error });

      if (error) {
        console.error("Sign up error details:", error);
        
        // Handle specific error cases
        if (error.message.includes("already registered") || 
            error.message.includes("User already registered") ||
            error.message.includes("already been registered") ||
            error.status === 422) {
          toast({
            title: "Account Already Exists",
            description: "An account with this email already exists. Please try signing in instead.",
            variant: "destructive",
          });
          // Switch to sign in tab
          const signInTab = document.querySelector('[value="signin"]') as HTMLElement;
          if (signInTab) {
            signInTab.click();
          }
          return;
        } else {
          throw error;
        }
      }

      if (data.user) {
        // Send welcome email after successful account creation
        try {
          await emailService.sendSignupConfirmation(email, { full_name: fullName });
          console.log("Welcome email sent successfully");
        } catch (emailError) {
          console.error("Welcome email failed:", emailError);
          // Don't fail the signup if email fails
        }

        toast({
          title: "Welcome to CineMind!",
          description: "Your account has been created successfully.",
        });
        
        // Clear form
        setEmail("");
        setPassword("");
        setFullName("");
        
        // Since confirmations are disabled, users can access the app immediately
        navigate("/");
      } else {
        toast({
          title: "Sign Up Failed",
          description: "Unable to create account. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({
        title: "Sign Up Failed",
        description: error.message || "Failed to create account. Please check your email and password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show password reset screen
  if (showPasswordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        {/* Background Neural Network Effect */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
          <div className="absolute top-1/3 right-1/3 w-32 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
          <div className="floating-particle absolute top-20 right-20 w-2 h-2 bg-primary rounded-full opacity-30"></div>
          <div className="floating-particle absolute bottom-32 left-32 w-1 h-1 bg-accent rounded-full opacity-50 animation-delay-3s"></div>
        </div>

        <Card className="w-full max-w-md neural-card">
          <div className="p-8">
            {/* Header */}
            <div className="flex flex-col items-center space-y-4 mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent neural-glow">
                <Lock className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Reset Your Password
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter your new password below
                </p>
              </div>
            </div>

            {/* Password Reset Form */}
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your new password"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Confirm your new password"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full neural-button"
                disabled={loading}
              >
                {loading ? "Updating Password..." : "Update Password"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(false)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background Neural Network Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/3 right-1/3 w-32 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <div className="floating-particle absolute top-20 right-20 w-2 h-2 bg-primary rounded-full opacity-30"></div>
        <div className="floating-particle absolute bottom-32 left-32 w-1 h-1 bg-accent rounded-full opacity-50 animation-delay-3s"></div>
      </div>

      <Card className="w-full max-w-md neural-card">
        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col items-center space-y-4 mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent neural-glow">
              <Brain className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Welcome to CineMind
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Your Personal AI Movie Memory Companion
              </p>
            </div>
          </div>

          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full neural-button"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      placeholder="Create a password (6+ characters)"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full neural-button"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};