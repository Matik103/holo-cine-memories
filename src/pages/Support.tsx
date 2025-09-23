import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, MessageCircle, HelpCircle, Bug, Lightbulb, Phone, Clock } from "lucide-react";

export const Support = () => {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Thank you for your message! We'll get back to you within 24 hours.");
      setContactForm({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  const faqs = [
    {
      question: "How does CineMind identify movies?",
      answer: "CineMind uses advanced AI technology to analyze your movie descriptions, quotes, or feelings and match them against a comprehensive database of films. Simply describe what you remember, and our AI will identify the movie for you."
    },
    {
      question: "Is my data secure and private?",
      answer: "Yes! We take your privacy seriously. All your data is encrypted and secure. We never sell your personal information, and you have full control over your data with export and delete options."
    },
    {
      question: "Does CineMind work offline?",
      answer: "CineMind requires an internet connection for AI features like movie identification and recommendations. However, you can view your saved movies and CineDNA profile offline."
    },
    {
      question: "How accurate is the movie identification?",
      answer: "Our AI is highly accurate and continuously learning. It can identify movies from vague descriptions, quotes, or even just feelings about a film. The more details you provide, the more accurate the results."
    },
    {
      question: "Can I delete my account and data?",
      answer: "Yes, absolutely. You can delete your account and all associated data at any time through the Settings page. This action is permanent and cannot be undone."
    },
    {
      question: "Is CineMind free to use?",
      answer: "Yes! CineMind is completely free to use. All features including movie identification, recommendations, and CineDNA profile building are available at no cost."
    }
  ];

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
            Support Center
          </h1>
        </div>

        {/* Contact Information */}
        <Card className="neural-card p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold">Get Help</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <Mail className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-2">support@cinemind.app</p>
              <p className="text-xs text-muted-foreground">24-48 hour response</p>
            </div>
            
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <Phone className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Phone Support</h3>
              <p className="text-sm text-muted-foreground mb-2">+1 (555) 123-4567</p>
              <p className="text-xs text-muted-foreground">Mon-Fri 9AM-6PM EST</p>
            </div>
            
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-2">Available 24/7</p>
              <p className="text-xs text-muted-foreground">Instant responses</p>
            </div>
          </div>
        </Card>

        {/* Contact Form */}
        <Card className="neural-card p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold">Send us a Message</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Input
                value={contactForm.subject}
                onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                placeholder="What can we help you with?"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea
                value={contactForm.message}
                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                placeholder="Please describe your issue or question in detail..."
                className="min-h-32"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full neural-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </Card>

        {/* FAQ Section */}
        <Card className="neural-card p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-primary">{faq.question}</h3>
                <p className="text-muted-foreground text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Troubleshooting */}
        <Card className="neural-card p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Bug className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold">Troubleshooting</h2>
          </div>
          
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-primary">App not loading movies</h3>
              <p className="text-muted-foreground text-sm mb-2">If CineMind isn't identifying movies:</p>
              <ul className="text-muted-foreground text-sm space-y-1 ml-4">
                <li>• Check your internet connection</li>
                <li>• Try describing the movie in more detail</li>
                <li>• Restart the app</li>
                <li>• Update to the latest version</li>
              </ul>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-primary">Voice search not working</h3>
              <p className="text-muted-foreground text-sm mb-2">If voice search isn't responding:</p>
              <ul className="text-muted-foreground text-sm space-y-1 ml-4">
                <li>• Check microphone permissions</li>
                <li>• Ensure you're in a quiet environment</li>
                <li>• Speak clearly and slowly</li>
                <li>• Try typing instead</li>
              </ul>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-primary">CineDNA not updating</h3>
              <p className="text-muted-foreground text-sm mb-2">If your profile isn't learning:</p>
              <ul className="text-muted-foreground text-sm space-y-1 ml-4">
                <li>• Make sure you're logged in</li>
                <li>• Search for more movies</li>
                <li>• Rate movies you've watched</li>
                <li>• Check your preferences in Settings</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
