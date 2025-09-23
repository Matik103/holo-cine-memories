import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import { X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

// Custom DialogContent without built-in close button
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border-0 bg-black shadow-lg duration-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
CustomDialogContent.displayName = "CustomDialogContent";

export const VideoPlayer = ({ isOpen, onClose, videoUrl, title }: VideoPlayerProps) => {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Extract YouTube video ID from URL with better error handling
  useEffect(() => {
    if (videoUrl && isOpen) {
      const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      if (match && match[1]) {
        setVideoId(match[1]);
        setHasError(false);
      } else {
        setVideoId(null);
        setHasError(true);
      }
    }
  }, [videoUrl, isOpen]);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setHasError(false);
      // Debug logging to help identify issues
      console.log('VideoPlayer opened:', { videoUrl, title, isOpen });
    }
  }, [isOpen, videoUrl, title]);

  const handleClose = () => {
    onClose();
  };

  // Unified header component that always shows - with fallback positioning
  const renderHeader = () => (
    <div 
      className="flex items-center justify-between w-full bg-black/90 backdrop-blur-sm border-b border-white/10 px-4 z-50"
      style={{
        height: 'calc(64px + env(safe-area-inset-top, 0px))',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        minHeight: '64px',
        // Fallback positioning to ensure it's always visible
        position: 'relative',
        zIndex: 9999,
      }}
    >
      <div className="flex-1">
        <h3 className="text-white text-sm font-medium truncate pr-4">
          {title || 'Movie'} Trailer
        </h3>
      </div>
      <Button
        onClick={handleClose}
        variant="ghost"
        size="sm"
        className="w-10 h-10 p-0 text-white hover:bg-white/20 rounded-full bg-red-600 hover:bg-red-700 border border-white/30 shadow-lg touch-manipulation flex-shrink-0"
        style={{
          // Ensure button is always clickable
          position: 'relative',
          zIndex: 10000,
        }}
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  );

  if (!videoId || hasError) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <CustomDialogContent className="w-[100vw] h-[100vh] max-w-none p-0 bg-black border-0 rounded-none">
          <div className="flex flex-col w-full h-full bg-black">
            {/* Unified Header - Always shows */}
            {renderHeader()}
            
            {/* Error Content Area - Safe area adjustment */}
            <div 
              className="flex-1 flex items-center justify-center p-6 bg-black"
              style={{
                height: 'calc(100vh - 64px - env(safe-area-inset-top, 0px))',
              }}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-white">Unable to load video</p>
              </div>
            </div>
          </div>
        </CustomDialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <CustomDialogContent className="w-[100vw] h-[100vh] max-w-none p-0 bg-black border-0 rounded-none">
        <div className="flex flex-col w-full h-full bg-black">
          {/* Unified Header - Always shows */}
          {renderHeader()}
          
          {/* Video Player Area - Reduced height with safe area adjustment */}
          <div 
            className="flex-1 relative bg-black"
            style={{
              height: 'calc(100vh - 64px - env(safe-area-inset-top, 0px))',
            }}
          >
            {/* Loading State */}
            {isLoading && (
              <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-white text-sm">Loading trailer...</p>
                </div>
              </div>
            )}
            
            {/* YouTube Embed - Full height of remaining space */}
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&showinfo=1&playsinline=1`}
              title={`${title} Trailer`}
              className="w-full h-full bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'black'
              }}
            />
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
};
