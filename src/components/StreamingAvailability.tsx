import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Tv, DollarSign, Gift, ArrowLeft } from "lucide-react";

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
  const getStreamingUrl = (option: StreamingOption) => {
    return option.url;
  };

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
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-0">
      {/* Header - Mobile Optimized */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="rounded-full w-10 h-10 p-0 hover:bg-secondary/50 touch-manipulation flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-foreground">Where to Watch</h1>
          <p className="text-sm sm:text-base md:text-xl text-primary font-medium truncate">{movieTitle}</p>
        </div>
      </div>

      {/* Free Options - Mobile Optimized */}
      {freeOptions.length > 0 && (
        <div className="neural-card rounded-xl sm:rounded-2xl p-3 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
            </div>
            <h2 className="text-base sm:text-xl font-semibold text-foreground">Watch Free</h2>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {freeOptions.map((option, index) => (
              <div key={index} className="p-3 sm:p-4 bg-secondary/30 rounded-lg sm:rounded-xl border border-border hover:bg-secondary/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Platform Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm sm:text-base truncate">{option.platform}</div>
                    <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                      <Badge className={`${getTypeColor(option.type)} text-xs`}>
                        {getTypeIcon(option.type)}
                        <span className="ml-1">Free</span>
                      </Badge>
                      {option.quality && (
                        <Badge variant="outline" className="border-border text-xs">
                          {option.quality}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Button */}
                   <Button 
                     className="neural-button rounded-lg h-9 sm:h-10 w-full sm:w-auto touch-manipulation"
                     onClick={() => window.open(getStreamingUrl(option), '_blank')}
                     size="sm"
                   >
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Watch Now</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscription Options - Mobile Optimized */}
      {subscriptionOptions.length > 0 && (
        <div className="neural-card rounded-xl sm:rounded-2xl p-3 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Tv className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            </div>
            <h2 className="text-base sm:text-xl font-semibold text-foreground">Streaming Services</h2>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {subscriptionOptions.map((option, index) => (
              <div key={index} className="p-3 sm:p-4 bg-secondary/30 rounded-lg sm:rounded-xl border border-border hover:bg-secondary/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Platform Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm sm:text-base truncate">{option.platform}</div>
                    <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                      <Badge className={`${getTypeColor(option.type)} text-xs`}>
                        {getTypeIcon(option.type)}
                        <span className="ml-1">Subscription</span>
                      </Badge>
                      {option.quality && (
                        <Badge variant="outline" className="border-border text-xs">
                          {option.quality}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Button */}
                   <Button 
                     variant="outline"
                     className="rounded-lg border-border hover:bg-secondary/50 h-9 sm:h-10 w-full sm:w-auto touch-manipulation"
                     onClick={() => window.open(getStreamingUrl(option), '_blank')}
                     size="sm"
                   >
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Go to {option.platform}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rent/Buy Options - Mobile Optimized */}
      {rentBuyOptions.length > 0 && (
        <div className="neural-card rounded-xl sm:rounded-2xl p-3 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
            </div>
            <h2 className="text-base sm:text-xl font-semibold text-foreground">Rent or Buy</h2>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {rentBuyOptions.map((option, index) => (
              <div key={index} className="p-3 sm:p-4 bg-secondary/30 rounded-lg sm:rounded-xl border border-border hover:bg-secondary/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Platform Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm sm:text-base truncate">{option.platform}</div>
                    <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                      <Badge className={`${getTypeColor(option.type)} text-xs`}>
                        {getTypeIcon(option.type)}
                        <span className="ml-1 capitalize">{option.type}</span>
                      </Badge>
                      {option.price && (
                        <Badge variant="secondary" className="bg-secondary/60 text-xs">
                          {option.price}
                        </Badge>
                      )}
                      {option.quality && (
                        <Badge variant="outline" className="border-border text-xs">
                          {option.quality}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Button */}
                   <Button 
                     variant="outline"
                     className="rounded-lg border-border hover:bg-secondary/50 h-9 sm:h-10 w-full sm:w-auto touch-manipulation"
                     onClick={() => window.open(getStreamingUrl(option), '_blank')}
                     size="sm"
                   >
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">{option.type === 'rent' ? 'Rent' : 'Buy'} Now</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back Button - Mobile Optimized */}
      <div className="flex justify-center pt-2 sm:pt-4">
        <Button 
          variant="ghost"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors h-10 touch-manipulation"
        >
          ← Back to Movie Details
        </Button>
      </div>
    </div>
  );
};