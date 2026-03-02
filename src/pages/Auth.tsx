import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { scrollInputIntoView } from "@/lib/utils";
import { sanitizeEmail, sanitizeInput, validatePassword, checkRateLimit } from "@/lib/sanitize";

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // Refs for mobile keyboard handling
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  // Handle forgot password - Use Supabase's built-in recovery
  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: t('auth.emailRequired'),
        description: t('auth.emailRequiredDesc'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: t('auth.passwordResetSent'),
        description: t('auth.passwordResetSentDesc'),
      });
    } catch (error: any) {
      toast({
        title: t('auth.resetFailed'),
        description: error.message || t('auth.resetFailedDesc'),
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
        title: t('auth.invalidPassword'),
        description: t('auth.invalidPasswordDesc'),
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t('auth.passwordsDontMatch'),
        description: t('auth.passwordsDontMatchDesc'),
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Use Supabase's session-based password update
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      toast({
        title: t('auth.passwordUpdated'),
        description: t('auth.passwordUpdatedDesc'),
      });

      // Clear form and redirect to app
      setNewPassword("");
      setConfirmPassword("");  
      setShowPasswordReset(false);
      
      // Clear the URL hash and navigate to home
      window.history.replaceState(null, '', window.location.pathname);
      navigate("/");
      
    } catch (error: any) {
      toast({
        title: t('auth.updateFailed'),
        description: error.message || t('auth.updateFailedDesc'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    // Check URL parameters first to detect password recovery
    const checkPasswordRecovery = () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      
      if (type === 'recovery') {
        setShowPasswordReset(true);
        return true;
      }
      return false;
    };

    // Check for password recovery immediately
    const isPasswordRecovery = checkPasswordRecovery();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      
      if (event === 'PASSWORD_RECOVERY') {
        setShowPasswordReset(true);
        return;
      }
      
      // Handle successful sign-in - only redirect if NOT in password recovery mode
      if (event === 'SIGNED_IN' && session) {
        // Double-check we're not in password recovery mode
        const currentHashParams = new URLSearchParams(window.location.hash.substring(1));
        const isRecovery = currentHashParams.get('type') === 'recovery' || showPasswordReset;
        
        if (!isRecovery) {
          navigate("/");
        }
      }
      
      if (event === 'SIGNED_OUT') {
        setShowPasswordReset(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, showPasswordReset]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting
    if (!checkRateLimit('signin', 5, 60000)) {
      toast({
        title: t('auth.tooManyAttempts'),
        description: t('auth.tooManyAttemptsDesc'),
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast({
          title: t('auth.welcomeBack'),
          description: t('auth.welcomeBackDesc'),
        });
        
        // Clear form
        setEmail("");
        setPassword("");
        setFullName("");
        
        navigate("/");
      } else {
        toast({
          title: t('auth.signInFailed'),
          description: t('auth.signInFailedDesc'),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      if (error.message.includes("Invalid login credentials")) {
        toast({
          title: t('auth.invalidCredentials'),
          description: t('auth.invalidCredentialsDesc'),
          variant: "destructive",
        });
      } else if (error.message.includes("Email not confirmed")) {
        toast({
          title: t('auth.emailNotConfirmed'),
          description: t('auth.emailNotConfirmedDesc'),
          variant: "destructive",
        });
      } else {
        toast({
          title: t('auth.signInFailed'),
          description: error.message || t('auth.signInFailedDesc'),
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting
    if (!checkRateLimit('signup', 3, 60000)) {
      toast({
        title: t('auth.tooManyAttempts'),
        description: t('auth.tooManyAttemptsDesc'),
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    // Validate privacy policy agreement
    if (!agreeToPrivacy) {
      toast({
        title: t('auth.privacyRequired'),
        description: t('auth.privacyRequiredDesc'),
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      toast({
        title: t('auth.invalidPassword'),
        description: passwordValidation.error || t('auth.invalidPasswordDesc'),
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedFullName = sanitizeInput(fullName);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      toast({
        title: t('auth.invalidEmail'),
        description: t('auth.invalidEmailDesc'),
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          data: {
            full_name: sanitizedFullName,
          },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) {
        
        // Handle specific error cases
        if (error.message.includes("already registered") || 
            error.message.includes("User already registered") ||
            error.message.includes("already been registered") ||
            error.status === 422) {
          toast({
            title: t('auth.accountExists'),
            description: t('auth.accountExistsDesc'),
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
        toast({
          title: t('auth.welcomeToCineMind'),
          description: t('auth.welcomeToCineMindDesc'),
        });
        
        // Clear form
        setEmail("");
        setPassword("");
        setFullName("");
        
        // Since confirmations are disabled, users can access the app immediately
        navigate("/");
      } else {
        toast({
          title: t('auth.signUpFailed'),
          description: t('auth.signUpFailedDesc'),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: t('auth.signUpFailed'),
        description: error.message || t('auth.signUpFailedDesc'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show password reset screen
  if (showPasswordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative pt-safe-top">
        {/* Background Neural Network Effect */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
          <div className="absolute top-1/3 right-1/3 w-32 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
          <div className="floating-particle absolute top-20 right-20 w-2 h-2 bg-primary rounded-full opacity-30"></div>
          <div className="floating-particle absolute bottom-32 left-32 w-1 h-1 bg-accent rounded-full opacity-50 animation-delay-3s"></div>
        </div>

        <Card className="w-full max-w-md neural-card">
          <div className="p-8">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>

            {/* Header */}
            <div className="flex flex-col items-center space-y-4 mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent neural-glow">
                <Lock className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {t('auth.resetPassword')}
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('auth.resetPasswordDesc')}
                </p>
              </div>
            </div>

            {/* Password Reset Form */}
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">{t('auth.newPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={newPasswordRef}
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={() => scrollInputIntoView(newPasswordRef.current)}
                    className="pl-10"
                    placeholder={t('auth.enterNewPassword')}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t('auth.confirmPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={confirmPasswordRef}
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => scrollInputIntoView(confirmPasswordRef.current)}
                    className="pl-10"
                    placeholder={t('auth.confirmNewPassword')}
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
                {loading ? t('auth.updatingPassword') : t('auth.updatePassword')}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(false)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {t('auth.backToSignIn')}
                </button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative pt-safe-top">
      {/* Background Neural Network Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/3 right-1/3 w-32 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <div className="floating-particle absolute top-20 right-20 w-2 h-2 bg-primary rounded-full opacity-30"></div>
        <div className="floating-particle absolute bottom-32 left-32 w-1 h-1 bg-accent rounded-full opacity-50 animation-delay-3s"></div>
      </div>

      <Card className="w-full max-w-md neural-card">
        <div className="p-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>

          {/* Header */}
          <div className="flex flex-col items-center space-y-4 mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent neural-glow">
              <Brain className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t('auth.welcomeTo')} {t('app.name')}
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                {t('app.tagline')}
              </p>
            </div>
          </div>

          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{t('auth.signIn')}</TabsTrigger>
              <TabsTrigger value="signup">{t('auth.signup')}</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">{t('auth.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      ref={emailRef}
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => scrollInputIntoView(emailRef.current)}
                      className="pl-10"
                      placeholder={t('auth.enterEmail')}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      ref={passwordRef}
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => scrollInputIntoView(passwordRef.current)}
                      className="pl-10"
                      placeholder={t('auth.enterPassword')}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full neural-button"
                  disabled={loading}
                >
                  {loading ? t('auth.signingIn') : t('auth.signIn')}
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-primary hover:underline"
                  >
                    {t('auth.forgotPassword')}
                  </button>
                </div>

                {/* Continue as Guest Option - Only on Sign In */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        {t('auth.or')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      type="button"
                      onClick={() => {
                        // Set guest mode flag and navigate to main app (no form submit)
                        localStorage.setItem('guestMode', 'true');
                        localStorage.setItem('skipLanding', 'true');
                        navigate("/");
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      {t('auth.continueAsGuest')}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      {t('auth.guestDesc')}
                    </p>
                  </div>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">{t('auth.fullName')}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      ref={fullNameRef}
                      id="signup-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onFocus={() => scrollInputIntoView(fullNameRef.current)}
                      className="pl-10"
                      placeholder={t('auth.enterFullName')}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t('auth.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      ref={emailRef}
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => scrollInputIntoView(emailRef.current)}
                      className="pl-10"
                      placeholder={t('auth.enterEmail')}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      ref={passwordRef}
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => scrollInputIntoView(passwordRef.current)}
                      className="pl-10"
                      placeholder={t('auth.createPassword')}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {/* Privacy Policy Agreement */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="privacy-agreement"
                      checked={agreeToPrivacy}
                      onCheckedChange={(checked) => setAgreeToPrivacy(checked as boolean)}
                      className="mt-1"
                    />
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      <Label htmlFor="privacy-agreement" className="cursor-pointer">
                        {t('auth.privacyAgreement')}{" "}
                        <Link 
                          to="/privacy" 
                          className="text-primary hover:underline font-medium"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t('auth.privacyPolicy')}
                        </Link>
                        {" "}{t('auth.privacyAgreementText')}
                      </Label>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full neural-button"
                  disabled={loading || !agreeToPrivacy}
                >
                  {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};