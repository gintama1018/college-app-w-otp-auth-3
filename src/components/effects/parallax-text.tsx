"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, useTransform, useScroll, useSpring, useInView } from 'framer-motion';

export interface ParallaxTextProps {
  children: string;
  speed?: number;
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  className?: string;
  effect?: 'fade' | 'blur' | 'scale' | 'rotate' | 'none';
  splitType?: 'word' | 'character' | 'line' | 'none';
  offset?: number;
  enableSmoothScroll?: boolean;
  delay?: number;
  viewport?: {
    once?: boolean;
    margin?: string;
    amount?: number;
  };
  reversed?: boolean;
  range?: [number, number];
}

interface TextSegment {
  content: string;
  index: number;
  type: 'word' | 'character' | 'line';
}

export const ParallaxText: React.FC<ParallaxTextProps> = ({
  children,
  speed = 0.5,
  direction = 'horizontal',
  className = '',
  effect = 'none',
  splitType = 'none',
  offset = 0,
  enableSmoothScroll = true,
  delay = 0,
  viewport = { once: false, margin: '-20%' },
  reversed = false,
  range = [0, 1]
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [segments, setSegments] = useState<TextSegment[]>([]);
  const isInView = useInView(ref, viewport);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Create smooth spring animations
  const smoothScrollY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Calculate transform values based on direction and speed
  const getTransformValue = () => {
    const scrollValue = enableSmoothScroll ? smoothScrollY : scrollYProgress;
    const multiplier = reversed ? -speed : speed;
    const baseTransform = useTransform(
      scrollValue,
      range,
      [offset, offset + (100 * multiplier)]
    );
    
    return baseTransform;
  };

  const transformX = direction === 'horizontal' || direction === 'diagonal' ? getTransformValue() : useTransform(scrollYProgress, () => 0);
  const transformY = direction === 'vertical' || direction === 'diagonal' ? getTransformValue() : useTransform(scrollYProgress, () => 0);

  // Split text into segments based on splitType
  useEffect(() => {
    if (splitType === 'none') return;

    const text = children;
    let newSegments: TextSegment[] = [];

    switch (splitType) {
      case 'character':
        newSegments = text.split('').map((char, index) => ({
          content: char,
          index,
          type: 'character'
        }));
        break;
      
      case 'word':
        newSegments = text.split(/(\s+)/).map((word, index) => ({
          content: word,
          index,
          type: 'word'
        }));
        break;
      
      case 'line':
        newSegments = text.split('\n').map((line, index) => ({
          content: line,
          index,
          type: 'line'
        }));
        break;
    }

    setSegments(newSegments);
  }, [children, splitType]);

  // Animation variants for different effects
  const getEffectVariants = (segmentIndex: number = 0) => {
    const baseDelay = delay + (segmentIndex * 0.02);
    
    const variants = {
      hidden: {
        opacity: 0,
        ...(effect === 'fade' && { opacity: 0 }),
        ...(effect === 'blur' && { filter: 'blur(10px)' }),
        ...(effect === 'scale' && { scale: 0.8 }),
        ...(effect === 'rotate' && { rotate: -10 }),
      },
      visible: {
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        rotate: 0,
        transition: {
          duration: 0.6,
          delay: baseDelay,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }
    };

    return variants;
  };

  // Render split text with individual animations
  const renderSplitText = () => {
    if (splitType === 'none') {
      return (
        <motion.span
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={getEffectVariants()}
        >
          {children}
        </motion.span>
      );
    }

    return segments.map((segment, index) => (
      <motion.span
        key={`${segment.type}-${index}`}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={getEffectVariants(index)}
        className={segment.content === ' ' ? 'whitespace-pre' : ''}
        style={{
          display: splitType === 'line' ? 'block' : 'inline-block',
        }}
      >
        {segment.content}
      </motion.span>
    ));
  };

  // Base styles for the container
  const containerStyles = {
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
  };

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={containerStyles}
    >
      <motion.div
        style={{
          x: transformX,
          y: transformY,
          ...containerStyles,
        }}
        className="relative"
      >
        {renderSplitText()}
      </motion.div>
    </div>
  );
};

// Utility component for multiple parallax layers
export interface ParallaxLayersProps {
  layers: Array<{
    text: string;
    speed: number;
    className?: string;
    effect?: ParallaxTextProps['effect'];
    direction?: ParallaxTextProps['direction'];
  }>;
  className?: string;
}

export const ParallaxLayers: React.FC<ParallaxLayersProps> = ({
  layers,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      {layers.map((layer, index) => (
        <ParallaxText
          key={index}
          speed={layer.speed}
          direction={layer.direction}
          effect={layer.effect}
          className={`absolute inset-0 ${layer.className || ''}`}
          splitType="character"
          delay={index * 0.1}
        >
          {layer.text}
        </ParallaxText>
      ))}
    </div>
  );
};

// Hero text component with enhanced parallax effects
export interface ParallaxHeroProps {
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export const ParallaxHero: React.FC<ParallaxHeroProps> = ({
  title,
  subtitle,
  className = '',
  titleClassName = '',
  subtitleClassName = ''
}) => {
  return (
    <div className={`relative space-y-4 ${className}`}>
      <ParallaxText
        speed={0.3}
        direction="horizontal"
        effect="scale"
        splitType="word"
        className={`text-4xl md:text-6xl lg:text-8xl font-bold leading-tight ${titleClassName}`}
      >
        {title}
      </ParallaxText>
      
      {subtitle && (
        <ParallaxText
          speed={0.5}
          direction="vertical"
          effect="fade"
          splitType="character"
          delay={0.3}
          className={`text-lg md:text-xl text-muted-foreground ${subtitleClassName}`}
        >
          {subtitle}
        </ParallaxText>
      )}
    </div>
  );
};

// Scrolling marquee text component
export interface ParallaxMarqueeProps {
  text: string;
  speed?: number;
  direction?: 'left' | 'right';
  className?: string;
  pauseOnHover?: boolean;
}

export const ParallaxMarquee: React.FC<ParallaxMarqueeProps> = ({
  text,
  speed = 50,
  direction = 'left',
  className = '',
  pauseOnHover = true
}) => {
  const [isPaused, setIsPaused] = useState(false);
  
  const animationDirection = direction === 'left' ? -100 : 100;
  
  return (
    <div 
      className={`overflow-hidden whitespace-nowrap ${className}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <motion.div
        animate={{
          x: [0, animationDirection]
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear"
          }
        }}
        style={{
          animationPlayState: isPaused ? 'paused' : 'running'
        }}
        className="inline-block"
      >
        <span className="pr-8">{text}</span>
        <span className="pr-8">{text}</span>
        <span className="pr-8">{text}</span>
      </motion.div>
    </div>
  );
};