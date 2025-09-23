import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Shield, Calendar } from "lucide-react";

export const PrivacyPolicyPage = () => {
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
            Privacy Policy
          </h1>
        </div>

        <Card className="neural-card p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">CineMind Privacy Policy</h2>
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
                  This Privacy Policy describes how CineMind ("we," "our," or "us") collects, uses, and protects your information when you use our mobile application and related services.
                </p>

                <h3>Information We Collect</h3>
                <p>
                  We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
                </p>

                <h3>How We Use Your Information</h3>
                <p>
                  We use the information we collect to provide, maintain, and improve our services, including movie identification, recommendations, and personalized experiences.
                </p>

                <h3>Information Sharing</h3>
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
                </p>

                <h3>Data Security</h3>
                <p>
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>

                <h3>Your Rights</h3>
                <p>
                  You have the right to access, update, or delete your personal information. You can also opt out of certain communications from us.
                </p>

                <h3>Contact Us</h3>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at privacy@cinemind.app.
                </p>
              </div>
            </ScrollArea>
          </div>
        </Card>
      </div>
    </div>
  );
};
