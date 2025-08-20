"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

export interface MagneticConfig {
  strength?: number;
  range?: number;
  behavior?: 'follow' | 'attract' | 'repel';
  damping?: number;
  stiffness?: number;
  mass?: number;
  restDelta?: number;
  restSpeed?: number;
}

export interface MagneticFieldProps {
  x: number;
  y: number;
  range: number;
  isActive: boolean;
}

export interface MagneticEffectProps {
  children?: React.ReactNode;
  render?: (props: { mouseX: number; mouseY: number; isHovering: boolean }) => React.ReactNode;
  config?: MagneticConfig;
  disabled?: boolean;
  debug?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onHover?: (isHovering: boolean) => void;
  threshold?: number;
}

const MagneticField: React.FC<MagneticFieldProps> = ({ x, y, range, isActive }) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: x - range,
        top: y - range,
        width: range * 2,
        height: range * 2,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: isActive ? 0.1 : 0, 
        scale: isActive ? 1 : 0.8 
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div 
        className="w-full h-full rounded-full border-2 border-primary bg-primary/5"
        style={{
          background: `radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 100%)`
        }}
      />
      <div 
        className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
      />
    </motion.div>
  );
};

export const MagneticEffect: React.FC<MagneticEffectProps> = ({
  children,
  render,
  config = {},
  disabled = false,
  debug = false,
  className = "",
  style = {},
  onHover,
  threshold = 0.1,
}) => {
  const {
    strength = 0.3,
    range = 100,
    behavior = 'attract',
    damping = 25,
    stiffness = 200,
    mass = 1,
    restDelta = 0.001,
    restSpeed = 0.01,
  } = config;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [elementCenter, setElementCenter] = useState({ x: 0, y: 0 });

  // Motion values for smooth animations
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring configurations
  const springConfig = {
    damping,
    stiffness,
    mass,
    restDelta,
    restSpeed,
  };

  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // Transform values based on behavior
  const transformX = useTransform(x, (value) => {
    if (disabled || !isHovering) return 0;
    
    const distance = Math.abs(value);
    if (distance > range) return 0;
    
    const intensity = Math.max(0, 1 - distance / range);
    const effect = value * strength * intensity;
    
    switch (behavior) {
      case 'repel':
        return -effect;
      case 'follow':
        return effect * 2;
      case 'attract':
      default:
        return effect;
    }
  });

  const transformY = useTransform(y, (value) => {
    if (disabled || !isHovering) return 0;
    
    const distance = Math.abs(value);
    if (distance > range) return 0;
    
    const intensity = Math.max(0, 1 - distance / range);
    const effect = value * strength * intensity;
    
    switch (behavior) {
      case 'repel':
        return -effect;
      case 'follow':
        return effect * 2;
      case 'attract':
      default:
        return effect;
    }
  });

  // Update element center when component mounts or resizes
  const updateElementCenter = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setElementCenter({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
  }, []);

  // Handle mouse movement
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (disabled || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    setMousePosition({ x: event.clientX, y: event.clientY });

    if (distance <= range) {
      if (!isHovering) {
        setIsHovering(true);
        onHover?.(true);
      }
      mouseX.set(deltaX);
      mouseY.set(deltaY);
    } else {
      if (isHovering) {
        setIsHovering(false);
        onHover?.(false);
        mouseX.set(0);
        mouseY.set(0);
      }
    }
  }, [disabled, range, isHovering, mouseX, mouseY, onHover]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    if (disabled) return;
    
    setIsHovering(false);
    onHover?.(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [disabled, mouseX, mouseY, onHover]);

  // Handle touch events for mobile devices
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (disabled || !containerRef.current || event.touches.length === 0) return;

    const touch = event.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = touch.clientX - centerX;
    const deltaY = touch.clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    setMousePosition({ x: touch.clientX, y: touch.clientY });

    if (distance <= range) {
      if (!isHovering) {
        setIsHovering(true);
        onHover?.(true);
      }
      mouseX.set(deltaX);
      mouseY.set(deltaY);
    }
  }, [disabled, range, isHovering, mouseX, mouseY, onHover]);

  const handleTouchEnd = useCallback(() => {
    if (disabled) return;
    
    setIsHovering(false);
    onHover?.(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [disabled, mouseX, mouseY, onHover]);

  // Setup event listeners
  useEffect(() => {
    updateElementCenter();
    
    const handleResize = () => updateElementCenter();
    const handleScroll = () => updateElementCenter();

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleMouseMove, handleMouseLeave, handleTouchMove, handleTouchEnd, updateElementCenter]);

  // Accessibility: reduce motion for users who prefer it
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const motionProps = prefersReducedMotion 
    ? {} 
    : {
        style: {
          x: transformX,
          y: transformY,
        },
      };

  return (
    <>
      <motion.div
        ref={containerRef}
        className={`relative ${className}`}
        style={style}
        {...motionProps}
        whileHover={!disabled ? { scale: 1.02 } : undefined}
        transition={{ 
          type: "spring", 
          ...springConfig,
          scale: { duration: 0.2 }
        }}
        role="button"
        tabIndex={0}
        aria-label="Magnetic interactive element"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Trigger hover effect on keyboard interaction
            setIsHovering(!isHovering);
          }
        }}
      >
        {render ? render({ 
          mouseX: mouseX.get(), 
          mouseY: mouseY.get(), 
          isHovering 
        }) : children}
        
        {/* Debug visualization */}
        <AnimatePresence>
          {debug && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MagneticField
                x={elementCenter.x - (containerRef.current?.getBoundingClientRect().left || 0)}
                y={elementCenter.y - (containerRef.current?.getBoundingClientRect().top || 0)}
                range={range}
                isActive={isHovering}
              />
              
              {/* Debug info */}
              <div className="absolute top-0 left-0 p-2 bg-black/75 text-white text-xs font-mono rounded">
                <div>Strength: {strength}</div>
                <div>Range: {range}px</div>
                <div>Behavior: {behavior}</div>
                <div>Hovering: {isHovering ? 'Yes' : 'No'}</div>
                <div>Mouse: ({Math.round(mouseX.get())}, {Math.round(mouseY.get())})</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};