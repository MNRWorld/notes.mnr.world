"use client";

import React from 'react';

// Simple performance monitoring utility
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance() {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      
      this.metrics.get(label)!.push(duration);
      
      // Log slow operations in development
      if (process.env.NODE_ENV === 'development' && duration > 100) {
        console.warn(`Slow operation: ${label} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  getMetrics(label: string) {
    const times = this.metrics.get(label) || [];
    if (times.length === 0) return null;

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);
    const min = Math.min(...times);

    return { avg, max, min, count: times.length };
  }

  getAllMetrics() {
    const result: Record<string, any> = {};
    for (const [label, times] of this.metrics.entries()) {
      result[label] = this.getMetrics(label);
    }
    return result;
  }

  logMetrics() {
    if (process.env.NODE_ENV === 'development') {
      console.table(this.getAllMetrics());
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// React hook for performance monitoring
export function usePerformanceTimer(label: string, dependencies: any[] = []) {
  const monitor = PerformanceMonitor.getInstance();
  
  React.useEffect(() => {
    const stopTimer = monitor.startTiming(label);
    return stopTimer;
  }, dependencies);
}
