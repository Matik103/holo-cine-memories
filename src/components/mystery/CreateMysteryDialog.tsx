import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCreateMystery } from '@/hooks/useMysteries';
import { Plus, HelpCircle, Loader2 } from 'lucide-react';

interface CreateMysteryDialogProps {
  trigger?: React.ReactNode;
  initialDescription?: string;
  initialClues?: string;
  originalSearchQuery?: string;
  aiSuggestions?: any;
  onSuccess?: (mysteryId: string) => void;
}

export function CreateMysteryDialog({
  trigger,
  initialDescription = '',
  initialClues = '',
  originalSearchQuery,
  aiSuggestions,
  onSuccess
}: CreateMysteryDialogProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(initialDescription);
  const [additionalClues, setAdditionalClues] = useState(initialClues);
  const { createMystery, isSubmitting, isAuthenticated } = useCreateMystery();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast({
        title: 'Description required',
        description: 'Please describe what you remember about the movie',
        variant: 'destructive'
      });
      return;
    }

    if (description.trim().length < 20) {
      toast({
        title: 'More details needed',
        description: 'Please provide at least 20 characters to help others identify the movie',
        variant: 'destructive'
      });
      return;
    }

    const mystery = await createMystery(
      description.trim(),
      additionalClues.trim() || undefined,
      originalSearchQuery,
      aiSuggestions
    );

    if (mystery) {
      toast({
        title: 'Mystery posted!',
        description: 'The community will help you find this movie',
        className: 'bg-primary/10 border-primary/20'
      });
      setOpen(false);
      setDescription('');
      setAdditionalClues('');
      
      if (onSuccess) {
        onSuccess(mystery.id);
      } else {
        navigate(`/mysteries/${mystery.id}`);
      }
    } else {
      toast({
        title: 'Error',
        description: 'Failed to post mystery. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button className="neural-button gap-2">
              <Plus className="h-4 w-4" />
              Post Mystery
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            You need to sign in to post a mystery for the community to solve.
          </p>
          <Button onClick={() => navigate('/auth')} className="w-full neural-button">
            Sign In
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="neural-button gap-2">
            <Plus className="h-4 w-4" />
            Post Mystery
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Post a Movie Mystery
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              What do you remember? *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the movie scene, plot, characters, or any details you remember..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 min-h-[120px] resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {description.length}/1000 characters
            </p>
          </div>

          <div>
            <Label htmlFor="clues" className="text-sm font-medium">
              Additional clues (optional)
            </Label>
            <Textarea
              id="clues"
              placeholder="Any other details: approximate year, genre, actors, language, where you saw it..."
              value={additionalClues}
              onChange={(e) => setAdditionalClues(e.target.value)}
              className="mt-2 min-h-[80px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {additionalClues.length}/500 characters
            </p>
          </div>

          <div className="bg-primary/5 rounded-lg p-3 text-xs text-muted-foreground">
            <p className="font-medium text-primary mb-1">Tips for better results:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Describe specific scenes or memorable moments</li>
              <li>Mention any actors or characters you remember</li>
              <li>Include the approximate time period you watched it</li>
              <li>Note any distinctive visual elements or music</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || description.trim().length < 20}
              className="flex-1 neural-button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Mystery'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
