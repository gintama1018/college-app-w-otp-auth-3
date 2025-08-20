"use client"

import React, { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List,
  Calendar,
  User,
  AlertCircle,
  Clock,
  CheckCircle2,
  Circle,
  MoreHorizontal
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  priority: "high" | "medium" | "low"
  assignee: string
  labels: string[]
  status: "todo" | "inprogress" | "completed"
}

interface Column {
  id: string
  title: string
  status: "todo" | "inprogress" | "completed"
  color: string
  icon: React.ReactNode
  tasks: Task[]
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Design System Documentation",
    description: "Create comprehensive documentation for the design system components",
    dueDate: "2024-01-15",
    priority: "high",
    assignee: "John Doe",
    labels: ["design", "documentation"],
    status: "todo"
  },
  {
    id: "2",
    title: "User Authentication Flow",
    description: "Implement secure user authentication with JWT tokens",
    dueDate: "2024-01-20",
    priority: "high",
    assignee: "Jane Smith",
    labels: ["backend", "security"],
    status: "inprogress"
  },
  {
    id: "3",
    title: "Mobile Responsive Testing",
    description: "Test and fix responsive design issues across different devices",
    dueDate: "2024-01-10",
    priority: "medium",
    assignee: "Mike Johnson",
    labels: ["frontend", "testing"],
    status: "completed"
  },
  {
    id: "4",
    title: "API Integration",
    description: "Integrate third-party APIs for enhanced functionality",
    dueDate: "2024-01-25",
    priority: "medium",
    assignee: "Sarah Wilson",
    labels: ["backend", "integration"],
    status: "todo"
  },
  {
    id: "5",
    title: "Performance Optimization",
    description: "Optimize application performance and loading times",
    dueDate: "2024-01-18",
    priority: "low",
    assignee: "Tom Brown",
    labels: ["optimization", "performance"],
    status: "inprogress"
  }
]

const initialColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    status: "todo",
    color: "text-muted-foreground",
    icon: <Circle className="h-4 w-4" />,
    tasks: []
  },
  {
    id: "inprogress",
    title: "In Progress",
    status: "inprogress",
    color: "text-warning",
    icon: <Clock className="h-4 w-4" />,
    tasks: []
  },
  {
    id: "completed",
    title: "Completed",
    status: "completed",
    color: "text-success",
    icon: <CheckCircle2 className="h-4 w-4" />,
    tasks: []
  }
]

const priorityColors = {
  high: "bg-error text-white",
  medium: "bg-warning text-white", 
  low: "bg-muted text-muted-foreground"
}

const priorityIcons = {
  high: <AlertCircle className="h-3 w-3" />,
  medium: <Clock className="h-3 w-3" />,
  low: <Circle className="h-3 w-3" />
}

export default function TaskBoard() {
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [viewMode, setViewMode] = useState<"board" | "list">("board")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [filterAssignee, setFilterAssignee] = useState<string>("all")
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize columns with tasks
  useEffect(() => {
    const columnsWithTasks = initialColumns.map(column => ({
      ...column,
      tasks: initialTasks.filter(task => task.status === column.status)
    }))
    setColumns(columnsWithTasks)
    
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const handleDragStart = (result: any) => {
    setDraggedTask(result.draggableId)
  }

  const handleDragEnd = (result: DropResult) => {
    setDraggedTask(null)
    
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId)
    const destColumn = columns.find(col => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    const draggedTask = sourceColumn.tasks[source.index]
    const updatedTask = { ...draggedTask, status: destColumn.status }

    const newColumns = columns.map(column => {
      if (column.id === source.droppableId) {
        const newTasks = [...column.tasks]
        newTasks.splice(source.index, 1)
        return { ...column, tasks: newTasks }
      }
      
      if (column.id === destination.droppableId) {
        const newTasks = [...column.tasks]
        newTasks.splice(destination.index, 0, updatedTask)
        return { ...column, tasks: newTasks }
      }
      
      return column
    })

    setColumns(newColumns)
  }

  const addNewTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString()
    }

    const newColumns = columns.map(column => {
      if (column.status === newTask.status) {
        return { ...column, tasks: [...column.tasks, newTask] }
      }
      return column
    })

    setColumns(newColumns)
    setIsAddTaskOpen(false)
  }

  const filteredColumns = columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPriority = filterPriority === "all" || task.priority === filterPriority
      const matchesAssignee = filterAssignee === "all" || task.assignee === filterAssignee
      
      return matchesSearch && matchesPriority && matchesAssignee
    })
  }))

  const allAssignees = Array.from(new Set(
    columns.flatMap(col => col.tasks.map(task => task.assignee))
  ))

  if (isLoading) {
    return (
      <div className="bg-surface min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="flex gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex-1">
                  <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map(j => (
                      <div key={j} className="h-32 bg-muted rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-display font-semibold text-foreground">Task Board</h1>
              <p className="text-muted-foreground">Manage your tasks with drag-and-drop simplicity</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "board" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("board")}
                  className="h-8"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <AddTaskDialog onAddTask={addNewTask} />
              </Dialog>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                <SelectTrigger className="w-36">
                  <User className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {allAssignees.map(assignee => (
                    <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Board View */}
        {viewMode === "board" && (
          <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {filteredColumns.map((column) => (
                <div key={column.id} className="bg-background rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={column.color}>
                        {column.icon}
                      </div>
                      <h3 className="font-display font-medium text-foreground">{column.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {column.tasks.length}
                      </Badge>
                    </div>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-32 transition-colors ${
                          snapshot.isDraggingOver ? 'bg-accent/50 rounded-lg' : ''
                        }`}
                      >
                        <AnimatePresence>
                          {column.tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                                {column.icon}
                              </div>
                              <p className="text-sm text-muted-foreground">No tasks yet</p>
                              <p className="text-xs text-muted-foreground">Drag tasks here or create new ones</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {column.tasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided, snapshot) => (
                                    <motion.div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -20 }}
                                      className={`${
                                        snapshot.isDragging ? 'rotate-2 scale-105' : ''
                                      } transition-transform`}
                                    >
                                      <TaskCard 
                                        task={task} 
                                        isDragging={snapshot.isDragging}
                                        isBeingDragged={draggedTask === task.id}
                                      />
                                    </motion.div>
                                  )}
                                </Draggable>
                              ))}
                            </div>
                          )}
                        </AnimatePresence>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="bg-background rounded-lg border border-border overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
              <div className="col-span-4">Task</div>
              <div className="col-span-2">Assignee</div>
              <div className="col-span-2">Due Date</div>
              <div className="col-span-2">Priority</div>
              <div className="col-span-2">Status</div>
            </div>
            
            <div className="divide-y divide-border">
              {filteredColumns.flatMap(col => col.tasks).map((task) => (
                <div key={task.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className="col-span-4">
                    <h4 className="font-medium text-foreground mb-1">{task.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                  </div>
                  <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    {task.assignee}
                  </div>
                  <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                  <div className="col-span-2 flex items-center">
                    <Badge className={`${priorityColors[task.priority]} flex items-center gap-1`}>
                      {priorityIcons[task.priority]}
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {initialColumns.find(col => col.status === task.status)?.icon}
                      {task.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TaskCard({ task, isDragging, isBeingDragged }: { 
  task: Task
  isDragging: boolean
  isBeingDragged: boolean
}) {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "completed"
  
  return (
    <Card className={`
      cursor-grab active:cursor-grabbing transition-all duration-200
      ${isDragging ? 'shadow-lg border-primary' : 'hover:shadow-md'}
      ${isBeingDragged ? 'opacity-50' : ''}
      ${isOverdue ? 'border-error' : ''}
    `}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-foreground leading-tight pr-2">{task.title}</h4>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
        
        <div className="flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <Badge key={label} variant="outline" className="text-xs">
              {label}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={`${priorityColors[task.priority]} flex items-center gap-1 text-xs`}>
              {priorityIcons[task.priority]}
              {task.priority}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {task.assignee.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AddTaskDialog({ onAddTask }: { onAddTask: (task: Omit<Task, 'id'>) => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium" as Task['priority'],
    assignee: "",
    labels: "",
    status: "todo" as Task['status']
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) return
    
    onAddTask({
      ...formData,
      labels: formData.labels.split(',').map(l => l.trim()).filter(Boolean)
    })
    
    setFormData({
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      assignee: "",
      labels: "",
      status: "todo"
    })
  }

  return (
    <DialogContent className="sm:max-w-md bg-background">
      <DialogHeader>
        <DialogTitle className="font-display">Add New Task</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter task title"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter task description"
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value: Task['priority']) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="assignee">Assignee</Label>
          <Input
            id="assignee"
            value={formData.assignee}
            onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
            placeholder="Enter assignee name"
          />
        </div>
        
        <div>
          <Label htmlFor="labels">Labels (comma-separated)</Label>
          <Input
            id="labels"
            value={formData.labels}
            onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
            placeholder="frontend, design, urgent"
          />
        </div>
        
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: Task['status']) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="inprogress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            Add Task
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}