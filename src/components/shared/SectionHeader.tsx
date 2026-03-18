import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/hooks/useIcon";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    title: string;
    description?: string;
    actions?: {
        label: string;
        icon?: IconName;
        onClick: () => void;
        variant?: 'default' | 'outline';
        primary?: boolean;
    }[];
    className?: string;
}

export function SectionHeader({ title, description, actions, className }: SectionHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8", className)}>
            <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
                {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
            </div>

            {actions && (
                <div className="flex flex-wrap gap-3">
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            variant={action.variant || 'outline'}
                            onClick={action.onClick}
                            className={cn(
                                "h-10 px-4 flex items-center gap-2",
                                action.primary && !action.variant && "bg-primary text-primary-foreground border-none shadow-lg shadow-primary/20",
                                action.variant === 'outline' && "border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            {action.icon && <Icon name={action.icon} size={18} className={cn(action.primary ? "text-primary-foreground" : "text-primary")} />}
                            {action.label}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}
