/**
 * Login Page
 *
 * Two-panel sign-in layout:
 *  - Left:  Branding panel with poultry illustrations, tagline, stats
 *  - Right: Sign-in form with email/password, validation, loading state
 *
 * Adapted from design/flockmate-auth.html to the project design system.
 */

import { useState, useCallback, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Sun,
  Moon,
  AlertTriangle,
} from 'lucide-react';
import { Icon } from '@/hooks/useIcon';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────────────────────────
   Decorative poultry SVG overlay for left panel
   ──────────────────────────────────────────────────────────── */
function PoultryOverlay() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 420 760"
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.13 }}
      aria-hidden="true"
    >
      {/* Large rooster bottom-right */}
      <g transform="translate(270,560) scale(1.8)">
        <ellipse cx="0" cy="0" rx="28" ry="20" fill="white" />
        <circle cx="30" cy="-22" r="13" fill="white" />
        <path d="M22,-34 Q25,-44 28,-34 Q31,-44 34,-34 Q37,-44 40,-34" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="36" cy="-12" rx="4" ry="6" fill="white" opacity="0.6" />
        <polygon points="42,-22 52,-19 42,-16" fill="white" />
        <circle cx="36" cy="-24" r="2.5" fill="rgba(0,0,0,0.3)" />
        <ellipse cx="-5" cy="-2" rx="20" ry="12" transform="rotate(-10 -5 -2)" fill="rgba(255,255,255,0.5)" stroke="white" strokeWidth="1" />
        <path d="M-28,-5 Q-50,-20 -42,2 Q-55,-8 -44,10 Q-52,2 -40,16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        <line x1="-5" y1="20" x2="-10" y2="44" stroke="white" strokeWidth="2.5" />
        <line x1="10" y1="20" x2="14" y2="44" stroke="white" strokeWidth="2.5" />
        <line x1="-10" y1="44" x2="-20" y2="48" stroke="white" strokeWidth="2" />
        <line x1="-10" y1="44" x2="-8" y2="52" stroke="white" strokeWidth="2" />
        <line x1="-10" y1="44" x2="-2" y2="50" stroke="white" strokeWidth="2" />
        <line x1="14" y1="44" x2="24" y2="48" stroke="white" strokeWidth="2" />
        <line x1="14" y1="44" x2="12" y2="52" stroke="white" strokeWidth="2" />
        <line x1="14" y1="44" x2="20" y2="50" stroke="white" strokeWidth="2" />
      </g>

      {/* Medium hen top-left */}
      <g transform="translate(55,180) scale(1.1)">
        <ellipse cx="0" cy="0" rx="22" ry="16" fill="white" />
        <circle cx="24" cy="-17" r="10" fill="white" />
        <path d="M17,-26 Q20,-33 23,-26 Q26,-33 29,-26" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <ellipse cx="30" cy="-9" rx="3" ry="5" fill="white" opacity="0.6" />
        <polygon points="33,-17 41,-15 33,-13" fill="white" />
        <circle cx="29" cy="-18" r="2" fill="rgba(0,0,0,0.25)" />
        <ellipse cx="-3" cy="-1" rx="15" ry="9" transform="rotate(-8 -3 -1)" fill="rgba(255,255,255,0.5)" stroke="white" strokeWidth="1" />
        <path d="M-22,-2 Q-38,-14 -32,2 Q-42,-4 -34,10" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <line x1="-3" y1="16" x2="-7" y2="32" stroke="white" strokeWidth="2" />
        <line x1="7" y1="16" x2="10" y2="32" stroke="white" strokeWidth="2" />
        <line x1="-7" y1="32" x2="-14" y2="36" stroke="white" strokeWidth="1.5" />
        <line x1="-7" y1="32" x2="-5" y2="40" stroke="white" strokeWidth="1.5" />
        <line x1="10" y1="32" x2="17" y2="36" stroke="white" strokeWidth="1.5" />
        <line x1="10" y1="32" x2="8" y2="40" stroke="white" strokeWidth="1.5" />
      </g>

      {/* Small chick middle-right */}
      <g transform="translate(340,300) scale(0.7)">
        <ellipse cx="0" cy="0" rx="18" ry="14" fill="white" />
        <circle cx="19" cy="-14" r="9" fill="white" />
        <polygon points="27,-14 34,-12 27,-10" fill="white" />
        <circle cx="23" cy="-15" r="1.8" fill="rgba(0,0,0,0.25)" />
        <path d="M14,-22 Q16,-26 18,-22" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <line x1="-2" y1="14" x2="-5" y2="26" stroke="white" strokeWidth="2" />
        <line x1="6" y1="14" x2="8" y2="26" stroke="white" strokeWidth="2" />
        <line x1="-5" y1="26" x2="-10" y2="29" stroke="white" strokeWidth="1.5" />
        <line x1="8" y1="26" x2="13" y2="29" stroke="white" strokeWidth="1.5" />
      </g>

      {/* Eggs cluster bottom-left */}
      <g transform="translate(40,600)">
        <ellipse cx="0" cy="0" rx="14" ry="17" fill="white" />
        <ellipse cx="26" cy="5" rx="12" ry="15" fill="white" />
        <ellipse cx="13" cy="-10" rx="11" ry="14" fill="white" opacity="0.7" />
      </g>

      {/* Scattered feathers */}
      <g stroke="white" strokeWidth="1.5" fill="none">
        <path d="M160,80 Q168,65 176,80 Q168,72 160,80Z" fill="white" />
        <line x1="168" y1="80" x2="168" y2="60" stroke="white" strokeWidth="1" />
        <path d="M320,480 Q326,468 332,480 Q326,474 320,480Z" fill="white" />
        <line x1="326" y1="480" x2="326" y2="463" stroke="white" strokeWidth="1" />
        <path d="M80,420 Q86,410 92,420 Q86,415 80,420Z" fill="white" />
        <line x1="86" y1="420" x2="86" y2="405" stroke="white" strokeWidth="1" />
        <path d="M200,650 Q207,638 214,650 Q207,644 200,650Z" fill="white" />
        <line x1="207" y1="650" x2="207" y2="633" stroke="white" strokeWidth="1" />
        <path d="M370,150 Q376,140 382,150 Q376,145 370,150Z" fill="white" />
        <line x1="376" y1="150" x2="376" y2="135" stroke="white" strokeWidth="1" />
      </g>

      {/* Footprint tracks top-right */}
      <g fill="white" transform="translate(330,80)">
        <ellipse cx="0" cy="0" rx="3" ry="2" />
        <ellipse cx="8" cy="-3" rx="3" ry="2" transform="rotate(20 8 -3)" />
        <ellipse cx="16" cy="0" rx="3" ry="2" />
        <ellipse cx="8" cy="9" rx="5" ry="3.5" />
      </g>
      <g fill="white" transform="translate(310,110) rotate(15)">
        <ellipse cx="0" cy="0" rx="3" ry="2" />
        <ellipse cx="8" cy="-3" rx="3" ry="2" transform="rotate(20 8 -3)" />
        <ellipse cx="16" cy="0" rx="3" ry="2" />
        <ellipse cx="8" cy="9" rx="5" ry="3.5" />
      </g>
      <g fill="white" transform="translate(355,130) rotate(-10)">
        <ellipse cx="0" cy="0" rx="3" ry="2" />
        <ellipse cx="8" cy="-3" rx="3" ry="2" transform="rotate(20 8 -3)" />
        <ellipse cx="16" cy="0" rx="3" ry="2" />
        <ellipse cx="8" cy="9" rx="5" ry="3.5" />
      </g>
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   Left Panel
   ──────────────────────────────────────────────────────────── */
function LeftPanel() {
  return (
    <div
      className={cn(
        'hidden md:flex w-[42%] flex-col justify-between',
        'bg-primary relative overflow-hidden p-12'
      )}
    >
      {/* Gradient overlays */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: [
            'radial-gradient(ellipse 80% 60% at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 70%)',
            'radial-gradient(ellipse 60% 50% at 85% 15%, rgba(255,255,255,0.05) 0%, transparent 65%)',
          ].join(', '),
        }}
      />

      {/* Decorative rings */}
      <div className="absolute -top-[120px] -right-[180px] w-[440px] h-[440px] rounded-full border border-white/[0.07] pointer-events-none z-[1]" />
      <div className="absolute bottom-[60px] -left-[100px] w-[280px] h-[280px] rounded-full border border-white/[0.07] pointer-events-none z-[1]" />
      <div className="absolute bottom-[160px] right-[40px] w-[160px] h-[160px] rounded-full border border-white/[0.05] pointer-events-none z-[1]" />

      {/* Poultry illustration overlay */}
      <PoultryOverlay />

      {/* Brand */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-[10px] bg-white/[0.12] border border-white/[0.15] backdrop-blur-sm flex items-center justify-center">
          <Icon name="PlantIcon" size={20} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg text-white leading-tight font-semibold tracking-[0.01em]">
            FlockMate
          </span>
          <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/45">
            Farm Operations
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <h2
          className="text-white leading-[1.22] mb-5 tracking-[-0.01em]"
          style={{ fontSize: 'clamp(28px, 3vw, 38px)' }}
        >
          Your flock,
          <br />
          <span className="font-extrabold text-warning">intelligently</span>
          <br />
          managed.
        </h2>
        <p className="text-sm text-white/55 leading-relaxed max-w-[320px]">
          Real-time monitoring, feed tracking, health analytics, and financial
          oversight — all unified in a single platform built for serious poultry
          operations.
        </p>

        {/* Stats pills */}
        <div className="flex gap-3 mt-9">
          {[
            { value: '104.8K', label: 'Live Birds' },
            { value: '0.71%', label: 'Mortality' },
            { value: '₱18.8M', label: 'Revenue' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex-1 bg-white/[0.08] border border-white/[0.12] rounded-full px-4 py-2.5 backdrop-blur-sm flex flex-col items-center gap-0.5"
            >
              <span className="text-base font-semibold text-white tracking-[-0.02em] tabular-nums">
                {stat.value}
              </span>
              <span className="text-[10px] tracking-[0.08em] uppercase text-white/[0.42]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-[11px] text-white/25 tracking-[0.04em]">
        © 2025 FlockMate. All rights reserved.
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Right Panel — Sign-In Form
   ──────────────────────────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();
  const { signIn, isLoading: authLoading, error: authError, clearError } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback(() => {
    const errors: typeof fieldErrors = {};
    if (!email.trim()) {
      errors.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [email, password]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const didSignIn = await signIn(email, password);
      if (didSignIn) {
        navigate('/', { replace: true });
      }
    } catch {
      // error is set in the store
    } finally {
      setIsSubmitting(false);
    }
  };

  const loading = isSubmitting || authLoading;

  return (
    <div className="min-h-screen flex items-stretch bg-background transition-colors duration-300 overflow-hidden">
      {/* Left Panel */}
      <LeftPanel />

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-7 md:px-15 py-12 relative overflow-y-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'absolute top-7 right-8',
            'bg-input border border-border rounded-full',
            'px-3.5 py-1.5 flex items-center gap-1.5',
            'text-sm font-medium text-muted-foreground',
            'hover:border-ring hover:text-foreground',
            'transition-colors duration-200 cursor-pointer'
          )}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* Auth card */}
        <div className="w-full max-w-[420px] animate-fade-in">
          {/* Header */}
          <div className="mb-7">
            {/* Mobile-only brand badge */}
            <div className="flex md:hidden items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Icon name="PlantIcon" size={18} className="text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground leading-tight">FlockMate</span>
                <span className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase">
                  Farm Operations
                </span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-foreground tracking-[-0.01em] mb-1.5">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sign in to your FlockMate account
            </p>
          </div>

          {/* Error alert */}
          {authError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/25 text-destructive text-sm mb-5">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              {authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="signin-email"
                className="block text-xs font-semibold tracking-[0.06em] uppercase text-muted-foreground mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                  }}
                  placeholder="alex@flockmate.ph"
                  autoComplete="email"
                  className={cn(
                    'w-full bg-input border-[1.5px] rounded-lg pl-9 pr-3.5 py-2.5',
                    'font-sans text-sm text-foreground placeholder:text-muted-foreground',
                    'outline-none transition-[border-color,box-shadow,background] duration-200',
                    fieldErrors.email
                      ? 'border-destructive focus:ring-2 focus:ring-destructive/15'
                      : 'border-border focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20'
                  )}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11.5px] text-destructive font-medium mt-1.5">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label
                htmlFor="signin-password"
                className="block text-xs font-semibold tracking-[0.06em] uppercase text-muted-foreground mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn(
                    'w-full bg-input border-[1.5px] rounded-lg pl-9 pr-10 py-2.5',
                    'font-sans text-sm text-foreground placeholder:text-muted-foreground',
                    'outline-none transition-[border-color,box-shadow,background] duration-200',
                    fieldErrors.password
                      ? 'border-destructive focus:ring-2 focus:ring-destructive/15'
                      : 'border-border focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11.5px] text-destructive font-medium mt-1.5">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Forgot password */}
            <a
              href="#"
              className="block text-right text-xs font-medium text-primary hover:text-primary/80 -mt-2 mb-3.5 tracking-[0.01em] transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Forgot password?
            </a>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full py-3 rounded-lg text-white font-semibold text-[14.5px] tracking-[0.02em]',
                'bg-gradient-to-br from-primary to-success',
                'shadow-[0_4px_18px_rgba(42,122,82,0.35)]',
                'hover:opacity-90 hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(42,122,82,0.45)]',
                'active:translate-y-0',
                'transition-[opacity,transform,box-shadow] duration-200',
                'flex items-center justify-center gap-2 cursor-pointer',
                'disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0'
              )}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-[11.5px] text-muted-foreground text-center mt-6 leading-relaxed">
            <Lock size={11} className="inline -mt-px mr-1" />
            Access is by invitation only.
            <br />
            No account? Contact your{' '}
            <a
              href="#"
              className="text-primary hover:underline"
              onClick={(e) => e.preventDefault()}
            >
              farm administrator
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
