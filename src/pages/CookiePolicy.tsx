import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Cookie, Shield, Settings, Calendar } from "lucide-react";

export const CookiePolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-2 sm:p-4 relative">
      {/* Background Neural Network Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/3 right-1/3 w-32 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-2">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="rounded-full w-10 h-10 p-0 hover:bg-secondary/50 touch-manipulation flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Cookie Policy
          </h1>
        </div>

        <Card className="neural-card p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <Cookie className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">CineMind Cookie Policy</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Last Updated: December 2024</span>
              </div>
            </div>

            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6 text-sm leading-relaxed">
                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">What Are Cookies?</h3>
                  <p className="mb-3">
                    Cookies are small text files that are stored on your device when you visit our app. 
                    They help us provide you with a better experience by remembering your preferences 
                    and understanding how you use our services.
                  </p>
                  <p>
                    CineMind uses cookies to enhance your movie discovery experience, remember your 
                    preferences, and provide personalized recommendations.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Types of Cookies We Use</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-primary">Essential Cookies</h4>
                      <p className="mb-2">These cookies are necessary for the app to function properly:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Authentication cookies to keep you logged in</li>
                        <li>Session cookies to maintain your app state</li>
                        <li>Security cookies to protect against fraud</li>
                        <li>Accessibility preference cookies</li>
                      </ul>
                    </div>

                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-primary">Functional Cookies</h4>
                      <p className="mb-2">These cookies enhance your experience:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Language preference cookies</li>
                        <li>Theme and display preference cookies</li>
                        <li>Text size and accessibility settings</li>
                        <li>User interface customization cookies</li>
                      </ul>
                    </div>

                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-primary">Analytics Cookies</h4>
                      <p className="mb-2">These cookies help us understand how you use our app:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>App usage statistics</li>
                        <li>Feature performance metrics</li>
                        <li>Error tracking and debugging</li>
                        <li>User behavior analytics</li>
                      </ul>
                    </div>

                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-primary">Personalization Cookies</h4>
                      <p className="mb-2">These cookies help us personalize your experience:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>CineDNA profile data</li>
                        <li>Movie preference tracking</li>
                        <li>Recommendation algorithm data</li>
                        <li>Search history and patterns</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Third-Party Cookies</h3>
                  <p className="mb-3">
                    CineMind may use third-party services that set their own cookies:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>OpenAI:</strong> For AI movie identification and analysis</li>
                    <li><strong>Supabase:</strong> For user authentication and data storage</li>
                    <li><strong>YouTube:</strong> For movie trailer embedding</li>
                    <li><strong>OMDb/TMDB:</strong> For movie data and poster images</li>
                    <li><strong>Analytics Services:</strong> For app performance monitoring</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">How Long Do Cookies Last?</h3>
                  <div className="space-y-2">
                    <p><strong>Session Cookies:</strong> Deleted when you close the app</p>
                    <p><strong>Persistent Cookies:</strong> Remain for up to 2 years or until you delete them</p>
                    <p><strong>Essential Cookies:</strong> Remain until you log out or clear app data</p>
                    <p><strong>Preference Cookies:</strong> Remain until you change your settings</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Managing Your Cookie Preferences</h3>
                  <p className="mb-3">
                    You can control cookies through your device settings and our app preferences:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-primary">App Settings</h4>
                      <p className="mb-2">In CineMind, you can:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Disable analytics cookies in Settings</li>
                        <li>Clear your search history</li>
                        <li>Reset your CineDNA profile</li>
                        <li>Export or delete your data</li>
                      </ul>
                    </div>

                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-primary">Device Settings</h4>
                      <p className="mb-2">On your device, you can:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Block all cookies in your browser settings</li>
                        <li>Delete existing cookies</li>
                        <li>Set cookie preferences per website</li>
                        <li>Use private/incognito browsing mode</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Impact of Disabling Cookies</h3>
                  <p className="mb-3">
                    If you disable cookies, some features may not work properly:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>You may need to log in repeatedly</li>
                    <li>Your preferences won't be saved</li>
                    <li>Personalized recommendations may not work</li>
                    <li>Some app features may be unavailable</li>
                    <li>Your CineDNA profile may not update</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Updates to This Policy</h3>
                  <p className="mb-3">
                    We may update this Cookie Policy from time to time to reflect changes in our 
                    practices or for other operational, legal, or regulatory reasons.
                  </p>
                  <p>
                    We will notify you of any significant changes through the app or by email. 
                    Your continued use of CineMind after changes constitutes acceptance of the updated policy.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Contact Us</h3>
                  <p className="mb-3">
                    If you have any questions about our use of cookies, please contact us:
                  </p>
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <p><strong>Email:</strong> privacy@cinemind.app</p>
                    <p><strong>Support:</strong> support@cinemind.app</p>
                    <p><strong>Address:</strong> CineMind Privacy Team, 123 Movie Street, Los Angeles, CA 90210</p>
                  </div>
                </section>

                <div className="border-t border-border pt-6 mt-8">
                  <p className="text-xs text-muted-foreground">
                    This Cookie Policy is part of our Privacy Policy and Terms of Service. 
                    By using CineMind, you consent to our use of cookies as described in this policy.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </div>
        </Card>
      </div>
    </div>
  );
};
