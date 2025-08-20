import { useEffect, useRef, useCallback } from 'react'

interface LenisOptions {
  duration?: number
  easing?: (t: number) => number
  direction?: 'vertical' | 'horizontal'
  gestureDirection?: 'vertical' | 'horizontal' | 'both'
  smooth?: boolean
  mouseMultiplier?: number
  smoothTouch?: boolean
  touchMultiplier?: number
  infinite?: boolean
  wrapper?: HTMLElement
  content?: HTMLElement
  wheelEventsTarget?: HTMLElement
  eventsTarget?: HTMLElement
  normalizeWheel?: boolean
  syncTouch?: boolean
}

interface LenisInstance {
  raf: (time: number) => void
  scrollTo: (target: string | number | HTMLElement, options?: {
    offset?: number
    lerp?: number
    duration?: number
    immediate?: boolean
    easing?: (t: number) => number
    onComplete?: () => void
  }) => void
  start: () => void
  stop: () => void
  destroy: () => void
  resize: () => void
  on: (event: string, callback: (...args: unknown[]) => void) => void
  off: (event: string, callback: (...args: unknown[]) => void) => void
}

interface UseLenisReturn {
  lenis: LenisInstance | null
  scrollTo: (target: string | number | HTMLElement, options?: {
    offset?: number
    lerp?: number
    duration?: number
    immediate?: boolean
    easing?: (t: number) => number
    onComplete?: () => void
  }) => void
  start: () => void
  stop: () => void
  isScrolling: boolean
}

export const useLenis = (options: LenisOptions = {}): UseLenisReturn => {
  const lenisRef = useRef<LenisInstance | null>(null)
  const rafRef = useRef<number | null>(null)
  const isScrollingRef = useRef<boolean>(false)

  const defaultOptions: LenisOptions = {
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
    normalizeWheel: true,
    syncTouch: false,
    ...options
  }

  const raf = useCallback((time: number) => {
    if (lenisRef.current) {
      lenisRef.current.raf(time)
    }
    rafRef.current = requestAnimationFrame(raf)
  }, [])

  const initializeLenis = useCallback(async () => {
    if (typeof window === 'undefined') return

    try {
      // Dynamic import to avoid SSR issues
      const Lenis = (await import('@studio-freight/lenis')).default
      
      const lenis = new Lenis(defaultOptions) as LenisInstance

      // Track scrolling state
      lenis.on('scroll', () => {
        isScrollingRef.current = true
      })

      lenis.on('scroll-end', () => {
        isScrollingRef.current = false
      })

      lenisRef.current = lenis

      // Start RAF loop
      rafRef.current = requestAnimationFrame(raf)

    } catch (error) {
      console.warn('Lenis failed to initialize:', error)
    }
  }, [defaultOptions, raf])

  const scrollTo = useCallback((
    target: string | number | HTMLElement,
    scrollOptions?: {
      offset?: number
      lerp?: number
      duration?: number
      immediate?: boolean
      easing?: (t: number) => number
      onComplete?: () => void
    }
  ) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, scrollOptions)
    }
  }, [])

  const start = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.start()
    }
  }, [])

  const stop = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.stop()
    }
  }, [])

  const handleResize = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.resize()
    }
  }, [])

  // Initialize Lenis on mount
  useEffect(() => {
    initializeLenis()

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      if (lenisRef.current) {
        lenisRef.current.destroy()
      }
    }
  }, [initializeLenis])

  // Handle resize events
  useEffect(() => {
    if (typeof window === 'undefined') return

    const debouncedResize = (() => {
      let timeoutId: NodeJS.Timeout
      return () => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(handleResize, 150)
      }
    })()

    window.addEventListener('resize', debouncedResize, { passive: true })

    return () => {
      window.removeEventListener('resize', debouncedResize)
    }
  }, [handleResize])

  // Handle visibility change to pause/resume scroll
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stop()
      } else {
        start()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [start, stop])

  return {
    lenis: lenisRef.current,
    scrollTo,
    start,
    stop,
    isScrolling: isScrollingRef.current
  }
}