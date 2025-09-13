// Performance monitoring utilities for React applications
import { Profiler } from 'react';

// Performance metrics collection
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  // Start timing a performance metric
  startTiming(name) {
    if (!this.isEnabled) return;
    
    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    });
  }

  // End timing a performance metric
  endTiming(name) {
    if (!this.isEnabled) return;
    
    const metric = this.metrics.get(name);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      
      // Log slow operations (only in development)
      if (metric.duration > 100 && this.isEnabled) {
        console.warn(`Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`);
      }
    }
  }

  // Get performance metrics
  getMetrics() {
    return Array.from(this.metrics.entries()).map(([name, metric]) => ({
      name,
      duration: metric.duration,
      startTime: metric.startTime,
      endTime: metric.endTime
    }));
  }

  // Clear metrics
  clearMetrics() {
    this.metrics.clear();
  }

  // Monitor component render performance
  onRenderCallback = (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
    if (!this.isEnabled) return;
    
    const renderInfo = {
      id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
      timestamp: Date.now()
    };

    // Log slow renders (only in development)
    if (actualDuration > 16 && this.isEnabled) { // More than one frame at 60fps
      console.warn(`Slow render detected: ${id} took ${actualDuration.toFixed(2)}ms`);
    }

    // Store render metrics
    const key = `${id}_${phase}`;
    this.metrics.set(key, renderInfo);
  };

  // Monitor API call performance
  monitorApiCall = async (apiCall, name) => {
    if (!this.isEnabled) return apiCall;
    
    this.startTiming(`api_${name}`);
    try {
      const result = await apiCall;
      this.endTiming(`api_${name}`);
      return result;
    } catch (error) {
      this.endTiming(`api_${name}`);
      throw error;
    }
  };

  // Monitor function execution time
  monitorFunction = (fn, name) => {
    if (!this.isEnabled) return fn;
    
    return (...args) => {
      this.startTiming(`function_${name}`);
      try {
        const result = fn(...args);
        this.endTiming(`function_${name}`);
        return result;
      } catch (error) {
        this.endTiming(`function_${name}`);
        throw error;
      }
    };
  };

  // Get performance report
  getReport() {
    const metrics = this.getMetrics();
    const slowOperations = metrics.filter(m => m.duration > 100);
    const slowRenders = metrics.filter(m => m.name.includes('_mount') && m.duration > 16);
    
    return {
      totalMetrics: metrics.length,
      slowOperations: slowOperations.length,
      slowRenders: slowRenders.length,
      averageDuration: metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / metrics.length,
      slowestOperation: metrics.reduce((max, m) => 
        m.duration > (max.duration || 0) ? m : max, { duration: 0 }
      ),
      metrics
    };
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React Profiler wrapper component
export const PerformanceProfiler = ({ id, children, ...props }) => {
  if (!performanceMonitor.isEnabled) {
    return children;
  }

  return (
    <Profiler id={id} onRender={performanceMonitor.onRenderCallback} {...props}>
      {children}
    </Profiler>
  );
};

// Higher-order component for performance monitoring
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  if (!performanceMonitor.isEnabled) {
    return WrappedComponent;
  }

  return (props) => (
    <PerformanceProfiler id={componentName}>
      <WrappedComponent {...props} />
    </PerformanceProfiler>
  );
};

// Hook for performance monitoring
export const usePerformanceMonitor = (name) => {
  const startTiming = (operationName) => {
    performanceMonitor.startTiming(`${name}_${operationName}`);
  };

  const endTiming = (operationName) => {
    performanceMonitor.endTiming(`${name}_${operationName}`);
  };

  const monitorFunction = (fn, operationName) => {
    return performanceMonitor.monitorFunction(fn, `${name}_${operationName}`);
  };

  return {
    startTiming,
    endTiming,
    monitorFunction
  };
};

// Utility functions
export const measureAsync = async (fn, name) => {
  return performanceMonitor.monitorApiCall(fn(), name);
};

export const measureSync = (fn, name) => {
  return performanceMonitor.monitorFunction(fn, name);
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if (!performance.memory) {
    return null;
  }

  return {
    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), // MB
    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), // MB
    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) // MB
  };
};

// Bundle size monitoring
export const logBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle size monitoring available in production builds');
  }
};

export default performanceMonitor;
