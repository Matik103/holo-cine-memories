import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Shield, FileText, Scale, Cookie, Database, HelpCircle, Info } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const Settings = () => {
  const navigate = useNavigate();

  const legalItems = [
    { icon: Shield, label: "Privacy Policy", path: "/privacy" },
    { icon: FileText, label: "Terms of Service", path: "/terms" },
    { icon: Scale, label: "License Agreement", path: "/license" },
    { icon: Cookie, label: "Cookie Policy", path: "/cookies" },
    { icon: Database, label: "Data Usage", path: "/data-usage" },
  ];

  const supportItems = [
    { icon: HelpCircle, label: "Help Center", path: "/help" },
    { icon: Info, label: "About CineMind", path: "/about" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
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
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Legal Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legal & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {legalItems.map((item, index) => (
                <div key={item.path}>
                  <Link to={item.path}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 px-3"
                    >
                      <item.icon className="h-5 w-5 mr-3 text-muted-foreground" />
                      <span className="text-left">{item.label}</span>
                    </Button>
                  </Link>
                  {index < legalItems.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Support Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Support & Help</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {supportItems.map((item, index) => (
                <div key={item.path}>
                  <Link to={item.path}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 px-3"
                    >
                      <item.icon className="h-5 w-5 mr-3 text-muted-foreground" />
                      <span className="text-left">{item.label}</span>
                    </Button>
                  </Link>
                  {index < supportItems.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                For support and inquiries, reach us at:
              </p>
              <p className="text-sm font-medium mt-2">ernst@cinemind.tech</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};