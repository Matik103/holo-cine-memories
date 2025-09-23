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

  // Extract YouTube video ID from URL
  useEffect(() => {
    if (videoUrl) {
      const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      if (match) {
        setVideoId(match[1]);
      }
    }
  }, [videoUrl]);

  // Reset loading state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  if (!videoId) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <CustomDialogContent className="w-[100vw] h-[100vh] max-w-none p-0 bg-black border-0 rounded-none">
          <div className="relative w-full h-full bg-black">
            {/* Close Button - Highly visible and always on top */}
            <div 
              className="fixed right-0 z-[999999] p-2 sm:p-4"
              style={{
                // Position at the same height as YouTube's title bar
                top: 'env(safe-area-inset-top, 44px)',
                right: 'env(safe-area-inset-right, 8px)',
                maxWidth: 'calc(100vw - 16px)',
                maxHeight: 'calc(100vh - 16px)',
                // Force this element to be on top of everything
                position: 'fixed',
                pointerEvents: 'auto',
              }}
            >
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="w-14 h-14 sm:w-12 sm:h-12 p-0 text-white hover:bg-white/30 rounded-full bg-red-600 hover:bg-red-700 border-2 border-white shadow-2xl touch-manipulation"
                style={{
                  // Ensure button is always visible and clickable
                  position: 'relative',
                  zIndex: 999999,
                  pointerEvents: 'auto',
                  // Add a strong background to make it stand out
                  backgroundColor: 'rgba(220, 38, 38, 0.9)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <X className="w-7 h-7 sm:w-6 sm:h-6 font-bold" />
              </Button>
            </div>
            
            <div className="flex items-center justify-center h-full p-6 bg-black">
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
        <div className="relative w-full h-full bg-black">
          {/* Close Button - Highly visible and always on top */}
          <div 
            className="fixed right-0 z-[999999] p-2 sm:p-4"
            style={{
              // Position at the same height as YouTube's title bar
              top: 'env(safe-area-inset-top, 44px)',
              right: 'env(safe-area-inset-right, 8px)',
              maxWidth: 'calc(100vw - 16px)',
              maxHeight: 'calc(100vh - 16px)',
              // Force this element to be on top of everything
              position: 'fixed',
              pointerEvents: 'auto',
            }}
          >
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="w-14 h-14 sm:w-12 sm:h-12 p-0 text-white hover:bg-white/30 rounded-full bg-red-600 hover:bg-red-700 border-2 border-white shadow-2xl touch-manipulation"
              style={{
                // Ensure button is always visible and clickable
                position: 'relative',
                zIndex: 999999,
                pointerEvents: 'auto',
                // Add a strong background to make it stand out
                backgroundColor: 'rgba(220, 38, 38, 0.9)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <X className="w-7 h-7 sm:w-6 sm:h-6 font-bold" />
            </Button>
          </div>
          
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-white text-sm">Loading trailer...</p>
              </div>
            </div>
          )}
          
          {/* YouTube Embed - Full screen mobile experience */}
          <div className="relative w-full h-full bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&showinfo=1&playsinline=1`}
              title={`${title} Trailer`}
              className="w-full h-full bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
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
