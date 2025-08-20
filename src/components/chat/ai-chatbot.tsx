"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Send, 
  Copy, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2, 
  MoreVertical,
  Check,
  Clock,
  MessageCircle
} from 'lucide-react'

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
}

interface QuickAction {
  id: string
  label: string
  action: string
}

interface AIChatbotProps {
  mode?: 'widget' | 'fullscreen'
  isMinimized?: boolean
  onToggleMinimize?: () => void
  onClose?: () => void
  className?: string
}

const quickActions: QuickAction[] = [
  { id: '1', label: 'Help with assignments', action: 'Can you help me with my assignments?' },
  { id: '2', label: 'Study schedule', action: 'Create a study schedule for me' },
  { id: '3', label: 'Exam preparation', action: 'How should I prepare for my upcoming exams?' },
  { id: '4', label: 'Time management', action: 'Give me tips for better time management' }
]

export default function AIChatbot({ 
  mode = 'widget', 
  isMinimized = false, 
  onToggleMinimize,
  onClose,
  className = ''
}: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your AI study assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
      status: 'sent'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string = inputValue) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're asking about "${content.trim()}". Let me help you with that. Here's some information that might be useful for your studies.`,
        sender: 'bot',
        timestamp: new Date(),
        status: 'sent'
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickAction = (action: string) => {
    handleSendMessage(action)
  }

  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error('Failed to copy message:', err)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={onToggleMinimize}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </motion.div>
    )
  }

  const containerClasses = mode === 'widget' 
    ? `fixed bottom-4 right-4 w-96 h-[600px] z-50 ${className}`
    : `w-full h-full ${className}`

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 20 }}
      className={containerClasses}
    >
      <Card className="h-full flex flex-col bg-surface border-border shadow-lg">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b bg-card">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
              <AvatarFallback className="bg-primary text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-display font-semibold text-sm">AI Study Assistant</h3>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {mode === 'widget' && onToggleMinimize && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleMinimize}
                className="h-8 w-8 p-0"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Messages Area */}
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea ref={scrollAreaRef} className="h-full px-4 pt-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <Avatar className="h-6 w-6 mt-1">
                      {message.sender === 'bot' ? (
                        <>
                          <AvatarImage src="/ai-avatar.png" alt="AI" />
                          <AvatarFallback className="bg-primary text-white">
                            <Bot className="h-3 w-3" />
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src="/user-avatar.png" alt="User" />
                          <AvatarFallback className="bg-secondary text-white">
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    
                    <div className="space-y-1">
                      <div className={`group relative rounded-lg px-3 py-2 text-sm ${
                        message.sender === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-muted text-foreground border'
                      }`}>
                        {message.content}
                        
                        {message.sender === 'bot' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyMessage(message.id, message.content)}
                            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 bg-background border shadow-sm"
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="h-3 w-3 text-success" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                      
                      <div className={`flex items-center space-x-1 text-xs text-muted-foreground ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}>
                        <span>{formatTime(message.timestamp)}</span>
                        {message.sender === 'user' && message.status && (
                          <>
                            {message.status === 'sending' && <Clock className="h-3 w-3" />}
                            {message.status === 'sent' && <Check className="h-3 w-3 text-success" />}
                            {message.status === 'error' && <span className="text-error">!</span>}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-2">
                      <Avatar className="h-6 w-6 mt-1">
                        <AvatarImage src="/ai-avatar.png" alt="AI" />
                        <AvatarFallback className="bg-primary text-white">
                          <Bot className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted border rounded-lg px-3 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </CardContent>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="px-4 py-2 border-t bg-muted/30">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Quick actions:</p>
              <div className="flex flex-wrap gap-1">
                {quickActions.map((action) => (
                  <Badge
                    key={action.id}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 text-xs px-2 py-1"
                    onClick={() => handleQuickAction(action.action)}
                  >
                    {action.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <CardFooter className="p-4 border-t bg-card">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex w-full space-x-2"
          >
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-background"
              disabled={isTyping}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!inputValue.trim() || isTyping}
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </motion.div>
  )
}