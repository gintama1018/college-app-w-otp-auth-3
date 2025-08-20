"use client"

import React, { useState, useMemo } from 'react'
import { format, isAfter, isBefore, parseISO, differenceInDays } from 'date-fns'
import { 
  Calendar, 
  Clock, 
  FileText, 
  Filter, 
  Grid3X3, 
  List, 
  MoreHorizontal, 
  Search, 
  SortAsc, 
  SortDesc, 
  AlertCircle, 
  CheckCircle2, 
  Clock3, 
  Upload, 
  Download, 
  Eye,
  ChevronDown,
  X
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Assignment {
  id: string
  title: string
  subject: string
  description: string
  dueDate: string
  status: 'pending' | 'submitted' | 'graded'
  priority: 'low' | 'medium' | 'high'
  grade?: string
  submissionDate?: string
  attachments?: {
    name: string
    size: string
    type: string
  }[]
  requirements?: string[]
  submissionType: 'file' | 'text' | 'link'
  maxPoints: number
  earnedPoints?: number
}

interface AssignmentManagerProps {
  assignments?: Assignment[]
  onAssignmentClick?: (assignment: Assignment) => void
  onStatusChange?: (assignmentId: string, status: Assignment['status']) => void
  onSubmitAssignment?: (assignmentId: string, submission: any) => void
  className?: string
}

const defaultAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Research Paper: Climate Change Impact',
    subject: 'Environmental Science',
    description: 'Write a comprehensive research paper analyzing the impact of climate change on coastal ecosystems. The paper should be 15-20 pages long and include at least 15 peer-reviewed sources.',
    dueDate: '2024-12-25T23:59:59',
    status: 'pending',
    priority: 'high',
    submissionType: 'file',
    maxPoints: 100,
    requirements: [
      '15-20 pages in length',
      'Minimum 15 peer-reviewed sources',
      'APA citation format',
      'Include abstract and conclusion',
      'Original research preferred'
    ],
    attachments: [
      { name: 'assignment-guidelines.pdf', size: '2.4 MB', type: 'pdf' },
      { name: 'research-template.docx', size: '156 KB', type: 'docx' }
    ]
  },
  {
    id: '2',
    title: 'Calculus Problem Set 7',
    subject: 'Mathematics',
    description: 'Complete problems 1-25 from Chapter 7: Integration by Parts. Show all work and provide detailed explanations for each step.',
    dueDate: '2024-12-20T17:00:00',
    status: 'submitted',
    priority: 'medium',
    submissionDate: '2024-12-19T15:30:00',
    submissionType: 'file',
    maxPoints: 50,
    earnedPoints: 45,
    grade: 'A-',
    requirements: [
      'Complete all 25 problems',
      'Show detailed work',
      'Explain each integration step',
      'Submit as PDF format'
    ]
  },
  {
    id: '3',
    title: 'Spanish Conversation Video',
    subject: 'Spanish Language',
    description: 'Record a 5-minute conversation video demonstrating intermediate Spanish proficiency. Include topics about daily routines, hobbies, and future plans.',
    dueDate: '2024-12-18T12:00:00',
    status: 'graded',
    priority: 'low',
    submissionDate: '2024-12-16T10:15:00',
    submissionType: 'link',
    maxPoints: 75,
    earnedPoints: 68,
    grade: 'B+',
    requirements: [
      '5 minutes minimum length',
      'Clear pronunciation',
      'Use intermediate vocabulary',
      'Cover all required topics',
      'Submit as video link'
    ]
  },
  {
    id: '4',
    title: 'Database Design Project',
    subject: 'Computer Science',
    description: 'Design and implement a relational database system for a library management system. Include ER diagrams, normalization, and SQL queries.',
    dueDate: '2024-12-15T23:59:59',
    status: 'pending',
    priority: 'high',
    submissionType: 'file',
    maxPoints: 120,
    requirements: [
      'Complete ER diagram',
      'Database normalization (3NF)',
      'SQL schema creation',
      'Sample data insertion',
      'Query examples',
      'Documentation report'
    ],
    attachments: [
      { name: 'project-specifications.pdf', size: '1.8 MB', type: 'pdf' }
    ]
  },
  {
    id: '5',
    title: 'Literature Analysis Essay',
    subject: 'English Literature',
    description: 'Analyze the themes of isolation and connection in modern literature. Compare at least three works from the reading list.',
    dueDate: '2024-12-28T11:59:59',
    status: 'pending',
    priority: 'medium',
    submissionType: 'text',
    maxPoints: 85,
    requirements: [
      '1500-2000 words',
      'Compare 3+ literary works',
      'MLA citation format',
      'Thesis-driven analysis',
      'Academic tone and style'
    ]
  }
]

const AssignmentManager: React.FC<AssignmentManagerProps> = ({
  assignments = defaultAssignments,
  onAssignmentClick,
  onStatusChange,
  onSubmitAssignment,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'dueDate' | 'title' | 'subject' | 'priority'>('dueDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)

  const subjects = useMemo(() => {
    const uniqueSubjects = Array.from(new Set(assignments.map(a => a.subject)))
    return uniqueSubjects
  }, [assignments])

  const filteredAndSortedAssignments = useMemo(() => {
    let filtered = assignments.filter(assignment => {
      const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          assignment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesSubject = selectedSubject === 'all' || assignment.subject === selectedSubject
      const matchesStatus = selectedStatus === 'all' || assignment.status === selectedStatus
      const matchesPriority = selectedPriority === 'all' || assignment.priority === selectedPriority

      return matchesSearch && matchesSubject && matchesStatus && matchesPriority
    })

    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'subject':
          comparison = a.subject.localeCompare(b.subject)
          break
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [assignments, searchTerm, selectedSubject, selectedStatus, selectedPriority, sortBy, sortOrder])

  const getStatusIcon = (status: Assignment['status']) => {
    switch (status) {
      case 'pending':
        return <Clock3 className="h-4 w-4" />
      case 'submitted':
        return <Upload className="h-4 w-4" />
      case 'graded':
        return <CheckCircle2 className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20'
      case 'submitted':
        return 'bg-primary/10 text-primary border-primary/20'
      case 'graded':
        return 'bg-success/10 text-success border-success/20'
    }
  }

  const getPriorityColor = (priority: Assignment['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-error/10 text-error border-error/20'
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20'
      case 'low':
        return 'bg-success/10 text-success border-success/20'
    }
  }

  const getDueDateStatus = (dueDate: string, status: Assignment['status']) => {
    if (status === 'graded') return 'completed'
    
    const now = new Date()
    const due = parseISO(dueDate)
    const daysUntilDue = differenceInDays(due, now)
    
    if (isBefore(due, now)) return 'overdue'
    if (daysUntilDue <= 1) return 'urgent'
    if (daysUntilDue <= 3) return 'upcoming'
    return 'normal'
  }

  const getDueDateColor = (dueDate: string, status: Assignment['status']) => {
    const dueDateStatus = getDueDateStatus(dueDate, status)
    
    switch (dueDateStatus) {
      case 'overdue':
        return 'text-error'
      case 'urgent':
        return 'text-warning'
      case 'upcoming':
        return 'text-primary'
      case 'completed':
        return 'text-success'
      default:
        return 'text-muted-foreground'
    }
  }

  const formatDueDate = (dueDate: string) => {
    const date = parseISO(dueDate)
    return format(date, 'MMM dd, yyyy \'at\' h:mm a')
  }

  const getCompletionPercentage = () => {
    const completedCount = assignments.filter(a => a.status === 'graded').length
    return Math.round((completedCount / assignments.length) * 100)
  }

  const AssignmentCard = ({ assignment }: { assignment: Assignment }) => (
    <Card 
      className="group hover:shadow-md transition-all duration-200 cursor-pointer bg-surface border border-border"
      onClick={() => {
        setSelectedAssignment(assignment)
        onAssignmentClick?.(assignment)
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {assignment.title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {assignment.subject}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                setSelectedAssignment(assignment)
              }}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {assignment.status === 'pending' && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  onStatusChange?.(assignment.id, 'submitted')
                }}>
                  <Upload className="h-4 w-4 mr-2" />
                  Mark as Submitted
                </DropdownMenuItem>
              )}
              {assignment.attachments && assignment.attachments.length > 0 && (
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Files
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {assignment.description}
        </p>
        
        <div className="flex flex-wrap items-center gap-2">
          <Badge 
            variant="outline" 
            className={`text-xs ${getStatusColor(assignment.status)}`}
          >
            {getStatusIcon(assignment.status)}
            <span className="ml-1 capitalize">{assignment.status}</span>
          </Badge>
          
          <Badge 
            variant="outline" 
            className={`text-xs ${getPriorityColor(assignment.priority)}`}
          >
            <span className="capitalize">{assignment.priority} Priority</span>
          </Badge>
          
          {assignment.grade && (
            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
              {assignment.grade}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={getDueDateColor(assignment.dueDate, assignment.status)}>
              Due {formatDueDate(assignment.dueDate)}
            </span>
          </div>
          
          {getDueDateStatus(assignment.dueDate, assignment.status) === 'overdue' && assignment.status === 'pending' && (
            <div className="flex items-center gap-1 text-error">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Overdue</span>
            </div>
          )}
        </div>
        
        {assignment.earnedPoints !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Score</span>
              <span>{assignment.earnedPoints}/{assignment.maxPoints} pts</span>
            </div>
            <Progress 
              value={(assignment.earnedPoints / assignment.maxPoints) * 100} 
              className="h-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )

  const AssignmentListItem = ({ assignment }: { assignment: Assignment }) => (
    <div 
      className="group flex items-center gap-4 p-4 border border-border rounded-lg bg-surface hover:bg-accent/50 cursor-pointer transition-all duration-200"
      onClick={() => {
        setSelectedAssignment(assignment)
        onAssignmentClick?.(assignment)
      }}
    >
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {assignment.title}
          </h3>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${getStatusColor(assignment.status)}`}
            >
              {getStatusIcon(assignment.status)}
              <span className="ml-1 capitalize">{assignment.status}</span>
            </Badge>
            
            <Badge 
              variant="outline" 
              className={`text-xs ${getPriorityColor(assignment.priority)}`}
            >
              <span className="capitalize">{assignment.priority}</span>
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{assignment.subject}</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className={getDueDateColor(assignment.dueDate, assignment.status)}>
              {formatDueDate(assignment.dueDate)}
            </span>
          </div>
          
          {assignment.grade && (
            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
              {assignment.grade}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {getDueDateStatus(assignment.dueDate, assignment.status) === 'overdue' && assignment.status === 'pending' && (
          <div className="flex items-center gap-1 text-error">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Overdue</span>
          </div>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation()
              setSelectedAssignment(assignment)
            }}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            {assignment.status === 'pending' && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                onStatusChange?.(assignment.id, 'submitted')
              }}>
                <Upload className="h-4 w-4 mr-2" />
                Mark as Submitted
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <div className={`space-y-6 bg-background ${className}`}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-display">Assignment Manager</h1>
            <p className="text-muted-foreground">
              Track your assignments, deadlines, and submission status
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="bg-surface border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{getCompletionPercentage()}% Complete</span>
            </div>
            <Progress value={getCompletionPercentage()} className="h-2" />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{assignments.filter(a => a.status === 'graded').length} completed</span>
              <span>{assignments.filter(a => a.status === 'pending').length} pending</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-surface"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[160px] bg-surface">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[140px] bg-surface">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-[140px] bg-surface">
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-surface">
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(['dueDate', 'title', 'subject', 'priority'] as const).map(option => (
                <DropdownMenuItem 
                  key={option}
                  onClick={() => {
                    if (sortBy === option) {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    } else {
                      setSortBy(option)
                      setSortOrder('asc')
                    }
                  }}
                >
                  {option === 'dueDate' ? 'Due Date' : 
                   option === 'title' ? 'Title' :
                   option === 'subject' ? 'Subject' : 'Priority'}
                  {sortBy === option && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {(searchTerm || selectedSubject !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all') && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSearchTerm('')
                setSelectedSubject('all')
                setSelectedStatus('all')
                setSelectedPriority('all')
              }}
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Assignments List/Grid */}
      <div className="space-y-4">
        {filteredAndSortedAssignments.length === 0 ? (
          <Card className="bg-surface border border-border">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No assignments found</h3>
              <p className="text-muted-foreground max-w-sm">
                No assignments match your current filters. Try adjusting your search criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedAssignments.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAndSortedAssignments.map((assignment) => (
                  <AssignmentListItem key={assignment.id} assignment={assignment} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Assignment Details Modal */}
      <Dialog open={!!selectedAssignment} onOpenChange={(open) => !open && setSelectedAssignment(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-surface">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground font-display">
              {selectedAssignment?.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedAssignment?.subject}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAssignment && (
            <ScrollArea className="max-h-[calc(90vh-120px)]">
              <div className="space-y-6 pr-4">
                {/* Status and Priority */}
                <div className="flex flex-wrap items-center gap-3">
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(selectedAssignment.status)}`}
                  >
                    {getStatusIcon(selectedAssignment.status)}
                    <span className="ml-2 capitalize">{selectedAssignment.status}</span>
                  </Badge>
                  
                  <Badge 
                    variant="outline" 
                    className={`${getPriorityColor(selectedAssignment.priority)}`}
                  >
                    <span className="capitalize">{selectedAssignment.priority} Priority</span>
                  </Badge>
                  
                  {selectedAssignment.grade && (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      Grade: {selectedAssignment.grade}
                    </Badge>
                  )}
                </div>

                {/* Due Date and Score */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-background border border-border">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Due Date</span>
                      </div>
                      <p className={`text-sm ${getDueDateColor(selectedAssignment.dueDate, selectedAssignment.status)}`}>
                        {formatDueDate(selectedAssignment.dueDate)}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-background border border-border">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Points</span>
                      </div>
                      <p className="text-sm text-foreground">
                        {selectedAssignment.earnedPoints !== undefined 
                          ? `${selectedAssignment.earnedPoints}/${selectedAssignment.maxPoints} pts`
                          : `${selectedAssignment.maxPoints} pts total`
                        }
                      </p>
                      {selectedAssignment.earnedPoints !== undefined && (
                        <Progress 
                          value={(selectedAssignment.earnedPoints / selectedAssignment.maxPoints) * 100} 
                          className="h-2 mt-2"
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 font-display">Description</h3>
                  <Card className="bg-background border border-border">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedAssignment.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Requirements */}
                {selectedAssignment.requirements && selectedAssignment.requirements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 font-display">Requirements</h3>
                    <Card className="bg-background border border-border">
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          {selectedAssignment.requirements.map((requirement, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                              {requirement}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Attachments */}
                {selectedAssignment.attachments && selectedAssignment.attachments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 font-display">Attachments</h3>
                    <Card className="bg-background border border-border">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          {selectedAssignment.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg bg-surface">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium text-foreground">{attachment.name}</p>
                                  <p className="text-xs text-muted-foreground">{attachment.size}</p>
                                </div>
                              </div>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Submission Info */}
                {selectedAssignment.submissionDate && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 font-display">Submission Details</h3>
                    <Card className="bg-background border border-border">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Upload className="h-4 w-4" />
                          <span>Submitted on {format(parseISO(selectedAssignment.submissionDate), 'MMM dd, yyyy \'at\' h:mm a')}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedAssignment.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <Button 
                      onClick={() => {
                        onSubmitAssignment?.(selectedAssignment.id, {})
                        setSelectedAssignment(null)
                      }}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Assignment
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        onStatusChange?.(selectedAssignment.id, 'submitted')
                        setSelectedAssignment(null)
                      }}
                    >
                      Mark as Submitted
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AssignmentManager