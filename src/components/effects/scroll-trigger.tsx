"use client";

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { motion, useAnimation, useScroll, useTransform, AnimationControls, MotionValue } from 'framer-motion';
import { useInView } from 'framer-motion';

// TypeScript Interfaces
export interface ScrollTriggerPoint {
  trigger?: string | HTMLElement;
  start?: string | number;
  end?: string | number;
  scrub?: boolean | number;
  pin?: boolean | string | HTMLElement;
  pinSpacing?: boolean;
  snap?: boolean | number | number[];
  markers?: boolean;
  id?: string;
  refreshPriority?: number;
  anticipatePin?: number;
  invalidateOnRefresh?: boolean;
}

export interface ScrollTriggerAnimation {
  trigger: ScrollTriggerPoint;
  animation: {
    from?: Record<string, any>;
    to?: Record<string, any>;
    keyframes?: Record<string, any>[];
  };
  timeline?: TimelineKeyframe[];
  toggleActions?: ToggleActions;
  callbacks?: ScrollTriggerCallbacks;
  batch?: boolean;
  easing?: string | number[];
  duration?: number;
}

export interface TimelineKeyframe {
  progress: number;
  properties: Record<string, any>;
  ease?: string | number[];
  duration?: number;
}

export interface ToggleActions {
  onEnter?: 'play' | 'pause' | 'resume' | 'reset' | 'restart' | 'complete' | 'reverse' | 'none';
  onLeave?: 'play' | 'pause' | 'resume' | 'reset' | 'restart' | 'complete' | 'reverse' | 'none';
  onEnterBack?: 'play' | 'pause' | 'resume' | 'reset' | 'restart' | 'complete' | 'reverse' | 'none';
  onLeaveBack?: 'play' | 'pause' | 'resume' | 'reset' | 'restart' | 'complete' | 'reverse' | 'none';
}

export interface ScrollTriggerCallbacks {
  onUpdate?: (self: ScrollTriggerInstance) => void;
  onToggle?: (self: ScrollTriggerInstance) => void;
  onRefresh?: (self: ScrollTriggerInstance) => void;
  onEnter?: (self: ScrollTriggerInstance) => void;
  onLeave?: (self: ScrollTriggerInstance) => void;
  onEnterBack?: (self: ScrollTriggerInstance) => void;
  onLeaveBack?: (self: ScrollTriggerInstance) => void;
}

export interface ScrollTriggerInstance {
  progress: number;
  direction: 1 | -1;
  isActive: boolean;
  start: number;
  end: number;
  refresh: () => void;
  kill: () => void;
  enable: () => void;
  disable: () => void;
  getVelocity: () => number;
}

export interface LenisScrollData {
  scroll: number;
  velocity: number;
  direction: 1 | -1;
  progress: number;
}

// Debug Marker Component
const DebugMarker: React.FC<{
  start: number;
  end: number;
  id?: string;
  isActive: boolean;
}> = ({ start, end, id, isActive }) => {
  return (
    <>
      <div
        className={`fixed left-0 w-full h-0.5 z-50 transition-colors duration-200 ${
          isActive ? 'bg-green-500' : 'bg-red-500'
        }`}
        style={{ top: `${start}px` }}
      >
        <div className="absolute left-4 -top-6 text-xs font-mono bg-black text-white px-2 py-1 rounded">
          {id ? `${id} start` : 'start'}
        </div>
      </div>
      <div
        className={`fixed left-0 w-full h-0.5 z-50 transition-colors duration-200 ${
          isActive ? 'bg-green-500' : 'bg-blue-500'
        }`}
        style={{ top: `${end}px` }}
      >
        <div className="absolute left-4 -top-6 text-xs font-mono bg-black text-white px-2 py-1 rounded">
          {id ? `${id} end` : 'end'}
        </div>
      </div>
    </>
  );
};

// Custom hook for Lenis integration
const useLenis = () => {
  const [scrollData, setScrollData] = useState<LenisScrollData>({
    scroll: 0,
    velocity: 0,
    direction: 1,
    progress: 0,
  });

  useEffect(() => {
    let lenis: any;

    const initLenis = async () => {
      try {
        const Lenis = (await import('@studio-freight/lenis')).default;
        lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          syncTouch: false,
        });

        const raf = (time: number) => {
          lenis.raf(time);
          requestAnimationFrame(raf);
        };

        requestAnimationFrame(raf);

        lenis.on('scroll', ({ scroll, velocity, direction, progress }: any) => {
          setScrollData({ scroll, velocity, direction, progress });
        });
      } catch (error) {
        console.warn('Lenis not found, using fallback scroll detection');
        // Fallback scroll detection
        const handleScroll = () => {
          const scroll = window.scrollY;
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const progress = maxScroll > 0 ? scroll / maxScroll : 0;
          
          setScrollData(prev => ({
            scroll,
            velocity: scroll - prev.scroll,
            direction: scroll > prev.scroll ? 1 : -1,
            progress,
          }));
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
      }
    };

    initLenis();

    return () => {
      if (lenis) {
        lenis.destroy();
      }
    };
  }, []);

  return scrollData;
};

// ScrollTrigger Hook
export const useScrollTrigger = (config: ScrollTriggerAnimation) => {
  const controls = useAnimation();
  const elementRef = useRef<HTMLDivElement>(null);
  const [instance, setInstance] = useState<ScrollTriggerInstance | null>(null);
  const scrollData = useLenis();
  const isInView = useInView(elementRef, { 
    margin: "-10% 0px -10% 0px",
    amount: 0.1 
  });

  const calculateTriggerPoints = useCallback(() => {
    if (!elementRef.current) return { start: 0, end: 0 };

    const element = elementRef.current;
    const rect = element.getBoundingClientRect();
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;

    let start = 0;
    let end = 0;

    if (typeof config.trigger.start === 'string') {
      const [triggerPos, viewportPos] = config.trigger.start.split(' ');
      const triggerOffset = triggerPos === 'top' ? 0 : 
                           triggerPos === 'center' ? rect.height / 2 : 
                           triggerPos === 'bottom' ? rect.height : 0;
      const viewportOffset = viewportPos === 'top' ? 0 :
                            viewportPos === 'center' ? windowHeight / 2 :
                            viewportPos === 'bottom' ? windowHeight : 0;
      start = rect.top + scrollTop + triggerOffset - viewportOffset;
    } else {
      start = rect.top + scrollTop + (config.trigger.start || 0);
    }

    if (typeof config.trigger.end === 'string') {
      const [triggerPos, viewportPos] = config.trigger.end.split(' ');
      const triggerOffset = triggerPos === 'top' ? 0 : 
                           triggerPos === 'center' ? rect.height / 2 : 
                           triggerPos === 'bottom' ? rect.height : 0;
      const viewportOffset = viewportPos === 'top' ? 0 :
                            viewportPos === 'center' ? windowHeight / 2 :
                            viewportPos === 'bottom' ? windowHeight : 0;
      end = rect.top + scrollTop + triggerOffset - viewportOffset;
    } else {
      end = start + (config.trigger.end || rect.height);
    }

    return { start, end };
  }, [config.trigger.start, config.trigger.end]);

  const { start, end } = useMemo(calculateTriggerPoints, [calculateTriggerPoints]);

  const progress = useMemo(() => {
    const scrollTop = scrollData.scroll;
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, [scrollData.scroll, start, end]);

  const isActive = useMemo(() => {
    return scrollData.scroll >= start && scrollData.scroll <= end;
  }, [scrollData.scroll, start, end]);

  // Handle scrub animations
  useEffect(() => {
    if (config.trigger.scrub && isActive) {
      const { from = {}, to = {} } = config.animation;
      const interpolatedValues: Record<string, any> = {};

      Object.keys(to).forEach(key => {
        const fromValue = from[key] || 0;
        const toValue = to[key];
        interpolatedValues[key] = fromValue + (toValue - fromValue) * progress;
      });

      controls.set(interpolatedValues);
    }
  }, [progress, isActive, config.trigger.scrub, config.animation, controls]);

  // Handle timeline animations
  useEffect(() => {
    if (config.timeline && isActive) {
      const currentKeyframe = config.timeline.reduce((prev, curr) => {
        return curr.progress <= progress ? curr : prev;
      });

      if (currentKeyframe) {
        controls.set(currentKeyframe.properties);
      }
    }
  }, [progress, isActive, config.timeline, controls]);

  // Handle toggle actions
  useEffect(() => {
    const { toggleActions, callbacks } = config;
    
    if (isActive && !instance?.isActive) {
      // Entering
      if (toggleActions?.onEnter === 'play') {
        controls.start(config.animation.to || {});
      }
      callbacks?.onEnter?.(instance!);
    } else if (!isActive && instance?.isActive) {
      // Leaving
      if (toggleActions?.onLeave === 'reverse') {
        controls.start(config.animation.from || {});
      }
      callbacks?.onLeave?.(instance!);
    }
  }, [isActive, instance, config, controls]);

  // Create and update instance
  useEffect(() => {
    const newInstance: ScrollTriggerInstance = {
      progress,
      direction: scrollData.direction,
      isActive,
      start,
      end,
      refresh: calculateTriggerPoints,
      kill: () => setInstance(null),
      enable: () => {},
      disable: () => {},
      getVelocity: () => scrollData.velocity,
    };

    setInstance(newInstance);
    config.callbacks?.onUpdate?.(newInstance);
  }, [progress, scrollData.direction, isActive, start, end, calculateTriggerPoints, config.callbacks]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      calculateTriggerPoints();
      config.callbacks?.onRefresh?.(instance!);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateTriggerPoints, config.callbacks, instance]);

  return {
    ref: elementRef,
    controls,
    progress,
    isActive,
    instance,
    scrollData,
  };
};

// ScrollTrigger Component
export const ScrollTrigger: React.FC<{
  children: React.ReactNode;
  config: ScrollTriggerAnimation;
  className?: string;
  style?: React.CSSProperties;
  debug?: boolean;
}> = ({ children, config, className = '', style = {}, debug = false }) => {
  const { ref, controls, progress, isActive, instance } = useScrollTrigger(config);

  return (
    <>
      <motion.div
        ref={ref}
        animate={controls}
        initial={config.animation.from}
        className={className}
        style={style}
        transition={{
          duration: config.duration || 0.6,
          ease: config.easing || [0.25, 0.46, 0.45, 0.94],
        }}
      >
        {children}
      </motion.div>
      
      {debug && instance && (
        <DebugMarker
          start={instance.start}
          end={instance.end}
          id={config.trigger.id}
          isActive={isActive}
        />
      )}
    </>
  );
};

// Batch ScrollTrigger Component for performance
export const BatchScrollTrigger: React.FC<{
  items: Array<{
    children: React.ReactNode;
    config: ScrollTriggerAnimation;
    className?: string;
    style?: React.CSSProperties;
  }>;
  debug?: boolean;
}> = ({ items, debug = false }) => {
  return (
    <>
      {items.map((item, index) => (
        <ScrollTrigger
          key={index}
          config={item.config}
          className={item.className}
          style={item.style}
          debug={debug}
        >
          {item.children}
        </ScrollTrigger>
      ))}
    </>
  );
};

// Pin Component
export const PinScrollTrigger: React.FC<{
  children: React.ReactNode;
  config: Omit<ScrollTriggerAnimation, 'animation'> & {
    pinSpacing?: boolean;
    anticipatePin?: number;
  };
  className?: string;
  debug?: boolean;
}> = ({ children, config, className = '', debug = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isPinned, setIsPinned] = useState(false);
  const scrollData = useLenis();

  const { start, end } = useMemo(() => {
    if (!containerRef.current) return { start: 0, end: 0 };

    const element = containerRef.current;
    const rect = element.getBoundingClientRect();
    const scrollTop = window.scrollY;

    const start = rect.top + scrollTop;
    const end = start + rect.height;

    return { start, end };
  }, []);

  const progress = useMemo(() => {
    const scrollTop = scrollData.scroll;
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, [scrollData.scroll, start, end]);

  const shouldPin = useMemo(() => {
    return scrollData.scroll >= start && scrollData.scroll <= end;
  }, [scrollData.scroll, start, end]);

  useEffect(() => {
    setIsPinned(shouldPin);
  }, [shouldPin]);

  return (
    <>
      <div
        ref={containerRef}
        className={`relative ${className}`}
        style={{
          height: config.pinSpacing !== false ? `${end - start + window.innerHeight}px` : 'auto',
        }}
      >
        <div
          ref={contentRef}
          className={`${isPinned ? 'fixed top-0 left-0 w-full z-10' : 'relative'}`}
          style={{
            transform: isPinned ? `translateY(${Math.max(0, scrollData.scroll - start)}px)` : 'none',
          }}
        >
          {children}
        </div>
      </div>

      {debug && (
        <DebugMarker
          start={start}
          end={end}
          id={config.trigger.id}
          isActive={shouldPin}
        />
      )}
    </>
  );
};

// Snap ScrollTrigger Component
export const SnapScrollTrigger: React.FC<{
  children: React.ReactNode;
  snapPoints: number[];
  duration?: number;
  ease?: string | number[];
  className?: string;
}> = ({ children, snapPoints, duration = 0.8, ease = [0.25, 0.46, 0.45, 0.94], className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollData = useLenis();
  const [activeSnap, setActiveSnap] = useState(0);

  useEffect(() => {
    const currentProgress = scrollData.progress;
    const closestSnap = snapPoints.reduce((prev, curr, index) => {
      return Math.abs(curr - currentProgress) < Math.abs(snapPoints[prev] - currentProgress) ? index : prev;
    }, 0);

    setActiveSnap(closestSnap);
  }, [scrollData.progress, snapPoints]);

  return (
    <motion.div
      ref={containerRef}
      className={className}
      animate={{
        y: `-${activeSnap * 100}%`,
      }}
      transition={{
        duration,
        ease,
      }}
    >
      {children}
    </motion.div>
  );
};

// ScrollTrigger Context Provider
export const ScrollTriggerProvider: React.FC<{
  children: React.ReactNode;
  config?: {
    refreshPriority?: number;
    ignoreMobileResize?: boolean;
    autoRefresh?: boolean;
  };
}> = ({ children, config = {} }) => {
  useEffect(() => {
    if (config.autoRefresh !== false) {
      const handleResize = () => {
        // Trigger refresh for all ScrollTrigger instances
        window.dispatchEvent(new CustomEvent('scrolltrigger:refresh'));
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [config.autoRefresh]);

  return <>{children}</>;
};

// Export utility functions
export const ScrollTriggerUtils = {
  refresh: () => {
    window.dispatchEvent(new CustomEvent('scrolltrigger:refresh'));
  },
  
  batch: (targets: string, config: ScrollTriggerAnimation) => {
    const elements = document.querySelectorAll(targets);
    return Array.from(elements).map((element, index) => ({
      ...config,
      trigger: {
        ...config.trigger,
        trigger: element as HTMLElement,
        id: `${config.trigger.id || 'batch'}-${index}`,
      },
    }));
  },

  create: (config: ScrollTriggerAnimation) => {
    return config;
  },

  matchMedia: (query: string, config: ScrollTriggerAnimation) => {
    if (typeof window !== 'undefined' && window.matchMedia(query).matches) {
      return config;
    }
    return null;
  },
};

export default ScrollTrigger;