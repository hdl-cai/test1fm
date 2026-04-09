import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Icon } from '@/hooks/useIcon';

interface SettingsLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  sections: {
    id: string;
    label: string;
    icon: string;
    adminOnly?: boolean;
    group?: string;
  }[];
  isAdmin?: boolean;
}

export function SettingsLayout({
  children,
  activeSection,
  onSectionChange,
  sections,
  isAdmin = false,
}: SettingsLayoutProps) {
  // Group sections by their 'group' property
  const personalSections = sections.filter(s => s.group === 'personal');
  const orgSections = sections.filter(s => s.group === 'organization' && (!s.adminOnly || isAdmin));

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[calc(100vh-10rem)]">
      {/* Settings Side Navigation */}
      <aside className="w-full md:w-64 flex flex-col gap-6">
        <div>
          <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Personal Settings
          </h3>
          <nav className="flex flex-col gap-1">
            {personalSections.map((section) => (
              <Button
                key={section.id}
                variant="ghost"
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  "justify-start gap-3 h-11 px-3",
                  activeSection === section.id 
                    ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary font-bold" 
                    : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                <Icon name={section.icon} size={20} />
                <span>{section.label}</span>
              </Button>
            ))}
          </nav>
        </div>

        {orgSections.length > 0 && (
          <div>
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Organization
            </h3>
            <nav className="flex flex-col gap-1">
              {orgSections.map((section) => (
                <Button
                  key={section.id}
                  variant="ghost"
                  onClick={() => onSectionChange(section.id)}
                  className={cn(
                    "justify-start gap-3 h-11 px-3",
                    activeSection === section.id 
                      ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary font-bold" 
                      : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon name={section.icon} size={20} />
                  <span>{section.label}</span>
                </Button>
              ))}
            </nav>
          </div>
        )}
      </aside>

      {/* Settings Content Area */}
      <main className="flex-1 bg-card rounded-3xl border border-border/50 p-8 shadow-sm">
        <div className="max-w-4xl mx-auto anime-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
