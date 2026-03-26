import { Button } from '@/components/ui/button';
import { Icon } from '@/hooks/useIcon';
import { useNavigate } from 'react-router-dom';

/**
 * Displayed when a user tries to access a page they don't have permission for.
 */
export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
        <Icon name="SecurityLockIcon" size={32} />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          You don't have permission to view this page. Contact your administrator if you believe this is an error.
        </p>
      </div>
      <Button
        onClick={() => navigate('/')}
        variant="outline"
        className="h-11 px-8 rounded-xl font-bold uppercase tracking-widest text-micro border-border hover:bg-muted/50 transition-all"
      >
        Return to Dashboard
      </Button>
    </div>
  );
}
