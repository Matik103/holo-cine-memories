import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Megaphone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const Advertising = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pt-safe-top">
      <div className="container mx-auto px-4 py-6 max-w-4xl pt-6 sm:pt-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Advertising</h1>
        </div>

        <Card className="neural-card">
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Third-party advertising</h2>
                <p className="text-sm text-muted-foreground">How we use ads on CineMind</p>
              </div>
            </div>

            <p className="text-muted-foreground">
              CineMind may display advertisements provided by Google AdSense. These ads help us keep the service free for users. Ad content is chosen by Google based on factors such as the page you are viewing and your interests (where applicable).
            </p>

            <section>
              <h3 className="font-semibold mb-2">What this means for you</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Ads may use cookies or similar technologies to measure performance and relevance.</li>
                <li>Google’s advertising policies and how they use data are described in their privacy policy and program policies.</li>
                <li>You can control ad personalization and cookies in your browser or via Google’s ad settings.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">More information</h3>
              <p className="text-muted-foreground mb-3">
                For details on how Google uses data in advertising and how you can manage your preferences:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>
                  <a
                    href="https://policies.google.com/technologies/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    How Google uses data in advertising
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.google.com/adsense/answer/48182"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google AdSense program policies
                  </a>
                </li>
                <li>
                  <a
                    href="https://adssettings.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Your ad settings (Google)
                  </a>
                </li>
              </ul>
            </section>

            <p className="text-sm text-muted-foreground">
              Our use of your personal data, including in relation to advertising partners, is also described in our{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>. Publishers and reviewers can use our{" "}
              <Link to="/review" className="text-primary hover:underline">
                AdSense review pages
              </Link> for all required URLs.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
