import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Database, Shield, Eye, Lock, Calendar } from "lucide-react";

export const DataUsagePolicy = () => {
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
            Data Usage Policy
          </h1>
        </div>

        <Card className="neural-card p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">CineMind Data Usage Policy</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Last Updated: December 2024</span>
              </div>
            </div>

            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6 text-sm leading-relaxed">
                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Overview</h3>
                  <p className="mb-3">
                    This Data Usage Policy explains how CineMind collects, uses, processes, and protects 
                    your personal data. We are committed to transparency and giving you control over your information.
                  </p>
                  <p>
                    This policy supplements our Privacy Policy and explains the specific ways we use your 
                    data to provide and improve our movie identification and recommendation services.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Data We Collect</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-primary">Account Information</h4>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Email address for account creation and communication</li>
                        <li>Username and profile information</li>
                        <li>Account preferences and settings</li>
                        <li>Authentication data and security information</li>
                      </ul>
                    </div>

                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-primary">Movie-Related Data</h4>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Movie search queries and descriptions</li>
                        <li>Movie ratings and preferences</li>
                        <li>Watch history and viewing patterns</li>
                        <li>Favorite movies and genres</li>
                        <li>CineDNA profile data and insights</li>
                      </ul>
                    </div>

                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-primary">Usage Analytics</h4>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>App usage patterns and feature interactions</li>
                        <li>Search success rates and accuracy metrics</li>
                        <li>Performance data and error logs</li>
                        <li>Device information and technical specifications</li>
                      </ul>
                    </div>

                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-primary">Voice Data</h4>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Voice recordings for movie search (processed locally when possible)</li>
                        <li>Transcribed text from voice inputs</li>
                        <li>Voice recognition accuracy data</li>
                        <li>Audio quality metrics for improvement</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">How We Use Your Data</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-primary">Core Services</h4>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Identify movies from your descriptions and memories</li>
                        <li>Provide personalized movie recommendations</li>
                        <li>Generate movie explanations and analysis</li>
                        <li>Find streaming availability for movies</li>
                        <li>Build and maintain your CineDNA profile</li>
                      </ul>
                    </div>

                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-primary">Service Improvement</h4>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Train and improve our AI algorithms</li>
                        <li>Enhance movie identification accuracy</li>
                        <li>Develop new features and capabilities</li>
                        <li>Optimize app performance and user experience</li>
                        <li>Conduct research and analysis</li>
                      </ul>
                    </div>

                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-primary">Communication</h4>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Send important service updates and notifications</li>
                        <li>Provide customer support and assistance</li>
                        <li>Share new features and improvements</li>
                        <li>Send personalized movie recommendations</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Data Processing Methods</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-primary">AI Processing</h4>
                      <p className="mb-2">We use advanced AI technologies to:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Analyze your movie descriptions using natural language processing</li>
                        <li>Match your queries against our movie database</li>
                        <li>Generate personalized recommendations using machine learning</li>
                        <li>Create insights for your CineDNA profile</li>
                      </ul>
                    </div>

                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-primary">Data Aggregation</h4>
                      <p className="mb-2">We may aggregate your data to:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Create anonymous usage statistics</li>
                        <li>Identify popular movies and trends</li>
                        <li>Improve our recommendation algorithms</li>
                        <li>Conduct research and analysis</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Data Sharing</h3>
                  <p className="mb-3">
                    We do not sell your personal data. We may share your data only in these limited circumstances:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Service Providers:</strong> With trusted partners who help us provide our services (OpenAI, Supabase, etc.)</li>
                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                    <li><strong>Consent:</strong> When you explicitly consent to sharing</li>
                    <li><strong>Anonymized Data:</strong> Aggregated, anonymous data for research purposes</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Data Security</h3>
                  <p className="mb-3">
                    We implement robust security measures to protect your data:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>End-to-end encryption for sensitive data</li>
                    <li>Secure data storage with industry-standard protocols</li>
                    <li>Regular security audits and updates</li>
                    <li>Access controls and authentication systems</li>
                    <li>Data backup and recovery procedures</li>
                    <li>Staff training on data protection practices</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Your Data Rights</h3>
                  <p className="mb-3">
                    You have the following rights regarding your data:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Access:</strong> View all data we have about you</li>
                    <li><strong>Portability:</strong> Export your data in a standard format</li>
                    <li><strong>Correction:</strong> Update or correct inaccurate data</li>
                    <li><strong>Deletion:</strong> Request deletion of your data</li>
                    <li><strong>Restriction:</strong> Limit how we process your data</li>
                    <li><strong>Objection:</strong> Object to certain data processing activities</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Data Retention</h3>
                  <p className="mb-3">
                    We retain your data for different periods depending on the type:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Account Data:</strong> Until you delete your account</li>
                    <li><strong>Movie Preferences:</strong> Until you clear your history or delete your account</li>
                    <li><strong>Usage Analytics:</strong> Up to 2 years for service improvement</li>
                    <li><strong>Voice Data:</strong> Processed immediately and deleted within 30 days</li>
                    <li><strong>Legal Requirements:</strong> As required by applicable law</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">International Transfers</h3>
                  <p className="mb-3">
                    Your data may be transferred to and processed in countries other than your own. 
                    We ensure appropriate safeguards are in place for international transfers, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Standard contractual clauses approved by relevant authorities</li>
                    <li>Adequacy decisions by data protection authorities</li>
                    <li>Certification schemes and codes of conduct</li>
                    <li>Binding corporate rules for intra-group transfers</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Children's Data</h3>
                  <p className="mb-3">
                    CineMind is not intended for children under 13. We do not knowingly collect 
                    personal data from children under 13. If we become aware that we have collected 
                    such data, we will take steps to delete it promptly.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Contact Us</h3>
                  <p className="mb-3">
                    If you have questions about this Data Usage Policy or want to exercise your rights, contact us:
                  </p>
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <p><strong>Email:</strong> privacy@cinemind.app</p>
                    <p><strong>Data Protection Officer:</strong> dpo@cinemind.app</p>
                    <p><strong>Address:</strong> CineMind Data Protection Team, 123 Movie Street, Los Angeles, CA 90210</p>
                  </div>
                </section>

                <div className="border-t border-border pt-6 mt-8">
                  <p className="text-xs text-muted-foreground">
                    This Data Usage Policy is effective as of the date listed above and may be updated 
                    from time to time. We will notify you of any material changes through the app or by email.
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
