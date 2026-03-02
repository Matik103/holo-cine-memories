import { useState, ReactNode, useId, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { scrollInputIntoView } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

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
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(initialDescription);
  const [clues, setClues] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { createMystery, isSubmitting, isAuthenticated } = useCreateMystery();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const descriptionId = useId();
  const cluesId = useId();
  const errorId = useId();
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const cluesRef = useRef<HTMLTextAreaElement>(null);

  const validateDescription = (text: string): string | null => {
    const trimmed = text.trim();
    if (trimmed.length < MIN_DESCRIPTION_LENGTH) {
      return t('mystery.descriptionMinChars', { min: MIN_DESCRIPTION_LENGTH, current: trimmed.length });
    }
    if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
      return t('mystery.descriptionMaxChars', { max: MAX_DESCRIPTION_LENGTH });
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
      setValidationError(t('mystery.cluesMaxChars', { max: MAX_CLUES_LENGTH }));
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
        title: t('toast.error'),
        description: result.error.message,
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: t('mystery.mysteryPosted'),
      description: t('mystery.mysteryPostedDesc')
    });

    setOpen(false);
    setDescription('');
    setClues('');
    onSuccess?.();
  };

  const handleSignIn = () => {
    setOpen(false);
    navigate('/auth', { state: { returnTo: window.location.pathname } });
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
            {t('mystery.postMystery')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-1.5 sm:space-y-2">
          <DialogTitle className="text-base sm:text-lg">{t('mystery.postMovieMystery')}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {t('mystery.postMysteryDesc')}
          </DialogDescription>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="py-6 sm:py-8 text-center">
            <LogIn className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
              {t('mystery.signInToPost')}
            </p>
            <Button onClick={handleSignIn} className="neural-button w-full sm:w-auto">
              <LogIn className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('auth.signIn')}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor={descriptionId} className="text-xs sm:text-sm">
                  {t('mystery.whatDoYouRemember')} <span className="text-destructive" aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </Label>
                <Textarea
                  ref={descriptionRef}
                  id={descriptionId}
                  placeholder={t('mystery.descriptionPlaceholder')}
                  value={description}
                  onChange={handleDescriptionChange}
                  onFocus={() => scrollInputIntoView(descriptionRef.current)}
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
                <Label htmlFor={cluesId} className="text-xs sm:text-sm">{t('mystery.additionalCluesOptional')}</Label>
                <Textarea
                  ref={cluesRef}
                  id={cluesId}
                  placeholder={t('mystery.cluesPlaceholder')}
                  value={clues}
                  onChange={(e) => setClues(e.target.value)}
                  onFocus={() => scrollInputIntoView(cluesRef.current)}
                  className="min-h-[60px] sm:min-h-[80px] text-sm"
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {clues.length}/{MAX_CLUES_LENGTH}
                </p>
              </div>

              {aiSuggestions?.suggestedTitle && (
                <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50 text-xs sm:text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium">{t('mystery.aiSuggestion')}:</span> {aiSuggestions.suggestedTitle}
                    {aiSuggestions.confidence && (
                      <span className="text-[10px] sm:text-xs ml-1 sm:ml-2">
                        ({Math.round(aiSuggestions.confidence * 100)}% {t('mystery.confidence')})
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    {t('mystery.aiSuggestionShared')}
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
                {t('mystery.cancel')}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !isValidLength}
                className="neural-button w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                    {t('mystery.posting')}
                  </>
                ) : (
                  t('mystery.postMystery')
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
