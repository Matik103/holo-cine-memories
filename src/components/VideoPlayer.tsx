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
        "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
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

  // Extract YouTube video ID from URL
  useEffect(() => {
    if (videoUrl) {
      const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      if (match) {
        setVideoId(match[1]);
      }
    }
  }, [videoUrl]);

  const handleClose = () => {
    onClose();
  };

  if (!videoId) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <CustomDialogContent className="w-[100vw] h-[100vh] max-w-none p-0 bg-black border-0 rounded-none">
          <div className="relative w-full h-full">
            {/* Close Button */}
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
            >
              <X className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center justify-center h-full p-6">
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
        <div className="relative w-full h-full">
          {/* Close Button */}
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
          
          {/* YouTube Embed - Full screen mobile experience */}
          <div className="relative w-full h-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&showinfo=1&playsinline=1`}
              title={`${title} Trailer`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }}
            />
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
};
