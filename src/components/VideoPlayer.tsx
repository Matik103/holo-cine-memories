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
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

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

  // Reset states when modal opens and manage auto-hide controls
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setHasError(false);
      setShowControls(true);
      
      // Auto-hide controls after 4 seconds (industry standard)
      if (controlsTimeout) clearTimeout(controlsTimeout);
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 4000);
      setControlsTimeout(timeout);
      
      console.log('VideoPlayer opened:', { videoUrl, title, isOpen });
    }
    
    return () => {
      if (controlsTimeout) clearTimeout(controlsTimeout);
    };
  }, [isOpen, videoUrl, title]);

  // Show controls on user interaction
  const handleShowControls = () => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 4000);
    setControlsTimeout(timeout);
  };

  const handleClose = () => {
    onClose();
  };

  // Industry standard: Always visible close button (Netflix/YouTube style)
  const renderCloseButton = () => (
    <Button
      onClick={handleClose}
      variant="ghost"
      size="sm"
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 60px)', // Increased from 16px to 60px for better visibility
        right: '16px',
        zIndex: 999999999, // Maximum priority - never hidden
        width: '44px',
        height: '44px',
        minWidth: '44px',
        minHeight: '44px',
        borderRadius: '50%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        color: '#ffffff',
        padding: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        touchAction: 'manipulation',
        transform: 'translateZ(0)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.9)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
      }}
      onTouchStart={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.9)';
        e.currentTarget.style.transform = 'translateZ(0) scale(0.95)';
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        e.currentTarget.style.transform = 'translateZ(0) scale(1)';
      }}
    >
      <X 
        style={{
          width: '20px',
          height: '20px',
          strokeWidth: '2.5px',
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))',
        }}
      />
    </Button>
  );

  // Auto-hiding title overlay (Netflix/YouTube style)
  const renderTitleOverlay = () => (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999998,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
        height: 'calc(80px + env(safe-area-inset-top, 0px))',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        paddingLeft: '20px',
        paddingRight: '80px', // Space for close button
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        opacity: showControls ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: showControls ? 'auto' : 'none',
      }}
    >
      <h3 
        style={{
          color: '#ffffff',
          fontSize: '15px',
          lineHeight: '1.3',
          textShadow: '0 2px 8px rgba(0,0,0,0.9)',
          fontWeight: '600',
          margin: '0',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
        }}
      >
        {title || 'Movie'} Trailer
      </h3>
    </div>
  );

  if (!videoId || hasError) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <CustomDialogContent className="w-[100vw] h-[100vh] max-w-none p-0 bg-black border-0 rounded-none">
          <div 
            className="flex flex-col w-full h-full bg-black relative"
            onClick={handleShowControls}
            onTouchStart={handleShowControls}
          >
            {/* Always visible close button - Industry standard */}
            {renderCloseButton()}
            
            {/* Auto-hiding title overlay */}
            {renderTitleOverlay()}
            
            {/* Error Content Area */}
            <div 
              className="flex-1 flex items-center justify-center p-6 bg-black"
              style={{
                height: '100vh',
                width: '100%',
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
        <div 
          className="flex flex-col w-full h-full bg-black relative"
          onClick={handleShowControls}
          onTouchStart={handleShowControls}
        >
          {/* Always visible close button - Industry standard */}
          {renderCloseButton()}
          
          {/* Auto-hiding title overlay */}
          {renderTitleOverlay()}
          
          {/* Video Player Area */}
          <div 
            className="flex-1 relative bg-black"
            style={{
              height: '100vh',
              width: '100%',
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
