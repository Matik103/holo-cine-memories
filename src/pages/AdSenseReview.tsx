import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, ExternalLink, Copy } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const ROUTES = [
  { path: "/", label: "Home", description: "Main app and content" },
  { path: "/about", label: "About", description: "About CineMind and contact" },
  { path: "/privacy", label: "Privacy Policy", description: "Required for AdSense" },
  { path: "/terms", label: "Terms of Service", description: "Required for AdSense" },
  { path: "/advertising", label: "Advertising", description: "Ad disclosure and third-party ads" },
  { path: "/help", label: "Help", description: "Help and support" },
] as const;

export const AdSenseReview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const baseUrl = useMemo(() => (typeof window !== "undefined" ? window.location.origin : ""), []);

  const urls = useMemo(
    () => ROUTES.map((r) => ({ ...r, url: `${baseUrl}${r.path}` })),
    [baseUrl]
  );

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(
      () => toast({ title: "Copied", description: "URL copied to clipboard." }),
      () => toast({ title: "Copy failed", variant: "destructive" })
    );
  };

  const copyAllUrls = () => {
    const text = urls.map((u) => `${u.label}: ${u.url}`).join("\n");
    navigator.clipboard.writeText(text).then(
      () => toast({ title: "Copied", description: "All URLs copied to clipboard." }),
      () => toast({ title: "Copy failed", variant: "destructive" })
    );
  };

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
          <h1 className="text-2xl font-bold">Pages for Google AdSense Review</h1>
        </div>

        <Card className="neural-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg">For the AdSense team</CardTitle>
            <p className="text-sm text-muted-foreground">
              Share this page URL with Google when asked which pages to review. All required policy and content pages are linked below with their full URLs.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>This page URL (share with AdSense):</strong>{" "}
              <span className="break-all font-mono text-primary">{baseUrl}/review</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-8"
                onClick={() => copyUrl(`${baseUrl}/review`)}
                aria-label="Copy this page URL"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </p>
            <Button variant="outline" size="sm" onClick={copyAllUrls} className="w-fit mt-2">
              <Copy className="w-4 h-4 mr-2" />
              Copy all URLs below
            </Button>
          </CardHeader>
        </Card>

        <Card className="neural-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Verification checklist</CardTitle>
            <p className="text-sm text-muted-foreground">
              Our site meets AdSense requirements:
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Verification code</p>
                <p className="text-sm text-muted-foreground">AdSense script is in the site &lt;head&gt; (ca-pub-8581598902448403).</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Privacy Policy</p>
                <p className="text-sm text-muted-foreground">Includes data collection, third-party services, and advertising (Google AdSense).</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Terms of Service</p>
                <p className="text-sm text-muted-foreground">Use of the service and user obligations.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Advertising disclosure</p>
                <p className="text-sm text-muted-foreground">Dedicated page explaining third-party ads and links to Google policies.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Contact information</p>
                <p className="text-sm text-muted-foreground">Contact: ernst@cinemind.tech (in Privacy, Terms, About, Help).</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Sitemap</p>
                <p className="text-sm text-muted-foreground">sitemap.xml and robots.txt are available for crawlers.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neural-card">
          <CardHeader>
            <CardTitle className="text-lg">URLs to review</CardTitle>
            <p className="text-sm text-muted-foreground">
              Click to open or use the copy button. These are the pages we ask the AdSense team to check.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {urls.map(({ path, label, description, url }) => (
              <div
                key={path}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground mb-1">{description}</p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all font-mono"
                  >
                    {url}
                  </a>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" asChild>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Open
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyUrl(url)}
                    aria-label={`Copy ${label} URL`}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/advertising" className="text-primary hover:underline">
            Advertising disclosure
          </Link>
          {" · "}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};
