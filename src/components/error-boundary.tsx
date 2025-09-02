"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-6 rounded-full bg-destructive/10 p-4">
            <Icons.AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            কিছু একটা ভুল হয়েছে
          </h2>
          <p className="mb-6 max-w-md text-muted-foreground">
            একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। পেজটি পুনরায় লোড করার চেষ্টা করুন।
          </p>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mb-6 max-w-lg">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                ত্রুটির বিস্তারিত দেখুন
              </summary>
              <pre className="mt-2 max-h-32 overflow-auto rounded bg-muted p-2 text-left text-xs">
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <div className="flex gap-3">
            <Button onClick={this.handleReset} variant="outline">
              <Icons.RefreshCcw className="mr-2 h-4 w-4" />
              আবার চেষ্টা করুন
            </Button>
            <Button onClick={() => window.location.reload()}>
              পেজ রিলোড করুন
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
