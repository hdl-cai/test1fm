import { Icon, type IconName } from '@/hooks/useIcon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-[#27272A] flex items-center justify-center mb-4">
        <Icon name={icon} size={32} className="text-[#6B7280]" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[#6B7280] max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-[#F59E0B] hover:bg-[#D97706] text-white"
        >
          <Icon name="PlusSignIcon" size={16} className="mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  );
}

export { EmptyState };
