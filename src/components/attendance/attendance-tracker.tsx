"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, Download, TrendingUp, TrendingDown, AlertTriangle, Filter } from "lucide-react"

interface AttendanceRecord {
  date: Date
  status: 'present' | 'absent' | 'late'
  subject?: string
  duration?: number
}

interface AttendanceTrackerProps {
  attendanceData?: AttendanceRecord[]
  subjects?: string[]
  onDateRangeChange?: (startDate: Date, endDate: Date) => void
  onSubjectFilter?: (subject: string | null) => void
  onExport?: () => void
}

const mockAttendanceData: AttendanceRecord[] = [
  { date: new Date(2024, 0, 15), status: 'present', subject: 'Mathematics', duration: 60 },
  { date: new Date(2024, 0, 16), status: 'late', subject: 'Physics', duration: 45 },
  { date: new Date(2024, 0, 17), status: 'absent', subject: 'Chemistry' },
  { date: new Date(2024, 0, 18), status: 'present', subject: 'Mathematics', duration: 60 },
  { date: new Date(2024, 0, 19), status: 'present', subject: 'Physics', duration: 60 },
  { date: new Date(2024, 0, 22), status: 'present', subject: 'Chemistry', duration: 60 },
  { date: new Date(2024, 0, 23), status: 'late', subject: 'Mathematics', duration: 40 },
  { date: new Date(2024, 0, 24), status: 'present', subject: 'Physics', duration: 60 },
  { date: new Date(2024, 0, 25), status: 'absent', subject: 'Chemistry' },
  { date: new Date(2024, 0, 26), status: 'present', subject: 'Mathematics', duration: 60 },
]

const mockSubjects = ['All Subjects', 'Mathematics', 'Physics', 'Chemistry']

export default function AttendanceTracker({
  attendanceData = mockAttendanceData,
  subjects = mockSubjects,
  onDateRangeChange,
  onSubjectFilter,
  onExport
}: AttendanceTrackerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedSubject, setSelectedSubject] = useState<string>('All Subjects')
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(2024, 0, 1),
    to: new Date(2024, 0, 31)
  })

  const filteredData = attendanceData.filter(record => {
    const matchesSubject = selectedSubject === 'All Subjects' || record.subject === selectedSubject
    const withinRange = record.date >= dateRange.from && record.date <= dateRange.to
    return matchesSubject && withinRange
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-success text-white'
      case 'absent': return 'bg-error text-white'  
      case 'late': return 'bg-warning text-white'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getAttendanceForDate = (date: Date) => {
    return filteredData.find(record => 
      record.date.toDateString() === date.toDateString()
    )
  }

  const calculateStats = () => {
    const total = filteredData.length
    const present = filteredData.filter(r => r.status === 'present').length
    const late = filteredData.filter(r => r.status === 'late').length
    const absent = filteredData.filter(r => r.status === 'absent').length
    
    const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 0
    
    return { total, present, late, absent, percentage }
  }

  const stats = calculateStats()

  const modifiers = {
    present: filteredData
      .filter(r => r.status === 'present')
      .map(r => r.date),
    absent: filteredData
      .filter(r => r.status === 'absent')
      .map(r => r.date),
    late: filteredData
      .filter(r => r.status === 'late')
      .map(r => r.date)
  }

  const modifiersStyles = {
    present: { backgroundColor: 'var(--color-success)', color: 'white' },
    absent: { backgroundColor: 'var(--color-error)', color: 'white' },
    late: { backgroundColor: 'var(--color-warning)', color: 'white' }
  }

  return (
    <div className="space-y-6 bg-surface p-6 rounded-lg">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">Attendance Tracker</h1>
          <p className="text-muted-foreground">Track and monitor your class attendance</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Select value={selectedSubject} onValueChange={(value) => {
            setSelectedSubject(value)
            onSubjectFilter?.(value === 'All Subjects' ? null : value)
          }}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={onExport} variant="outline" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <Card className="xl:col-span-2 bg-background border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CalendarDays className="w-5 h-5" />
              Monthly Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Legend */}
              <div className="flex flex-wrap gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-sm text-foreground">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <span className="text-sm text-foreground">Late</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-error"></div>
                  <span className="text-sm text-foreground">Absent</span>
                </div>
              </div>

              {/* Calendar */}
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={modifiers}
                  modifiersStyles={modifiersStyles}
                  className="rounded-md border border-border"
                />
              </div>

              {/* Selected Date Details */}
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-muted rounded-lg"
                >
                  <h4 className="font-semibold text-foreground mb-2">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h4>
                  {(() => {
                    const attendance = getAttendanceForDate(selectedDate)
                    if (attendance) {
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(attendance.status)}>
                              {attendance.status}
                            </Badge>
                            {attendance.subject && (
                              <span className="text-sm text-muted-foreground">
                                {attendance.subject}
                              </span>
                            )}
                          </div>
                          {attendance.duration && (
                            <p className="text-sm text-muted-foreground">
                              Duration: {attendance.duration} minutes
                            </p>
                          )}
                        </div>
                      )
                    } else {
                      return (
                        <p className="text-sm text-muted-foreground">No attendance record for this date</p>
                      )
                    }
                  })()}
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Panel */}
        <div className="space-y-6">
          {/* Overall Statistics */}
          <Card className="bg-background border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{stats.percentage}%</div>
                <p className="text-sm text-muted-foreground">Overall Attendance</p>
              </div>
              
              <Progress value={stats.percentage} className="h-2" />
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-success">{stats.present}</div>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
                <div>
                  <div className="text-lg font-semibold text-warning">{stats.late}</div>
                  <p className="text-xs text-muted-foreground">Late</p>
                </div>
                <div>
                  <div className="text-lg font-semibold text-error">{stats.absent}</div>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Alerts */}
          {stats.percentage < 75 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="bg-error/5 border-error/20 border-border">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-error mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-error">Low Attendance Alert</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your attendance is below 75%. Consider attending more classes to meet requirements.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Trends */}
          <Card className="bg-background border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Weekly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {stats.percentage >= 80 ? (
                  <>
                    <TrendingUp className="w-5 h-5 text-success" />
                    <span className="text-sm text-success">Excellent attendance</span>
                  </>
                ) : stats.percentage >= 60 ? (
                  <>
                    <TrendingUp className="w-5 h-5 text-warning" />
                    <span className="text-sm text-warning">Good attendance</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-5 h-5 text-error" />
                    <span className="text-sm text-error">Needs improvement</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subject-wise Breakdown */}
          {selectedSubject === 'All Subjects' && (
            <Card className="bg-background border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Subject Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {subjects.filter(s => s !== 'All Subjects').map(subject => {
                  const subjectData = attendanceData.filter(r => r.subject === subject)
                  const subjectPresent = subjectData.filter(r => r.status === 'present').length
                  const subjectTotal = subjectData.length
                  const subjectPercentage = subjectTotal > 0 ? Math.round((subjectPresent / subjectTotal) * 100) : 0
                  
                  return (
                    <div key={subject} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-foreground">{subject}</span>
                        <span className="text-sm text-muted-foreground">{subjectPercentage}%</span>
                      </div>
                      <Progress value={subjectPercentage} className="h-1" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}