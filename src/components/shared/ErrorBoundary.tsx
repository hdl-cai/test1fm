import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/hooks/useIcon';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Standard Error Boundary for catching UI crashes
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-12 bg-destructive/5 border border-destructive/20 rounded-2xl text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <Icon name="Alert01Icon" size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">Something went wrong</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Our systems encountered an unexpected error. This has been logged and we're working on it.
            </p>
          </div>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="h-11 px-8 rounded-xl font-bold uppercase tracking-widest text-micro border-destructive/50 hover:bg-destructive hover:text-destructive-foreground transition-all"
          >
            Refresh Dashboard
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher Order Component to wrap any component with an Error Boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
