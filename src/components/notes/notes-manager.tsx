"use client"

import { useState, useEffect, useRef } from 'react'
import { Search, Plus, Star, MoreVertical, Bold, Italic, Underline, List, ListOrdered, Quote, ChevronLeft, Menu, Save, Clock, Edit3, Trash2, Filter, SortAsc, FolderPlus, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'motion/react'

interface Note {
  id: string
  title: string
  content: string
  category: string
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

interface Category {
  id: string
  name: string
  color: string
  count: number
}

const NotesManager = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Data Structures Study Guide',
      content: 'Arrays, Linked Lists, Stacks, Queues, Trees, Graphs...\n\nArrays are fundamental data structures that store elements in contiguous memory locations. They provide O(1) random access but O(n) insertion and deletion in the worst case.',
      category: 'Computer Science',
      isFavorite: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-16'),
      tags: ['algorithms', 'data-structures', 'programming']
    },
    {
      id: '2',
      title: 'Calculus Integration Techniques',
      content: 'Integration by parts, substitution, partial fractions...\n\nIntegration by parts: ∫u dv = uv - ∫v du\n\nThis is particularly useful when dealing with products of functions.',
      category: 'Mathematics',
      isFavorite: false,
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-15'),
      tags: ['calculus', 'integration', 'mathematics']
    },
    {
      id: '3',
      title: 'Essay Planning: Climate Change',
      content: 'Introduction: Hook about rising sea levels\nBody paragraphs:\n1. Causes of climate change\n2. Current effects\n3. Future implications\n4. Solutions and mitigation\n\nConclusion: Call to action',
      category: 'Essays',
      isFavorite: false,
      createdAt: new Date('2024-01-13'),
      updatedAt: new Date('2024-01-14'),
      tags: ['essay', 'climate-change', 'environment']
    }
  ])

  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Computer Science', color: '#3b82f6', count: 5 },
    { id: '2', name: 'Mathematics', color: '#10b981', count: 3 },
    { id: '3', name: 'Essays', color: '#f59e0b', count: 2 },
    { id: '4', name: 'General', color: '#8b5cf6', count: 1 }
  ])

  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [metadataPanelOpen, setMetadataPanelOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [autoSaving, setAutoSaving] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDialog, setNewCategoryDialog] = useState(false)
  
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()

  // Filter and sort notes
  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime()
        case 'updated':
        default:
          return b.updatedAt.getTime() - a.updatedAt.getTime()
      }
    })

  // Auto-save functionality
  useEffect(() => {
    if (isEditing && selectedNote && (editTitle !== selectedNote.title || editContent !== selectedNote.content)) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
      
      setAutoSaving(true)
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleSave()
        setAutoSaving(false)
      }, 2000)
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [editTitle, editContent, isEditing, selectedNote])

  // Initialize edit state when selecting a note
  useEffect(() => {
    if (selectedNote && !isEditing) {
      setEditTitle(selectedNote.title)
      setEditContent(selectedNote.content)
    }
  }, [selectedNote, isEditing])

  const handleSave = () => {
    if (!selectedNote) return

    const updatedNote = {
      ...selectedNote,
      title: editTitle || 'Untitled Note',
      content: editContent,
      updatedAt: new Date()
    }

    setNotes(prev => prev.map(note => 
      note.id === selectedNote.id ? updatedNote : note
    ))
    setSelectedNote(updatedNote)
  }

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      category: selectedCategory === 'all' ? 'General' : selectedCategory,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: []
    }

    setNotes(prev => [newNote, ...prev])
    setSelectedNote(newNote)
    setIsEditing(true)
    setEditTitle(newNote.title)
    setEditContent(newNote.content)
  }

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId))
    if (selectedNote?.id === noteId) {
      const remainingNotes = notes.filter(note => note.id !== noteId)
      setSelectedNote(remainingNotes[0] || null)
    }
  }

  const handleToggleFavorite = (noteId: string) => {
    setNotes(prev => prev.map(note =>
      note.id === noteId ? { ...note, isFavorite: !note.isFavorite } : note
    ))
    if (selectedNote?.id === noteId) {
      setSelectedNote(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null)
    }
  }

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      color: '#6366f1',
      count: 0
    }

    setCategories(prev => [...prev, newCategory])
    setNewCategoryName('')
    setNewCategoryDialog(false)
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    
    return date.toLocaleDateString()
  }

  const applyFormatting = (format: string) => {
    if (!editorRef.current) return

    const textarea = editorRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = editContent.substring(start, end)

    let formattedText = ''
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`
        break
      case 'italic':
        formattedText = `*${selectedText}*`
        break
      case 'underline':
        formattedText = `<u>${selectedText}</u>`
        break
      case 'quote':
        formattedText = `> ${selectedText}`
        break
      default:
        return
    }

    const newContent = editContent.substring(0, start) + formattedText + editContent.substring(end)
    setEditContent(newContent)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-80 bg-surface border-r border-border flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-semibold text-foreground">Notes</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateNote}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            {/* Filters and Sort */}
            <div className="p-4 space-y-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name} ({category.count})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <SortAsc className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(value: 'updated' | 'created' | 'title') => setSortBy(value)}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">Last Modified</SelectItem>
                    <SelectItem value="created">Date Created</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={newCategoryDialog} onOpenChange={setNewCategoryDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full h-8 text-sm">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="categoryName">Category Name</Label>
                      <Input
                        id="categoryName"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Enter category name"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setNewCategoryDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateCategory}>
                        Create Category
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-2 space-y-1">
                {filteredNotes.map(note => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-md cursor-pointer transition-colors border ${
                      selectedNote?.id === note.id 
                        ? 'bg-primary/10 border-primary/20' 
                        : 'bg-card border-transparent hover:bg-accent'
                    }`}
                    onClick={() => {
                      setSelectedNote(note)
                      setIsEditing(false)
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm truncate flex-1">{note.title}</h3>
                      <div className="flex items-center gap-1 ml-2">
                        {note.isFavorite && (
                          <Star className="h-3 w-3 text-warning fill-current" />
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              handleToggleFavorite(note.id)
                            }}>
                              <Star className="h-4 w-4 mr-2" />
                              {note.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteNote(note.id)
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Note
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {note.content || 'No content'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Folder className="h-3 w-3" />
                        <span>{note.category}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {formatDate(note.updatedAt)}
                      </span>
                    </div>
                    
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                            {tag}
                          </Badge>
                        ))}
                        {note.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            +{note.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8 p-0"
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            
            {selectedNote && (
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-display font-semibold truncate">
                  {isEditing ? editTitle || 'Untitled Note' : selectedNote.title}
                </h1>
                {autoSaving && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Save className="h-3 w-3 animate-pulse" />
                    <span>Saving...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedNote && (
            <div className="flex items-center gap-2">
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (isEditing) {
                    handleSave()
                  }
                  setIsEditing(!isEditing)
                }}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {isEditing ? 'Save' : 'Edit'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMetadataPanelOpen(!metadataPanelOpen)}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            {selectedNote ? (
              <>
                {isEditing && (
                  <div className="border-b border-border p-2 flex items-center gap-1 bg-surface">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => applyFormatting('bold')}
                      className="h-8 w-8 p-0"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => applyFormatting('italic')}
                      className="h-8 w-8 p-0"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => applyFormatting('underline')}
                      className="h-8 w-8 p-0"
                    >
                      <Underline className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => applyFormatting('quote')}
                      className="h-8 w-8 p-0"
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="flex-1 p-6">
                  {isEditing ? (
                    <div className="h-full space-y-4">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Note title..."
                        className="text-xl font-display font-semibold border-none shadow-none px-0 focus-visible:ring-0"
                      />
                      <Textarea
                        ref={editorRef}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Start writing your note..."
                        className="flex-1 resize-none border-none shadow-none px-0 focus-visible:ring-0 font-body"
                        style={{ minHeight: 'calc(100vh - 280px)' }}
                      />
                    </div>
                  ) : (
                    <div className="h-full">
                      <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap font-body text-foreground leading-relaxed">
                          {selectedNote.content || 'This note is empty. Click Edit to start writing.'}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Edit3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No note selected</h3>
                  <p className="text-sm">Choose a note from the sidebar or create a new one</p>
                </div>
              </div>
            )}
          </div>

          {/* Metadata Panel */}
          <AnimatePresence>
            {metadataPanelOpen && selectedNote && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-64 border-l border-border bg-surface"
              >
                <div className="p-4">
                  <h3 className="font-display font-semibold mb-4">Note Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedNote.category}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Created</Label>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {selectedNote.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Last Modified</Label>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {formatDate(selectedNote.updatedAt)}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Tags</Label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedNote.tags.length > 0 ? (
                          selectedNote.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">No tags</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Word Count</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedNote.content.split(/\s+/).filter(word => word.length > 0).length} words
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default NotesManager