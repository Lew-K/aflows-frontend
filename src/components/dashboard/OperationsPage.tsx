"use client"

import { useEffect, useMemo, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Plus, Search, CheckCircle2 } from "lucide-react"
import {
  Task,
  RecurringTemplate,
  generateRecurringTasks,
} from "@/lib/taskEngine"
import { cn } from "@/lib/utils"

export function OperationsPage() {
  const { toast } = useToast()
  const businessId = "default"

  const [tasks, setTasks] = useState<Task[]>([])
  const [recurringTemplates, setRecurringTemplates] = useState<RecurringTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showCompleted, setShowCompleted] = useState(false)
  const [showRecurringForm, setShowRecurringForm] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // --- INITIAL LOAD & ENGINE SYNC ---
  useEffect(() => {
    const savedTasks = localStorage.getItem(`aflows_tasks_${businessId}`)
    const savedTemplates = localStorage.getItem(`aflows_recurring_${businessId}`)

    const parsedTasks = savedTasks ? JSON.parse(savedTasks) : []
    const parsedTemplates = savedTemplates ? JSON.parse(savedTemplates) : []

    const { newTasks, updatedTemplates } = generateRecurringTasks(parsedTemplates, parsedTasks)
    const allTasks = [...parsedTasks, ...newTasks]

    setTasks(allTasks)
    setRecurringTemplates(updatedTemplates)

    localStorage.setItem(`aflows_tasks_${businessId}`, JSON.stringify(allTasks))
    localStorage.setItem(`aflows_recurring_${businessId}`, JSON.stringify(updatedTemplates))

    if (newTasks.length > 0) {
      newTasks.forEach((task: Task) => {
        toast({ title: `Task generated: ${task.title}` })
      })
    }
  }, [])

  // --- HELPERS ---
  const getStatus = (dueDate: string) => {
    const today = new Date().setHours(0, 0, 0, 0)
    const due = new Date(dueDate).setHours(0, 0, 0, 0)
    if (due < today) return "overdue"
    if (due === today) return "today"
    return "upcoming"
  }

  const completeTask = (task: Task) => {
    const updatedTasks = tasks.map((t) =>
      t.id === task.id ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
    )
    setTasks(updatedTasks)
    localStorage.setItem(`aflows_tasks_${businessId}`, JSON.stringify(updatedTasks))
    toast({ title: "Task marked as complete" })
  }

  const createRecurringTemplate = (title: string, frequency: any, customDays: number | undefined, priority: any) => {
    const newTemplate: RecurringTemplate = {
      id: crypto.randomUUID(),
      title,
      frequency,
      customDays,
      priority,
      nextDueDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    const updated = [...recurringTemplates, newTemplate]
    setRecurringTemplates(updated)
    localStorage.setItem(`aflows_recurring_${businessId}`, JSON.stringify(updated))
    setShowRecurringForm(false)
    toast({ title: "Template created" })
  }

  // --- FILTERS ---
  const activeTasks = useMemo(() => 
    tasks.filter(t => !t.completed && t.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [tasks, searchQuery]
  )
  const completedTasks = tasks.filter(t => t.completed)
  const upcomingNotifications = tasks.filter(t => !t.completed && getStatus(t.dueDate) !== "upcoming")

  return (
    <div className="p-6 space-y-6 text-foreground">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Operations</h1>
          <p className="text-muted-foreground">Manage your recurring tasks and daily workflows.</p>
        </div>

        <div className="relative">
          <Button variant="outline" size="icon" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell className="h-5 w-5 text-yellow-500" />
            {upcomingNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                {upcomingNotifications.length}
              </span>
            )}
          </Button>

          {showNotifications && (
            <Card className="absolute right-0 mt-2 w-80 z-50 shadow-xl border-border">
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Alerts</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {upcomingNotifications.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No urgent tasks.</p>
                ) : (
                  upcomingNotifications.map(task => (
                    <div key={task.id} className="text-xs p-2 rounded-md bg-muted/50 border">
                      <p className="font-bold">{task.title}</p>
                      <p className={getStatus(task.dueDate) === 'overdue' ? 'text-destructive' : 'text-yellow-600'}>
                        {getStatus(task.dueDate).toUpperCase()}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowRecurringForm(!showRecurringForm)}>
          <Plus className="mr-2 h-4 w-4" /> Create Recurring Task
        </Button>
      </div>

      {showRecurringForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <RecurringForm onCreate={createRecurringTemplate} />
          </CardContent>
        </Card>
      )}

      {/* TASKS TABLE */}
      <Card>
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">Task</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Priority</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Due Date</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activeTasks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No active tasks found.
                  </td>
                </tr>
              ) : (
                activeTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">{task.title}</td>
                    <td className="p-4">
                      <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Button size="sm" onClick={() => completeTask(task)}>
                        Complete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* COMPLETED SECTION */}
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setShowCompleted(!showCompleted)}>
          {showCompleted ? "Hide" : "Show"} Completed Tasks ({completedTasks.length})
        </Button>
        
        {showCompleted && (
          <Card>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {completedTasks.map(task => (
                  <tr key={task.id} className="text-muted-foreground bg-muted/10">
                    <td className="p-4 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="line-through">{task.title}</span>
                    </td>
                    <td className="p-4 text-right italic text-xs">
                      Completed {new Date(task.completedAt!).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  )
}

function RecurringForm({ onCreate }: { onCreate: any }) {
  const [title, setTitle] = useState("")
  const [frequency, setFrequency] = useState<any>("monthly")
  const [customDays, setCustomDays] = useState<number>()
  const [priority, setPriority] = useState<any>("medium")

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase">Task Name</label>
        <Input placeholder="e.g. Monthly Tax Review" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase">Frequency</label>
        <select 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={frequency} 
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase">Priority</label>
        <select 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={priority} 
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <Button onClick={() => onCreate(title, frequency, customDays, priority)}>
        Save Template
      </Button>
    </div>
  )
}
