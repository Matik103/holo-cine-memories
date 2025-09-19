import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Tv, DollarSign, Gift } from "lucide-react";

interface StreamingOption {
  platform: string;
  type: 'free' | 'subscription' | 'rent' | 'buy';
  price?: string;
  url: string;
  quality?: string;
}

interface StreamingAvailabilityProps {
  movieTitle: string;
  options: StreamingOption[];
  onBack: () => void;
}

export const StreamingAvailability = ({ movieTitle, options, onBack }: StreamingAvailabilityProps) => {
  const freeOptions = options.filter(opt => opt.type === 'free');
  const subscriptionOptions = options.filter(opt => opt.type === 'subscription');
  const rentBuyOptions = options.filter(opt => opt.type === 'rent' || opt.type === 'buy');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'free': return <Gift className="w-4 h-4" />;
      case 'subscription': return <Tv className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'free': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'subscription': return 'bg-primary/20 text-primary border-primary/30';
      default: return 'bg-accent/20 text-accent border-accent/30';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Where to Watch</h1>
        <p className="text-xl text-primary font-medium">{movieTitle}</p>
      </div>

      {/* Free Options */}
      {freeOptions.length > 0 && (
        <div className="neural-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
              <Gift className="w-4 h-4 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Watch Free</h2>
          </div>
          
          <div className="grid gap-3">
            {freeOptions.map((option, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="font-medium text-foreground">{option.platform}</div>
                  <Badge className={getTypeColor(option.type)}>
                    {getTypeIcon(option.type)}
                    <span className="ml-2">Free</span>
                  </Badge>
                  {option.quality && (
                    <Badge variant="outline" className="border-border">
                      {option.quality}
                    </Badge>
                  )}
                </div>
                <Button 
                  className="neural-button rounded-lg"
                  onClick={() => window.open(option.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Watch Now
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscription Options */}
      {subscriptionOptions.length > 0 && (
        <div className="neural-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <Tv className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Streaming Services</h2>
          </div>
          
          <div className="grid gap-3">
            {subscriptionOptions.map((option, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="font-medium text-foreground">{option.platform}</div>
                  <Badge className={getTypeColor(option.type)}>
                    {getTypeIcon(option.type)}
                    <span className="ml-2">Subscription</span>
                  </Badge>
                  {option.quality && (
                    <Badge variant="outline" className="border-border">
                      {option.quality}
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="outline"
                  className="rounded-lg border-border hover:bg-secondary/50"
                  onClick={() => window.open(option.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Go to {option.platform}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rent/Buy Options */}
      {rentBuyOptions.length > 0 && (
        <div className="neural-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Rent or Buy</h2>
          </div>
          
          <div className="grid gap-3">
            {rentBuyOptions.map((option, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="font-medium text-foreground">{option.platform}</div>
                  <Badge className={getTypeColor(option.type)}>
                    {getTypeIcon(option.type)}
                    <span className="ml-2 capitalize">{option.type}</span>
                  </Badge>
                  {option.price && (
                    <Badge variant="secondary" className="bg-secondary/60">
                      {option.price}
                    </Badge>
                  )}
                  {option.quality && (
                    <Badge variant="outline" className="border-border">
                      {option.quality}
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="outline"
                  className="rounded-lg border-border hover:bg-secondary/50"
                  onClick={() => window.open(option.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {option.type === 'rent' ? 'Rent' : 'Buy'} Now
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="flex justify-center">
        <Button 
          variant="ghost"
          onClick={onBack}
          className="rounded-xl hover:bg-secondary/30"
        >
          Back to Movie Details
        </Button>
      </div>
    </div>
  );
};