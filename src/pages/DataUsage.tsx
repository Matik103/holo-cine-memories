import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DataUsage = () => {
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
          <h1 className="text-2xl font-bold">Data Usage Policy</h1>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Data Collection</h2>
            <p className="text-muted-foreground mb-4">
              CineMind collects and processes various types of data to provide you with personalized 
              movie recommendations and improve our services:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Account information (email, display name, preferences)</li>
              <li>Movie search queries and interaction history</li>
              <li>Device and browser information</li>
              <li>Usage patterns and analytics data</li>
              <li>Voice recordings for voice search features</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">How We Use Your Data</h2>
            <p className="text-muted-foreground mb-4">Your data is used to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide personalized movie recommendations through our CineDNA algorithm</li>
              <li>Improve our AI-powered search and recommendation features</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Provide customer support and troubleshooting</li>
              <li>Ensure security and prevent fraudulent activities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Data Storage and Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your data. Your information 
              is stored on secure servers and encrypted both in transit and at rest. We regularly 
              review and update our security practices to ensure your data remains protected.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your data only as long as necessary to provide our services and fulfill the 
              purposes outlined in this policy. You can request deletion of your data at any time 
              by contacting us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Rights</h2>
            <p className="text-muted-foreground mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              For questions about data usage or to exercise your rights, contact us at:
            </p>
            <p className="font-medium mt-2">ernst@cinemind.tech</p>
          </section>
        </div>
      </div>
    </div>
  );
};