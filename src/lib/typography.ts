export const TYPOGRAPHY = {
  // Page Headers - font-bold (700) per specification
  pageTitle: 'text-3xl font-bold text-foreground tracking-tight',

  // Section Headers
  sectionTitle: 'text-sm font-bold text-foreground uppercase tracking-widest',
  sectionSubtitle: 'text-xs text-muted-foreground uppercase tracking-wider',

  // Table Headers
  tableHeader: 'text-micro font-black text-muted-foreground uppercase tracking-[0.15em]',

  // Data Values - monospace per specification
  statValue: 'text-3xl font-bold tracking-tight font-mono',
  largeValue: 'text-3xl font-bold text-foreground tracking-tight',

  // Body Text
  body: 'text-sm text-foreground',
  bodyMuted: 'text-xs text-muted-foreground',

  // Labels
  label: 'text-micro font-bold uppercase tracking-widest',
  badge: 'text-micro font-bold uppercase tracking-wider',

  // Interactive - Option B per specification
  tab: 'text-micro font-bold uppercase tracking-[0.2em]',
  tabActive: 'text-micro font-bold uppercase tracking-[0.2em]',
  button: 'text-xs font-bold uppercase tracking-widest',

  // Technical
  code: 'text-micro font-mono uppercase tracking-widest text-muted-foreground/40',
} as const;

export type TypographyVariant = keyof typeof TYPOGRAPHY;
