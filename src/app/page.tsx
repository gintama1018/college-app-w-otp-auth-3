"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthManager } from '@/components/auth/auth-manager'
import { TopNavigation } from '@/components/navigation/horizontal-navigation'
import NotesManager from '@/components/notes/notes-manager'
import TaskBoard from '@/components/tasks/task-board'
import AIChatbot from '@/components/chat/ai-chatbot'
import AttendanceTracker from '@/components/attendance/attendance-tracker'
import AssignmentManager from '@/components/assignments/assignment-manager'
import SettingsPanel from '@/components/profile/settings-panel'

interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
}

// Page transition variants
const pageVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.98
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
}

// Staggered animation for dashboard cards
const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const cardVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [activeView, setActiveView] = useState('dashboard')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isChatMinimized, setIsChatMinimized] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Apply dark mode to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
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
    
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300))
    
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
      <AuthManager
        onAuthenticated={handleAuthentication}
        onLogout={handleLogout}
        initialAuthState="login"
      />
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
              className="p-6 space-y-6"
              variants={containerVariants}
              initial="initial"
              animate="animate"
            >
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Welcome back, {user?.firstName}! 👋
                  </h1>
                  <p className="text-muted-foreground mb-6">
                    Here's an overview of your academic progress and upcoming tasks.
                  </p>
                </motion.div>
                
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                  variants={containerVariants}
                >
                  {/* Quick Stats Cards with enhanced animations */}
                  <motion.div 
                    className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    variants={cardVariants}
                    whileHover={{ 
                      scale: 1.02,
                      y: -2,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigation('assignments')}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        Assignments Due
                      </h3>
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3
                        }}
                      >
                        📚
                      </motion.div>
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2">5</div>
                    <p className="text-sm text-muted-foreground">2 due this week</p>
                    <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: '60%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    variants={cardVariants}
                    whileHover={{ 
                      scale: 1.02,
                      y: -2,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigation('attendance')}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        Attendance Rate
                      </h3>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 2
                        }}
                      >
                        ✅
                      </motion.div>
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
                    <p className="text-sm text-muted-foreground">Above average</p>
                    <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-green-500"
                        initial={{ width: 0 }}
                        animate={{ width: '92%' }}
                        transition={{ duration: 1, delay: 0.7 }}
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    variants={cardVariants}
                    whileHover={{ 
                      scale: 1.02,
                      y: -2,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigation('tasks')}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        Active Tasks
                      </h3>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        ⚡
                      </motion.div>
                    </div>
                    <div className="text-3xl font-bold text-orange-600 mb-2">8</div>
                    <p className="text-sm text-muted-foreground">3 in progress</p>
                    <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: '75%' }}
                        transition={{ duration: 1, delay: 0.9 }}
                      />
                    </div>
                  </motion.div>
                </motion.div>
                
                {/* Recent Activity with smooth animations */}
                <motion.div 
                  className="bg-card border border-border rounded-lg p-6"
                  variants={cardVariants}
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
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
                        color: 'bg-green-500', 
                        text: 'Attended lecture: Advanced Algorithms', 
                        time: '1 day ago',
                        icon: '📖'
                      },
                      { 
                        color: 'bg-orange-500', 
                        text: 'Created new note: Machine Learning Concepts', 
                        time: '2 days ago',
                        icon: '📝'
                      }
                    ].map((activity, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-3 text-sm p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
                        variants={cardVariants}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div 
                          className={`w-2 h-2 ${activity.color} rounded-full`}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.5
                          }}
                        />
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors flex-1">
                          {activity.text}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {activity.time}
                        </span>
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.2 + 1 }}
                        >
                          {activity.icon}
                        </motion.span>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
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
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-background`}>
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
      
      {/* Main content with top padding for fixed navigation */}
      <main className="pt-16">
        {renderMainContent()}
      </main>
      
      {/* Floating AI Chat Widget */}
      {activeView !== 'ai-chat' && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
        >
          <AIChatbot
            mode="widget"
            isMinimized={isChatMinimized}
            onToggleMinimize={handleToggleChat}
          />
        </motion.div>
      )}
    </div>
  )
}
