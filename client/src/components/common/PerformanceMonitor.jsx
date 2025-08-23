import React, { useEffect, useState } from 'react';

const PerformanceMonitor = ({ enabled = false }) => {
  const [metrics, setMetrics] = useState({
    apiCalls: 0,
    avgResponseTime: 0,
    slowRequests: 0,
    cacheHits: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    if (!enabled) return;

    // Monitor API response times
    const originalFetch = window.fetch;
    const originalXHR = window.XMLHttpRequest;

    // Intercept fetch requests
    window.fetch = async (...args) => {
      const start = Date.now();
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - start;
        
        setMetrics(prev => ({
          ...prev,
          apiCalls: prev.apiCalls + 1,
          avgResponseTime: (prev.avgResponseTime + duration) / 2,
          slowRequests: duration > 2000 ? prev.slowRequests + 1 : prev.slowRequests
        }));
        
        return response;
      } catch (error) {
        const duration = Date.now() - start;
        setMetrics(prev => ({
          ...prev,
          apiCalls: prev.apiCalls + 1,
          avgResponseTime: (prev.avgResponseTime + duration) / 2
        }));
        throw error;
      }
    };

    // Intercept XHR requests
    const originalOpen = originalXHR.prototype.open;
    const originalSend = originalXHR.prototype.send;
    
    originalXHR.prototype.open = function(...args) {
      this._startTime = Date.now();
      return originalOpen.apply(this, args);
    };
    
    originalXHR.prototype.send = function(...args) {
      this.addEventListener('load', () => {
        const duration = Date.now() - this._startTime;
        setMetrics(prev => ({
          ...prev,
          apiCalls: prev.apiCalls + 1,
          avgResponseTime: (prev.avgResponseTime + duration) / 2,
          slowRequests: duration > 2000 ? prev.slowRequests + 1 : prev.slowRequests
        }));
      });
      
      return originalSend.apply(this, args);
    };

    // Cleanup function
    return () => {
      window.fetch = originalFetch;
      window.XMLHttpRequest = originalXHR;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="mb-2 font-bold">Performance Monitor</div>
      <div>API Calls: {metrics.apiCalls}</div>
      <div>Avg Time: {Math.round(metrics.avgResponseTime)}ms</div>
      <div>Slow (2s): {metrics.slowRequests}</div>
      <div>Cache Hits: {metrics.cacheHits}</div>
    </div>
  );
};

export default PerformanceMonitor;
