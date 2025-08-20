"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  LayoutGrid,
  FileText,
  CheckSquare,
  BookOpen,
  Calendar,
  MessageCircle,
  User,
  Menu,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

interface NavigationItem {
  id: string
  label: string
  icon: React.ElementType
  href: string
  badge?: number
  active?: boolean
}

interface SidebarNavigationProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  activeItem?: string
  onNavigate?: (id: string) => void
  isDarkMode?: boolean
  onToggleTheme?: () => void
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutGrid,
    href: "/dashboard",
  },
  {
    id: "notes",
    label: "Notes",
    icon: FileText,
    href: "/notes",
    badge: 3,
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: CheckSquare,
    href: "/tasks",
    badge: 5,
  },
  {
    id: "assignments",
    label: "Assignments",
    icon: BookOpen,
    href: "/assignments",
    badge: 2,
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: Calendar,
    href: "/attendance",
  },
  {
    id: "ai-chat",
    label: "AI Chat",
    icon: MessageCircle,
    href: "/ai-chat",
    badge: 1,
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
    href: "/profile",
  },
]

export default function SidebarNavigation({
  isCollapsed = false,
  onToggleCollapse,
  activeItem = "dashboard",
  onNavigate,
  isDarkMode = false,
  onToggleTheme,
  user = {
    name: "John Doe",
    email: "john.doe@college.edu",
  },
}: SidebarNavigationProps) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  const handleNavigate = (id: string) => {
    onNavigate?.(id)
    setIsMobileOpen(false)
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn(
      "flex h-full flex-col bg-surface dark:bg-card",
      mobile ? "w-full" : isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo/Brand Section */}
      <div className={cn(
        "flex items-center border-b border-border px-4 py-6",
        isCollapsed && !mobile ? "justify-center px-2" : "justify-start"
      )}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <LayoutGrid className="h-5 w-5" />
        </div>
        <AnimatePresence>
          {(!isCollapsed || mobile) && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-3 overflow-hidden"
            >
              <h2 className="font-display text-lg font-semibold text-foreground">
                College App
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 p-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "relative w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                isCollapsed && !mobile ? "justify-center px-2" : "justify-start"
              )}
              onClick={() => handleNavigate(item.id)}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <Icon className={cn(
                "h-5 w-5 shrink-0",
                isActive ? "text-primary" : "text-current"
              )} />
              
              <AnimatePresence>
                {(!isCollapsed || mobile) && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              
              {item.badge && (!isCollapsed || mobile) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="ml-auto"
                >
                  <Badge variant="secondary" className="h-5 min-w-5 text-xs">
                    {item.badge}
                  </Badge>
                </motion.div>
              )}
              
              {item.badge && isCollapsed && !mobile && (
                <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary">
                  <div className="absolute inset-0 rounded-full bg-primary animate-pulse" />
                </div>
              )}
            </Button>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border p-2 space-y-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-start gap-3 px-3 py-2.5",
            isCollapsed && !mobile ? "justify-center px-2" : "justify-start"
          )}
          onClick={onToggleTheme}
        >
          {isDarkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          
          <AnimatePresence>
            {(!isCollapsed || mobile) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap text-sm"
              >
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>

        {/* User Profile */}
        <div className={cn(
          "flex items-center gap-3 rounded-lg border border-border bg-card p-3",
          isCollapsed && !mobile ? "justify-center p-2" : "justify-start"
        )}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            {user.name.charAt(0)}
          </div>
          
          <AnimatePresence>
            {(!isCollapsed || mobile) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="min-w-0 flex-1 overflow-hidden"
              >
                <p className="truncate text-sm font-medium text-foreground">
                  {user.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 64 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex h-screen border-r border-border bg-surface dark:bg-card"
      >
        <div className="relative flex-1">
          <SidebarContent />
          
          {/* Collapse Toggle */}
          {onToggleCollapse && (
            <Button
              variant="outline"
              size="sm"
              className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-background p-0 shadow-md hover:bg-accent"
              onClick={onToggleCollapse}
            >
              {isCollapsed ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronLeft className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </motion.aside>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="fixed left-4 top-4 z-50 h-10 w-10 p-0 shadow-lg"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent mobile />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}