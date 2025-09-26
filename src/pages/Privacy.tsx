import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
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
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground mb-6">
            Last updated: September 27, 2025
          </p>

          <p className="text-muted-foreground mb-6">
            CineMind ("we," "our," or "us") values your privacy. This Privacy Policy explains what information we collect, how we use it, and the choices you have when using our app.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              We collect the following types of information:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Account Information:</strong> email address, display name, and any profile information you choose to provide.</li>
              <li><strong>Search & Preferences:</strong> movies you search for, save, or interact with to improve recommendations.</li>
              <li><strong>Usage Data & Analytics:</strong> in-app activity, interactions, crash logs, and performance metrics.</li>
              <li><strong>Device Information:</strong> device type, operating system, app version, and technical identifiers.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              We do not collect sensitive personal information such as payment details, biometric data, or precise location.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use your information to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide personalized movie and TV recommendations.</li>
              <li>Display posters, trailers, and "Where to Watch" information.</li>
              <li>Improve AI-powered discovery features.</li>
              <li>Respond to support requests and troubleshoot issues.</li>
              <li>Protect against fraud, abuse, and security risks.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Data Sharing & Third-Party Services</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell or rent your personal information. However, we may share limited data in the following cases:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Service Providers:</strong> We may use trusted third parties (e.g., analytics providers) to help us operate our app.</li>
              <li><strong>Legal Requirements:</strong> We may disclose data if required by law or to protect our rights and users' safety.</li>
              <li><strong>Third-Party Links:</strong> Our app may include links to external services such as Hulu, Apple TV, Vudu, or YouTube. These services may collect their own data. We are not responsible for their privacy practices, and we encourage you to review their privacy policies.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. YouTube API Services</h2>
            <p className="text-muted-foreground mb-4">
              CineMind uses the YouTube API Services to display trailers and video content. By using CineMind, you are also agreeing to the:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">YouTube Terms of Service</a></li>
              <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Google Privacy Policy</a></li>
            </ul>
            <p className="text-muted-foreground mt-4">
              You may revoke CineMind's access to your YouTube data at any time via your <a href="https://security.google.com/settings/security/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Google Security Settings</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="font-medium mt-2">ernst@cinemind.tech</p>
          </section>
        </div>
      </div>
    </div>
  );
};