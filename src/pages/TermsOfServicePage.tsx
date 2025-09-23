import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, FileText, Calendar } from "lucide-react";

export const TermsOfServicePage = () => {
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
            Terms of Service
          </h1>
        </div>

        <Card className="neural-card p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">CineMind Terms of Service</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Last Updated: December 2024</span>
              </div>
            </div>

            <ScrollArea className="h-[60vh] pr-4">
              <div className="prose dark:prose-invert max-w-none">
                <p>
                  These Terms of Service ("Terms") govern your use of CineMind and our related services. By using our app, you agree to these terms.
                </p>

                <h3>Acceptance of Terms</h3>
                <p>
                  By accessing or using CineMind, you agree to be bound by these Terms and our Privacy Policy.
                </p>

                <h3>Description of Service</h3>
                <p>
                  CineMind is an AI-powered movie identification and recommendation service that helps users identify movies, get personalized recommendations, and discover new films.
                </p>

                <h3>User Accounts</h3>
                <p>
                  You may need to create an account to use certain features. You are responsible for maintaining the confidentiality of your account information.
                </p>

                <h3>Acceptable Use</h3>
                <p>
                  You agree to use CineMind only for lawful purposes and in accordance with these Terms. You may not use our service in any way that could damage, disable, or impair our servers or networks.
                </p>

                <h3>Intellectual Property</h3>
                <p>
                  The CineMind app and its content are protected by intellectual property laws. You may not copy, modify, or distribute our content without permission.
                </p>

                <h3>Privacy</h3>
                <p>
                  Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.
                </p>

                <h3>Limitation of Liability</h3>
                <p>
                  To the maximum extent permitted by law, CineMind shall not be liable for any indirect, incidental, special, or consequential damages.
                </p>

                <h3>Termination</h3>
                <p>
                  We may terminate or suspend your account at any time for violation of these Terms or for any other reason.
                </p>

                <h3>Changes to Terms</h3>
                <p>
                  We may update these Terms from time to time. We will notify you of any changes by posting the new Terms on this page.
                </p>

                <h3>Contact Information</h3>
                <p>
                  If you have any questions about these Terms, please contact us at legal@cinemind.app.
                </p>
              </div>
            </ScrollArea>
          </div>
        </Card>
      </div>
    </div>
  );
};
