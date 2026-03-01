import { useState, ReactNode, useId } from 'react';
import { useCreateMystery } from '@/hooks/useMysteries';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { HelpCircle, Loader2, LogIn, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CreateMysteryDialogProps {
  trigger?: ReactNode;
  initialDescription?: string;
  originalSearchQuery?: string;
  aiSuggestions?: any;
  onSuccess?: () => void;
}

const MIN_DESCRIPTION_LENGTH = 20;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_CLUES_LENGTH = 2000;

export function CreateMysteryDialog({
  trigger,
  initialDescription = '',
  originalSearchQuery,
  aiSuggestions,
  onSuccess
}: CreateMysteryDialogProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(initialDescription);
  const [clues, setClues] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { createMystery, isSubmitting, isAuthenticated } = useCreateMystery();
  const { toast } = useToast();
  
  const descriptionId = useId();
  const cluesId = useId();
  const errorId = useId();

  const validateDescription = (text: string): string | null => {
    const trimmed = text.trim();
    if (trimmed.length < MIN_DESCRIPTION_LENGTH) {
      return `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters (currently ${trimmed.length})`;
    }
    if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
      return `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`;
    }
    return null;
  };

  const handleSubmit = async () => {
    const error = validateDescription(description);
    if (error) {
      setValidationError(error);
      return;
    }

    if (clues.trim().length > MAX_CLUES_LENGTH) {
      setValidationError(`Additional clues must be less than ${MAX_CLUES_LENGTH} characters`);
      return;
    }

    setValidationError(null);

    const result = await createMystery(
      description,
      clues || undefined,
      originalSearchQuery,
      aiSuggestions
    );

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error.message,
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Mystery Posted!',
      description: 'Your mystery has been posted. The community will help identify it!'
    });

    setOpen(false);
    setDescription('');
    setClues('');
    onSuccess?.();
  };

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.href
      }
    });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setDescription(newValue);
    if (validationError) {
      setValidationError(validateDescription(newValue));
    }
  };

  const characterCount = description.trim().length;
  const isValidLength = characterCount >= MIN_DESCRIPTION_LENGTH && characterCount <= MAX_DESCRIPTION_LENGTH;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="neural-button gap-2">
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            Post a Mystery
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-1.5 sm:space-y-2">
          <DialogTitle className="text-base sm:text-lg">Post a Movie Mystery</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Describe the movie you're trying to find. Include any details you remember - scenes, actors, plot points, or even feelings the movie gave you.
          </DialogDescription>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="py-6 sm:py-8 text-center">
            <LogIn className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
              Sign in to post mysteries and help others find movies
            </p>
            <Button onClick={handleSignIn} className="neural-button w-full sm:w-auto">
              Sign in with Google
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor={descriptionId} className="text-xs sm:text-sm">
                  What do you remember? <span className="text-destructive" aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </Label>
                <Textarea
                  id={descriptionId}
                  placeholder="e.g., There's this movie where a guy wakes up and realizes he's been living the same day over and over..."
                  value={description}
                  onChange={handleDescriptionChange}
                  className={`min-h-[100px] sm:min-h-[120px] text-sm ${validationError ? 'border-destructive' : ''}`}
                  aria-describedby={validationError ? errorId : undefined}
                  aria-invalid={!!validationError}
                  required
                />
                <div className="flex justify-between text-[10px] sm:text-xs">
                  <span 
                    className={`${isValidLength ? 'text-muted-foreground' : characterCount < MIN_DESCRIPTION_LENGTH ? 'text-amber-500' : 'text-destructive'}`}
                    aria-live="polite"
                  >
                    {characterCount}/{MAX_DESCRIPTION_LENGTH}
                    {characterCount < MIN_DESCRIPTION_LENGTH && ` (min ${MIN_DESCRIPTION_LENGTH})`}
                  </span>
                </div>
                {validationError && (
                  <p id={errorId} className="text-[10px] sm:text-xs text-destructive flex items-center gap-1" role="alert">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                    <span>{validationError}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor={cluesId} className="text-xs sm:text-sm">Additional clues (optional)</Label>
                <Textarea
                  id={cluesId}
                  placeholder="e.g., I think it was from the 90s, had a famous actor, was a comedy..."
                  value={clues}
                  onChange={(e) => setClues(e.target.value)}
                  className="min-h-[60px] sm:min-h-[80px] text-sm"
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {clues.length}/{MAX_CLUES_LENGTH}
                </p>
              </div>

              {aiSuggestions?.suggestedTitle && (
                <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50 text-xs sm:text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium">AI suggestion:</span> {aiSuggestions.suggestedTitle}
                    {aiSuggestions.confidence && (
                      <span className="text-[10px] sm:text-xs ml-1 sm:ml-2">
                        ({Math.round(aiSuggestions.confidence * 100)}% confidence)
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    This will be shared with the community as a starting point.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !isValidLength}
                className="neural-button w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                    Posting...
                  </>
                ) : (
                  'Post Mystery'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
