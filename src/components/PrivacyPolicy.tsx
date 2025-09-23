import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, ExternalLink } from "lucide-react";

export const PrivacyPolicy = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
          <Shield className="w-3 h-3 mr-1" />
          Privacy Policy
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Policy
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">Last Updated: December 2024</p>
            
            <div>
              <h3 className="font-semibold mb-2">Introduction</h3>
              <p>
                CineMind ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Information We Collect</h3>
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium">Personal Information</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                    <li>Email Address: Used for account creation and authentication</li>
                    <li>Display Name: Optional name you choose to display in your profile</li>
                    <li>Account Creation Date: For account management purposes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">Usage Data</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                    <li>Movie Search Queries: Descriptions you provide when searching for movies</li>
                    <li>Movie Identifications: Movies identified from your searches</li>
                    <li>User Preferences: Your favorite genres and mood preferences</li>
                    <li>CineDNA Profile: AI-generated profile based on your movie preferences</li>
                    <li>Favorite Movies: Movies you mark as favorites</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">How We Use Your Information</h3>
              <p>We use your information to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                <li>Provide movie identification and recommendation services</li>
                <li>Personalize your experience with AI-powered suggestions</li>
                <li>Improve our app's functionality and user experience</li>
                <li>Communicate with you about your account and our services</li>
                <li>Ensure app security and prevent fraud</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Third-Party Services</h3>
              <p>We use the following third-party services:</p>
              <div className="space-y-2">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <h4 className="font-medium">OpenAI</h4>
                  <p className="text-muted-foreground text-xs">Purpose: AI-powered movie identification and explanations</p>
                  <p className="text-muted-foreground text-xs">Data Shared: Your movie search queries</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <h4 className="font-medium">OMDb API</h4>
                  <p className="text-muted-foreground text-xs">Purpose: Movie poster and metadata retrieval</p>
                  <p className="text-muted-foreground text-xs">Data Shared: Movie titles and years</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <h4 className="font-medium">YouTube API</h4>
                  <p className="text-muted-foreground text-xs">Purpose: Movie trailer retrieval</p>
                  <p className="text-muted-foreground text-xs">Data Shared: Movie titles and years</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Your Rights</h3>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt out of certain data processing</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Data Security</h3>
              <p>
                Your data is stored securely using Supabase. We implement appropriate technical and organizational measures to protect your data. We do not sell, trade, or rent your personal information to third parties.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Children's Privacy</h3>
              <p>Our app is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Contact Us</h3>
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                <li>Email: privacy@cinemind.app</li>
                <li>Address: [Your Business Address]</li>
              </ul>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                This Privacy Policy complies with Apple App Store Review Guidelines, GDPR, and CCPA.
              </p>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end">
          <Button onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
