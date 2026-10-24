// Performance monitoring utilities
export const measurePerformance = () => {
  // Measure Core Web Vitals
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
      
      // Send to analytics if needed
      if (lastEntry.startTime > 2500) {
        console.warn('LCP is slow:', lastEntry.startTime);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.log('FID:', entry.processingStart - entry.startTime);
        
        if (entry.processingStart - entry.startTime > 100) {
          console.warn('FID is slow:', entry.processingStart - entry.startTime);
        }
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    new PerformanceObserver((list) => {
      let cls = 0;
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      });
      console.log('CLS:', cls);
      
      if (cls > 0.1) {
        console.warn('CLS is poor:', cls);
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }
};

// Measure API response times
export const measureApiPerformance = (url: string, startTime: number) => {
  const duration = performance.now() - startTime;
  console.log(`API ${url}: ${duration.toFixed(2)}ms`);
  
  if (duration > 3000) {
    console.warn(`Slow API call: ${url} took ${duration.toFixed(2)}ms`);
  }
};

// Measure component render times
export const measureRenderTime = (componentName: string, startTime: number) => {
  const duration = performance.now() - startTime;
  console.log(`${componentName} render: ${duration.toFixed(2)}ms`);
  
  if (duration > 16) { // 60fps threshold
    console.warn(`Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
  }
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  // Measure initial page load
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log('Page load time:', loadTime.toFixed(2), 'ms');
    
    // Measure Core Web Vitals
    measurePerformance();
  });
};
