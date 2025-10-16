import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Cookies = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pt-safe-top">
      <div className="container mx-auto px-4 py-6 max-w-4xl pt-6 sm:pt-4">
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
          <h1 className="text-2xl font-bold">Cookie Policy</h1>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">What Are Cookies</h2>
            <p className="text-muted-foreground">
              Cookies are small text files that are placed on your computer or mobile device when you 
              visit our website. They allow us to recognize you and remember your preferences to 
              provide you with a better experience.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">How We Use Cookies</h2>
            <p className="text-muted-foreground mb-4">We use cookies for the following purposes:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Authentication:</strong> To keep you logged in to your account</li>
              <li><strong>Preferences:</strong> To remember your settings and preferences</li>
              <li><strong>Analytics:</strong> To understand how visitors use our website</li>
              <li><strong>Performance:</strong> To improve the speed and performance of our services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Session Cookies</h3>
                <p className="text-muted-foreground">
                  These are temporary cookies that expire when you close your browser.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Persistent Cookies</h3>
                <p className="text-muted-foreground">
                  These remain on your device for a set period or until you delete them.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Third-Party Cookies</h3>
                <p className="text-muted-foreground">
                  Set by third-party services we use, such as analytics providers.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Managing Cookies</h2>
            <p className="text-muted-foreground">
              You can control and manage cookies in various ways. Most browsers allow you to refuse 
              cookies or alert you when cookies are being sent. However, if you disable cookies, 
              some features of CineMind may not function properly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about our use of cookies, please contact us at:
            </p>
            <p className="font-medium mt-2">ernst@cinemind.tech</p>
          </section>
        </div>
      </div>
    </div>
  );
};