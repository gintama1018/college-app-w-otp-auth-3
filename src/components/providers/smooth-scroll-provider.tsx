"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useLenis } from "lenis/react";

interface LenisOptions {
  duration?: number;
  easing?: (t: number) => number;
  direction?: "vertical" | "horizontal";
  gestureDirection?: "vertical" | "horizontal" | "both";
  smooth?: boolean;
  mouseMultiplier?: number;
  smoothTouch?: boolean;
  touchMultiplier?: number;
  infinite?: boolean;
  syncTouch?: boolean;
  syncTouchLerp?: number;
  touchInertiaMultiplier?: number;
  orientation?: "vertical" | "horizontal";
  lerp?: number;
  className?: string;
  wheelMultiplier?: number;
  normalizeWheel?: boolean;
}

interface SmoothScrollContextValue {
  lenis: any;
  isInitialized: boolean;
  isLoading: boolean;
  scrollTo: (target: string | number, options?: { offset?: number; duration?: number; easing?: (t: number) => number; immediate?: boolean; lock?: boolean; onComplete?: () => void; }) => void;
  start: () => void;
  stop: () => void;
  destroy: () => void;
  resize: () => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
  emit: (event: string, ...args: any[]) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue | undefined>(undefined);

interface SmoothScrollProviderProps {
  children: React.ReactNode;
  options?: LenisOptions;
  enabled?: boolean;
}

const defaultLenisOptions: LenisOptions = {
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: "vertical",
  gestureDirection: "vertical",
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
  syncTouch: false,
  syncTouchLerp: 0.075,
  touchInertiaMultiplier: 35,
  orientation: "vertical",
  lerp: 0.1,
  wheelMultiplier: 1,
  normalizeWheel: true,
};

export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({
  children,
  options = {},
  enabled = true,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const eventCallbacks = useRef<Map<string, Set<(...args: any[]) => void>>>(new Map());
  
  const mergedOptions = { ...defaultLenisOptions, ...options };
  
  // Initialize Lenis with our options
  const lenis = useLenis({
    ...mergedOptions,
    // Only enable if client-side and enabled prop is true
    enabled: isMounted && enabled,
  });

  // Handle mounting and initialization
  useEffect(() => {
    setIsMounted(true);
    
    const initTimer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => {
      clearTimeout(initTimer);
      setIsMounted(false);
    };
  }, []);

  // Handle Lenis initialization
  useEffect(() => {
    if (lenis && isMounted && enabled) {
      setIsInitialized(true);
      
      // Set up global scroll behavior
      if (typeof window !== "undefined") {
        document.documentElement.style.scrollBehavior = "auto";
      }
    } else {
      setIsInitialized(false);
    }
  }, [lenis, isMounted, enabled]);

  // Memoized scroll functions
  const scrollTo = useCallback((
    target: string | number, 
    scrollOptions: {
      offset?: number;
      duration?: number;
      easing?: (t: number) => number;
      immediate?: boolean;
      lock?: boolean;
      onComplete?: () => void;
    } = {}
  ) => {
    if (!lenis || !isInitialized) return;

    try {
      lenis.scrollTo(target, {
        offset: scrollOptions.offset || 0,
        duration: scrollOptions.duration,
        easing: scrollOptions.easing,
        immediate: scrollOptions.immediate || false,
        lock: scrollOptions.lock || false,
        onComplete: scrollOptions.onComplete,
      });
    } catch (error) {
      console.warn("SmoothScroll: scrollTo failed", error);
    }
  }, [lenis, isInitialized]);

  const start = useCallback(() => {
    if (!lenis || !isInitialized) return;
    
    try {
      lenis.start();
    } catch (error) {
      console.warn("SmoothScroll: start failed", error);
    }
  }, [lenis, isInitialized]);

  const stop = useCallback(() => {
    if (!lenis || !isInitialized) return;
    
    try {
      lenis.stop();
    } catch (error) {
      console.warn("SmoothScroll: stop failed", error);
    }
  }, [lenis, isInitialized]);

  const destroy = useCallback(() => {
    if (!lenis) return;
    
    try {
      lenis.destroy();
      setIsInitialized(false);
      
      // Reset scroll behavior
      if (typeof window !== "undefined") {
        document.documentElement.style.scrollBehavior = "";
      }
    } catch (error) {
      console.warn("SmoothScroll: destroy failed", error);
    }
  }, [lenis]);

  const resize = useCallback(() => {
    if (!lenis || !isInitialized) return;
    
    try {
      lenis.resize();
    } catch (error) {
      console.warn("SmoothScroll: resize failed", error);
    }
  }, [lenis, isInitialized]);

  const scrollToTop = useCallback(() => {
    scrollTo(0, { duration: mergedOptions.duration });
  }, [scrollTo, mergedOptions.duration]);

  const scrollToBottom = useCallback(() => {
    if (typeof window === "undefined") return;
    scrollTo(document.body.scrollHeight, { duration: mergedOptions.duration });
  }, [scrollTo, mergedOptions.duration]);

  // Event system for custom events
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (!eventCallbacks.current.has(event)) {
      eventCallbacks.current.set(event, new Set());
    }
    eventCallbacks.current.get(event)?.add(callback);

    // Also register with Lenis if available
    if (lenis && isInitialized) {
      try {
        lenis.on(event, callback);
      } catch (error) {
        console.warn(`SmoothScroll: Failed to register event ${event}`, error);
      }
    }
  }, [lenis, isInitialized]);

  const off = useCallback((event: string, callback: (...args: any[]) => void) => {
    eventCallbacks.current.get(event)?.delete(callback);

    // Also unregister from Lenis if available
    if (lenis && isInitialized) {
      try {
        lenis.off(event, callback);
      } catch (error) {
        console.warn(`SmoothScroll: Failed to unregister event ${event}`, error);
      }
    }
  }, [lenis, isInitialized]);

  const emit = useCallback((event: string, ...args: any[]) => {
    const callbacks = eventCallbacks.current.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.warn(`SmoothScroll: Error in event callback for ${event}`, error);
        }
      });
    }

    // Also emit through Lenis if available
    if (lenis && isInitialized) {
      try {
        lenis.emit(event, ...args);
      } catch (error) {
        console.warn(`SmoothScroll: Failed to emit event ${event}`, error);
      }
    }
  }, [lenis, isInitialized]);

  // Handle resize events
  useEffect(() => {
    if (!isMounted || !enabled) return;

    const handleResize = () => {
      resize();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [resize, isMounted, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (lenis) {
        try {
          lenis.destroy();
        } catch (error) {
          console.warn("SmoothScroll: Cleanup destroy failed", error);
        }
      }
      eventCallbacks.current.clear();
    };
  }, [lenis]);

  const contextValue: SmoothScrollContextValue = {
    lenis: isInitialized ? lenis : null,
    isInitialized: isInitialized && !isLoading,
    isLoading,
    scrollTo,
    start,
    stop,
    destroy,
    resize,
    scrollToTop,
    scrollToBottom,
    on,
    off,
    emit,
  };

  return (
    <SmoothScrollContext.Provider value={contextValue}>
      {children}
    </SmoothScrollContext.Provider>
  );
};

export const useSmoothScroll = (): SmoothScrollContextValue => {
  const context = useContext(SmoothScrollContext);
  
  if (context === undefined) {
    throw new Error("useSmoothScroll must be used within a SmoothScrollProvider");
  }
  
  return context;
};

// Export types for external use
export type { LenisOptions, SmoothScrollContextValue };