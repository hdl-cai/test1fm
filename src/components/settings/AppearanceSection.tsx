import { useState } from 'react';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';

export function AppearanceSection() {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('flockmate-theme') as 'light' | 'dark') || 'dark'
  );

  const applyTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('flockmate-theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold">Appearance</h2>
        <p className="text-muted-foreground text-sm">Customize the visual experience of the FlockMate dashboard.</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div className="p-8 bg-muted/20 border border-border/50 rounded-3xl space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Icon name="SunIcon" size={24} />
             </div>
             <div>
                <h3 className="font-bold">Interface Theme</h3>
                <p className="text-[10px] text-muted-foreground italic">Switch between light and dark modes.</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => applyTheme('light')}
              className={cn(
                "relative group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                theme === 'light' 
                  ? "bg-white border-primary shadow-md scale-[1.02]" 
                  : "bg-muted/30 border-border/50 hover:border-border hover:bg-muted/50"
              )}
            >
              <div className="w-full aspect-video rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative shadow-inner">
                <div className="absolute top-2 left-2 w-1/3 h-2 bg-slate-300 rounded-full" />
                <div className="absolute top-6 left-2 w-2/3 h-1.5 bg-slate-200 rounded-full" />
                <div className="absolute top-10 left-2 w-1/2 h-1.5 bg-slate-200 rounded-full" />
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-primary/20 rounded-lg" />
              </div>
              <div className="flex items-center gap-2">
                <Icon name="SunIcon" size={14} className={theme === 'light' ? "text-primary" : "text-muted-foreground"} />
                <span className={cn("text-xs font-bold uppercase tracking-widest", theme === 'light' ? "text-primary" : "text-muted-foreground")}>Light Mode</span>
              </div>
              {theme === 'light' && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg anime-pop-in">
                  <Icon name="CheckCircleIcon" size={14} className="text-white" />
                </div>
              )}
            </button>

            <button
              onClick={() => applyTheme('dark')}
              className={cn(
                "relative group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                theme === 'dark' 
                  ? "bg-slate-900 border-primary shadow-md scale-[1.02]" 
                  : "bg-muted/30 border-border/50 hover:border-border hover:bg-muted/50"
              )}
            >
              <div className="w-full aspect-video rounded-lg bg-slate-800 border border-slate-700 overflow-hidden relative shadow-inner">
                <div className="absolute top-2 left-2 w-1/3 h-2 bg-slate-700 rounded-full" />
                <div className="absolute top-6 left-2 w-2/3 h-1.5 bg-slate-800 rounded-full" />
                <div className="absolute top-10 left-2 w-1/2 h-1.5 bg-slate-800 rounded-full" />
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-primary/40 rounded-lg" />
              </div>
              <div className="flex items-center gap-2">
                <Icon name="MoonIcon" size={14} className={theme === 'dark' ? "text-primary" : "text-muted-foreground"} />
                <span className={cn("text-xs font-bold uppercase tracking-widest", theme === 'dark' ? "text-primary" : "text-muted-foreground")}>Dark Mode</span>
              </div>
              {theme === 'dark' && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg anime-pop-in">
                  <Icon name="CheckCircleIcon" size={14} className="text-white" />
                </div>
              )}
            </button>
          </div>
        </div>

        <div className="p-6 border border-border/50 rounded-3xl bg-muted/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold">Automatic Sync</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Sync theme with your system settings.</p>
            </div>
            <div className="w-10 h-6 bg-muted rounded-full relative cursor-not-allowed opacity-50">
               <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
