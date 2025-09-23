import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, FileText, Calendar, User, Shield } from "lucide-react";

export const LicenseAgreement = () => {
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
            License Agreement
          </h1>
        </div>

        <Card className="neural-card p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">CineMind Software License Agreement</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Last Updated: December 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Version: 1.0</span>
              </div>
            </div>

            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6 text-sm leading-relaxed">
                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">1. License Grant</h3>
                  <p className="mb-3">
                    CineMind ("the App") is licensed, not sold, to you for use only under the terms of this license agreement. 
                    This license does not give you any rights to the App's source code or any other intellectual property.
                  </p>
                  <p>
                    Subject to the terms of this agreement, CineMind grants you a limited, non-exclusive, non-transferable 
                    license to use the App on your personal devices for personal, non-commercial purposes.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">2. Permitted Uses</h3>
                  <p className="mb-3">You may use the App to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Identify movies based on your descriptions and memories</li>
                    <li>Receive personalized movie recommendations</li>
                    <li>Access movie information and streaming availability</li>
                    <li>Build and maintain your CineDNA profile</li>
                    <li>Use voice search and other App features</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">3. Prohibited Uses</h3>
                  <p className="mb-3">You may not:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Reverse engineer, decompile, or disassemble the App</li>
                    <li>Modify, adapt, or create derivative works of the App</li>
                    <li>Distribute, sell, or sublicense the App to third parties</li>
                    <li>Use the App for commercial purposes without written permission</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Use the App in any way that violates applicable laws</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">4. Intellectual Property</h3>
                  <p className="mb-3">
                    The App and all its content, including but not limited to text, graphics, logos, images, 
                    and software, are the property of CineMind and are protected by copyright and other 
                    intellectual property laws.
                  </p>
                  <p>
                    Movie information, posters, and trailers are provided by third-party services and are 
                    subject to their respective terms and conditions.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">5. User Content</h3>
                  <p className="mb-3">
                    You retain ownership of any content you submit to the App, including movie descriptions, 
                    ratings, and preferences. By using the App, you grant CineMind a license to use this 
                    content to provide and improve our services.
                  </p>
                  <p>
                    You are responsible for ensuring that any content you submit does not violate any 
                    third-party rights or applicable laws.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">6. Privacy and Data</h3>
                  <p className="mb-3">
                    Your privacy is important to us. Please review our Privacy Policy to understand how 
                    we collect, use, and protect your information.
                  </p>
                  <p>
                    We may collect and process your data to provide personalized recommendations and 
                    improve our services. You can control your data through the App's settings.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">7. Disclaimers</h3>
                  <p className="mb-3">
                    THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. 
                    CINEMIND DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, 
                    FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                  </p>
                  <p>
                    We do not guarantee the accuracy, completeness, or reliability of movie information 
                    or recommendations provided by the App.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">8. Limitation of Liability</h3>
                  <p className="mb-3">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, CINEMIND SHALL NOT BE LIABLE FOR ANY 
                    INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM 
                    YOUR USE OF THE APP.
                  </p>
                  <p>
                    Our total liability to you for any claims arising from this agreement shall not 
                    exceed the amount you paid for the App (which is currently $0 as the App is free).
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">9. Termination</h3>
                  <p className="mb-3">
                    This license is effective until terminated by you or CineMind. You may terminate 
                    this license at any time by deleting the App from your devices.
                  </p>
                  <p>
                    CineMind may terminate this license immediately if you breach any terms of this 
                    agreement. Upon termination, you must cease all use of the App and delete all copies.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">10. Updates and Changes</h3>
                  <p className="mb-3">
                    CineMind may update the App and this agreement from time to time. We will notify 
                    you of significant changes through the App or other means.
                  </p>
                  <p>
                    Continued use of the App after changes constitutes acceptance of the new terms.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">11. Governing Law</h3>
                  <p>
                    This agreement is governed by the laws of the State of California, United States, 
                    without regard to conflict of law principles. Any disputes shall be resolved in 
                    the courts of California.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">12. Contact Information</h3>
                  <p className="mb-3">
                    If you have any questions about this license agreement, please contact us at:
                  </p>
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <p><strong>Email:</strong> legal@cinemind.app</p>
                    <p><strong>Address:</strong> CineMind Legal Department, 123 Movie Street, Los Angeles, CA 90210</p>
                  </div>
                </section>

                <div className="border-t border-border pt-6 mt-8">
                  <p className="text-xs text-muted-foreground">
                    By using CineMind, you acknowledge that you have read, understood, and agree to be bound by this License Agreement.
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
