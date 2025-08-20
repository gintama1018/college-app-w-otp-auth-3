"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { AuthManager } from '@/components/auth/auth-manager'
import { TopNavigation } from '@/components/navigation/horizontal-navigation'
import NotesManager from '@/components/notes/notes-manager'
import TaskBoard from '@/components/tasks/task-board'
import AIChatbot from '@/components/chat/ai-chatbot'
import AttendanceTracker from '@/components/attendance/attendance-tracker'
import AssignmentManager from '@/components/assignments/assignment-manager'
import SettingsPanel from '@/components/profile/settings-panel'
import { MagneticEffect } from '@/components/effects/magnetic-effect'
import { ParallaxText, ParallaxHero, ParallaxLayers } from '@/components/effects/parallax-text'
import { ScrollTrigger } from '@/components/effects/scroll-trigger'
import { useSmoothScroll } from '@/components/providers/smooth-scroll-provider'

interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
}

// Enhanced page transition variants with Lenis-inspired smoothness
const pageVariants = {
  initial: { 
    opacity: 0, 
    y: 60,
    scale: 0.95,
    filter: "blur(10px)"
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: { 
    opacity: 0, 
    y: -60,
    scale: 1.05,
    filter: "blur(10px)",
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// Lenis-inspired smooth container animations
const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  }
}

// Enhanced card animations with magnetic attraction
const cardVariants = {
  initial: { 
    opacity: 0, 
    y: 40,
    scale: 0.9,
    rotateX: 15
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// Floating background elements
const FloatingElements = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden">
      <motion.div
        style={{ y: y1 }}
        className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-xl"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-secondary/8 to-primary/8 rounded-full blur-2xl"
      />
      <motion.div
        style={{ y: y3 }}
        className="absolute bottom-20 left-1/3 w-24 h-24 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full blur-lg"
      />
    </div>
  )
}

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [activeView, setActiveView] = useState('dashboard')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isChatMinimized, setIsChatMinimized] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  
  // Enhanced smooth scroll integration
  const { scrollTo, isInitialized } = useSmoothScroll()

  // Apply dark mode to document with smooth transition
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
    document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light'
  }, [isDarkMode])

  const handleAuthentication = (authenticatedUser: User) => {
    setUser(authenticatedUser)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setActiveView('dashboard')
  }

  const handleNavigation = async (viewId: string) => {
    if (viewId === activeView) return
    
    setIsLoading(true)
    
    // Smooth scroll to top on navigation
    if (isInitialized && scrollTo) {
      scrollTo(0, { duration: 0.6 })
    }
    
    // Enhanced loading animation timing
    await new Promise(resolve => setTimeout(resolve, 400))
    
    setActiveView(viewId)
    setIsLoading(false)
  }

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleToggleChat = () => {
    setIsChatMinimized(!isChatMinimized)
  }

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <AuthManager
          onAuthenticated={handleAuthentication}
          onLogout={handleLogout}
          initialAuthState="login"
        />
      </motion.div>
    )
  }

  const renderMainContent = () => {
    const content = (() => {
      switch (activeView) {
        case 'notes':
          return <NotesManager />
        case 'tasks':
          return <TaskBoard />
        case 'assignments':
          return <AssignmentManager />
        case 'attendance':
          return <AttendanceTracker />
        case 'ai-chat':
          return (
            <div className="p-6">
              <AIChatbot mode="fullscreen" />
            </div>
          )
        case 'profile':
          return <SettingsPanel />
        default:
          return (
            <motion.div 
              className="p-6 space-y-8 relative"
              variants={containerVariants}
              initial="initial"
              animate="animate"
            >
              <FloatingElements />
              
              <div className="max-w-7xl mx-auto relative z-10">
                {/* Enhanced Hero Section with Parallax */}
                <ScrollTrigger
                  config={{
                    trigger: {
                      start: "top bottom",
                      end: "bottom top",
                      scrub: true
                    },
                    animation: {
                      from: { opacity: 0, y: 100 },
                      to: { opacity: 1, y: 0 }
                    }
                  }}
                  className="mb-12"
                >
                  <ParallaxHero
                    title={`Welcome back, ${user?.firstName}! 👋`}
                    subtitle="Here's an overview of your academic progress and upcoming tasks."
                    titleClassName="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
                    subtitleClassName="text-muted-foreground/90"
                  />
                </ScrollTrigger>
                
                {/* Enhanced Stats Cards with Magnetic Effects */}
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                  variants={containerVariants}
                >
                  {/* Assignments Card with Enhanced Animations */}
                  <ScrollTrigger
                    config={{
                      trigger: {
                        start: "top 80%",
                        end: "bottom 20%",
                        scrub: false
                      },
                      animation: {
                        from: { opacity: 0, y: 60, rotateY: -15 },
                        to: { opacity: 1, y: 0, rotateY: 0 }
                      },
                      toggleActions: {
                        onEnter: 'play'
                      }
                    }}
                  >
                    <MagneticEffect
                      config={{ 
                        strength: 0.2, 
                        range: 120,
                        behavior: 'attract',
                        damping: 20,
                        stiffness: 150
                      }}
                      className="group"
                    >
                      <motion.div 
                        className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 cursor-pointer group-hover:bg-card/90"
                        variants={cardVariants}
                        whileHover={{ 
                          scale: 1.02,
                          y: -8,
                          rotateY: 5,
                          transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNavigation('assignments')}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <ParallaxText
                            speed={0.1}
                            direction="horizontal"
                            effect="scale"
                            className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300"
                          >
                            Assignments Due
                          </ParallaxText>
                          <motion.div
                            animate={{ 
                              rotate: [0, 10, -10, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 3,
                              repeat: Infinity,
                              repeatDelay: 2
                            }}
                            className="text-2xl"
                          >
                            📚
                          </motion.div>
                        </div>
                        <div className="text-4xl font-bold text-primary mb-3 font-mono">5</div>
                        <p className="text-sm text-muted-foreground mb-4">2 due this week</p>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: '60%' }}
                            transition={{ duration: 1.5, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                          />
                        </div>
                      </motion.div>
                    </MagneticEffect>
                  </ScrollTrigger>
                  
                  {/* Attendance Card */}
                  <ScrollTrigger
                    config={{
                      trigger: {
                        start: "top 80%",
                        end: "bottom 20%",
                        scrub: false
                      },
                      animation: {
                        from: { opacity: 0, y: 60, rotateY: -15 },
                        to: { opacity: 1, y: 0, rotateY: 0 }
                      },
                      toggleActions: {
                        onEnter: 'play'
                      }
                    }}
                  >
                    <MagneticEffect
                      config={{ 
                        strength: 0.2, 
                        range: 120,
                        behavior: 'attract',
                        damping: 20,
                        stiffness: 150
                      }}
                      className="group"
                    >
                      <motion.div 
                        className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 cursor-pointer group-hover:bg-card/90"
                        variants={cardVariants}
                        whileHover={{ 
                          scale: 1.02,
                          y: -8,
                          rotateY: 5,
                          transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNavigation('attendance')}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <ParallaxText
                            speed={0.1}
                            direction="horizontal"
                            effect="scale"
                            className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300"
                          >
                            Attendance Rate
                          </ParallaxText>
                          <motion.div
                            animate={{ 
                              scale: [1, 1.3, 1],
                              rotate: [0, 360]
                            }}
                            transition={{ 
                              scale: { duration: 2, repeat: Infinity, repeatDelay: 1 },
                              rotate: { duration: 4, repeat: Infinity, ease: "linear" }
                            }}
                            className="text-2xl"
                          >
                            ✅
                          </motion.div>
                        </div>
                        <div className="text-4xl font-bold text-emerald-600 mb-3 font-mono">92%</div>
                        <p className="text-sm text-muted-foreground mb-4">Above average</p>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: '92%' }}
                            transition={{ duration: 1.5, delay: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }}
                          />
                        </div>
                      </motion.div>
                    </MagneticEffect>
                  </ScrollTrigger>
                  
                  {/* Tasks Card */}
                  <ScrollTrigger
                    config={{
                      trigger: {
                        start: "top 80%",
                        end: "bottom 20%",
                        scrub: false
                      },
                      animation: {
                        from: { opacity: 0, y: 60, rotateY: -15 },
                        to: { opacity: 1, y: 0, rotateY: 0 }
                      },
                      toggleActions: {
                        onEnter: 'play'
                      }
                    }}
                  >
                    <MagneticEffect
                      config={{ 
                        strength: 0.2, 
                        range: 120,
                        behavior: 'attract',
                        damping: 20,
                        stiffness: 150
                      }}
                      className="group"
                    >
                      <motion.div 
                        className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 cursor-pointer group-hover:bg-card/90"
                        variants={cardVariants}
                        whileHover={{ 
                          scale: 1.02,
                          y: -8,
                          rotateY: 5,
                          transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNavigation('tasks')}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <ParallaxText
                            speed={0.1}
                            direction="horizontal"
                            effect="scale"
                            className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300"
                          >
                            Active Tasks
                          </ParallaxText>
                          <motion.div
                            animate={{ 
                              rotate: 360,
                              scale: [1, 1.2, 1]
                            }}
                            transition={{ 
                              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                              scale: { duration: 2, repeat: Infinity, repeatDelay: 1 }
                            }}
                            className="text-2xl"
                          >
                            ⚡
                          </motion.div>
                        </div>
                        <div className="text-4xl font-bold text-amber-600 mb-3 font-mono">8</div>
                        <p className="text-sm text-muted-foreground mb-4">3 in progress</p>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: '75%' }}
                            transition={{ duration: 1.5, delay: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                          />
                        </div>
                      </motion.div>
                    </MagneticEffect>
                  </ScrollTrigger>
                </motion.div>
                
                {/* Enhanced Recent Activity with Parallax Layers */}
                <ScrollTrigger
                  config={{
                    trigger: {
                      start: "top 90%",
                      end: "bottom 10%",
                      scrub: true
                    },
                    animation: {
                      from: { opacity: 0, y: 80, scale: 0.95 },
                      to: { opacity: 1, y: 0, scale: 1 }
                    }
                  }}
                >
                  <motion.div 
                    className="bg-card/70 backdrop-blur-2xl border border-border/30 rounded-3xl p-8 shadow-xl"
                    variants={cardVariants}
                  >
                    <ParallaxText
                      speed={0.05}
                      direction="horizontal" 
                      effect="fade"
                      splitType="character"
                      className="text-2xl font-bold text-foreground mb-6"
                    >
                      Recent Activity
                    </ParallaxText>
                    
                    <motion.div 
                      className="space-y-4"
                      variants={containerVariants}
                    >
                      {[
                        { 
                          color: 'bg-primary', 
                          text: 'Completed assignment: Data Structures Problem Set', 
                          time: '2 hours ago',
                          icon: '✅'
                        },
                        { 
                          color: 'bg-emerald-500', 
                          text: 'Attended lecture: Advanced Algorithms', 
                          time: '1 day ago',
                          icon: '📖'
                        },
                        { 
                          color: 'bg-amber-500', 
                          text: 'Created new note: Machine Learning Concepts', 
                          time: '2 days ago',
                          icon: '📝'
                        }
                      ].map((activity, index) => (
                        <MagneticEffect
                          key={index}
                          config={{ 
                            strength: 0.1, 
                            range: 80,
                            behavior: 'attract' 
                          }}
                        >
                          <motion.div
                            className="flex items-center gap-4 text-sm p-4 rounded-xl hover:bg-accent/50 transition-all duration-300 cursor-pointer group backdrop-blur-sm"
                            variants={cardVariants}
                            whileHover={{ 
                              x: 8,
                              scale: 1.02,
                              transition: { duration: 0.2 }
                            }}
                          >
                            <motion.div 
                              className={`w-3 h-3 ${activity.color} rounded-full relative`}
                              animate={{ 
                                scale: [1, 1.4, 1],
                                boxShadow: [
                                  `0 0 0 0px ${activity.color}40`,
                                  `0 0 0 8px ${activity.color}20`,
                                  `0 0 0 0px ${activity.color}40`
                                ]
                              }}
                              transition={{ 
                                duration: 2.5,
                                repeat: Infinity,
                                delay: index * 0.8
                              }}
                            />
                            
                            <ParallaxText
                              speed={0.02}
                              direction="horizontal"
                              className="text-muted-foreground group-hover:text-foreground transition-colors flex-1"
                            >
                              {activity.text}
                            </ParallaxText>
                            
                            <span className="text-xs text-muted-foreground font-mono">
                              {activity.time}
                            </span>
                            
                            <motion.span
                              initial={{ opacity: 0, scale: 0, rotate: -180 }}
                              animate={{ opacity: 1, scale: 1, rotate: 0 }}
                              transition={{ 
                                delay: index * 0.3 + 1.5,
                                type: "spring",
                                stiffness: 200,
                                damping: 10
                              }}
                              className="text-lg"
                            >
                              {activity.icon}
                            </motion.span>
                          </motion.div>
                        </MagneticEffect>
                      ))}
                    </motion.div>
                  </motion.div>
                </ScrollTrigger>
              </div>
            </motion.div>
          )
      }
    })()

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="min-h-screen"
        >
          {content}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-gradient-to-br from-background via-background to-accent/5 relative overflow-x-hidden`}>
      {/* Enhanced Navigation with Magnetic Effects */}
      <MagneticEffect
        config={{ 
          strength: 0.15, 
          range: 100,
          behavior: 'attract' 
        }}
        className="relative z-50"
      >
        <TopNavigation
          activeItem={activeView}
          onNavigate={handleNavigation}
          user={{
            name: `${user?.firstName} ${user?.lastName}`,
            email: user?.email || '',
            avatar: user?.avatar
          }}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          isLoading={isLoading}
        />
      </MagneticEffect>
      
      {/* Main content with enhanced animations */}
      <main className="pt-20 relative z-10">
        {renderMainContent()}
      </main>
      
      {/* Enhanced Floating AI Chat Widget */}
      {activeView !== 'ai-chat' && (
        <MagneticEffect
          config={{ 
            strength: 0.3, 
            range: 150,
            behavior: 'attract',
            damping: 15,
            stiffness: 200
          }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ 
              delay: 2, 
              duration: 0.6,
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
          >
            <AIChatbot
              mode="widget"
              isMinimized={isChatMinimized}
              onToggleMinimize={handleToggleChat}
            />
          </motion.div>
        </MagneticEffect>
      )}
    </div>
  )
}