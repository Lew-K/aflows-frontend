"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  CheckCircle2,
  Trash2,
  Repeat,
  Calendar as CalendarIcon,
  Edit3,
  RotateCcw,
  AlertCircle,
  Flame,
  TrendingUp,
  Zap,
  Filter,
  Link2,
  FileText,
  Clock
} from "lucide-react"
import { Task, RecurringTemplate, generateRecurringTasks, calculateKPIs, isTaskOverdue, getBumpedPriority } from "@/lib/taskEngine"
import { cn } from "@/lib/utils"

const AVAILABLE_TAGS = ["Sales", "Admin", "Inventory", "Operations", "Marketing"]

export function OperationsPage() {
  const { toast } = useToast()
  const businessId = "default"

  const [tasks, setTasks] = useState<Task[]>([])
  const [recurringTemplates, setRecurringTemplates] = useState<RecurringTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [editingTemplate, setEditingTemplate] = useState<RecurringTemplate | null>(null)
  const [focusMode, setFocusMode] = useState<"all" | "high" | "today">("all")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [kpis, setKpis] = useState(calculateKPIs([], []))

  // ================= ENGINE SYNC =================
  useEffect(() => {
    const savedTasks = localStorage.getItem(`aflows_tasks_${businessId}`)
    const savedTemplates = localStorage.getItem(`aflows_recurring_${businessId}`)

    const parsedTasks = savedTasks ? JSON.parse(savedTasks) : []
    const parsedTemplates = savedTemplates ? JSON.parse(savedTemplates) : []

    const { newTasks, updatedTemplates } =
      generateRecurringTasks(parsedTemplates, parsedTasks)

    const allTasks = [...parsedTasks, ...newTasks]
    const tasksWithOverdue = allTasks.map(t => ({
      ...t,
      isOverdue: isTaskOverdue(t),
      priority: getBumpedPriority(t)
    }))

    setTasks(tasksWithOverdue)
    setRecurringTemplates(updatedTemplates)
    setKpis(calculateKPIs(tasksWithOverdue, updatedTemplates))
    syncStorage(tasksWithOverdue, updatedTemplates)
  }, [])

  const syncStorage = (updatedTasks: Task[], updatedTemplates: RecurringTemplate[]) => {
    localStorage.setItem(`aflows_tasks_${businessId}`, JSON.stringify(updatedTasks))
    localStorage.setItem(`aflows_recurring_${businessId}`, JSON.stringify(updatedTemplates))
  }

  // ================= KEYBOARD SHORTCUTS =================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        const searchInput = document.getElementById("task-search")
        searchInput?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // ================= TASK ACTIONS =================

  const addOneOffTask = (
    title: string,
    priority: "low" | "medium" | "high",
    dueDate?: string,
    tags?: string[],
    notes?: string,
    externalLink?: string
  ) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      priority,
      dueDate: dueDate
        ? new Date(dueDate).toISOString()
        : new Date().toISOString(),
      completed: false,
      fromRecurring: false,
      tags,
      notes,
      externalLink,
      blockedBy: [],
      isOverdue: false
    }

    const updated = [newTask, ...tasks]
    setTasks(updated)
    syncStorage(updated, recurringTemplates)
    setKpis(calculateKPIs(updated, recurringTemplates))

    toast({
      title: "Task Created",
      description: title
    })
  }

  const completeTask = (id: string) => {
    const updated = tasks.map(t =>
      t.id === id
        ? { ...t, completed: true, completedAt: new Date().toISOString(), isOverdue: false }
        : t
    )
    setTasks(updated)
    syncStorage(updated, recurringTemplates)
    setKpis(calculateKPIs(updated, recurringTemplates))
  }

  const undoTask = (id: string) => {
    const updated = tasks.map(t =>
      t.id === id
        ? { ...t, completed: false, completedAt: undefined, isOverdue: isTaskOverdue(t) }
        : t
    )
    setTasks(updated)
    syncStorage(updated, recurringTemplates)
    setKpis(calculateKPIs(updated, recurringTemplates))
  }

  // ================= FILTERING =================

  const filtered = useMemo(() => {
    let result = tasks.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Apply tag filter
    if (selectedTags.length > 0) {
      result = result.filter(t =>
        t.tags && t.tags.some(tag => selectedTags.includes(tag))
      )
    }

    // Apply focus mode
    if (focusMode === "high") {
      result = result.filter(t => !t.completed && (t.priority === "high" || t.isOverdue))
    } else if (focusMode === "today") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      result = result.filter(t => {
        const dueDate = new Date(t.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        return !t.completed && dueDate <= tomorrow
      })
    }

    return result
  }, [tasks, searchQuery, selectedTags, focusMode])

  const activeTasks = filtered.filter(t => !t.completed)
  const completedTasks = filtered.filter(t => t.completed)

  // ================= UI =================

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6 mx-auto">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-extrabold">Operations</h1>
          <p className="text-muted-foreground mt-1">
            Your business, on autopilot.
          </p>
        </div>

        {/* KPI BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KPICard
            icon={<AlertCircle className="h-4 w-4" />}
            label="Overdue"
            value={kpis.overdue}
            variant={kpis.overdue > 0 ? "destructive" : "default"}
          />
          <KPICard
            icon={<Clock className="h-4 w-4" />}
            label="Due Today"
            value={kpis.dueToday}
            variant="default"
          />
          <KPICard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Completion"
            value={`${kpis.completionRate}%`}
            variant="default"
          />
          <KPICard
            icon={<Zap className="h-4 w-4" />}
            label="Automation"
            value={kpis.automationPulse}
            variant="default"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* MAIN CONTENT */}
          <div className="lg:col-span-3 space-y-6">

            {/* SEARCH & FILTERS */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="task-search"
                  placeholder="Search tasks... (⌘K)"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* TAG FILTERS */}
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTags(prev =>
                      prev.includes(tag)
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    )}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                      selectedTags.includes(tag)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* FOCUS MODE */}
              <div className="flex gap-2">
                <Button
                  variant={focusMode === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFocusMode("all")}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  All
                </Button>
                <Button
                  variant={focusMode === "high" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFocusMode("high")}
                >
                  <Flame className="h-4 w-4 mr-2" />
                  High Priority
                </Button>
                <Button
                  variant={focusMode === "today" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFocusMode("today")}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Due Today
                </Button>
              </div>
            </div>

            {/* TABS */}
            <Tabs defaultValue="active">
              <TabsList>
                <TabsTrigger value="active">
                  Active ({activeTasks.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedTasks.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                <Card>
                  {activeTasks.length === 0 ? (
                    <div className="p-16 text-center opacity-50">
                      {selectedTags.length > 0 ? "No active tasks match your filters." : "No active tasks. Start by adding a task or creating an automation."}
                    </div>
                  ) : (
                    <div className="divide-y">
                      {activeTasks.map(task => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onComplete={completeTask}
                          onDelete={(id) => {
                            const updated = tasks.filter(t => t.id !== id)
                            setTasks(updated)
                            syncStorage(updated, recurringTemplates)
                            setKpis(calculateKPIs(updated, recurringTemplates))
                          }}
                        />
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="completed">
                <Card>
                  {completedTasks.length === 0 ? (
                    <div className="p-16 text-center opacity-50">
                      No completed tasks yet.
                    </div>
                  ) : (
                    <div className="divide-y">
                      {completedTasks.map(task => (
                        <CompletedTaskRow
                          key={task.id}
                          task={task}
                          onUndo={undoTask}
                        />
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:h-fit">

            {/* QUICK ADD */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Add</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Task name... (Enter)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const value = (e.target as HTMLInputElement).value
                      if (!value.trim()) return
                      addOneOffTask(value, "medium")
                      ;(e.target as HTMLInputElement).value = ""
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* ADVANCED ADD */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Advanced Task</CardTitle>
              </CardHeader>
              <CardContent>
                <AdvancedAdd onAdd={addOneOffTask} />
              </CardContent>
            </Card>

            {/* RECURRING CREATION CARD */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  {editingTemplate ? "Edit Rule" : "New Automation"}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <RecurringFormView
                  onSave={(title: string, frequency: any, priority: any) => {
                    let updatedTemplates

                    if (editingTemplate) {
                      updatedTemplates = recurringTemplates.map(t =>
                        t.id === editingTemplate.id
                          ? { ...t, title, frequency, priority }
                          : t
                      )
                      setEditingTemplate(null)
                    } else {
                      const newTemplate: RecurringTemplate = {
                        id: crypto.randomUUID(),
                        title,
                        frequency,
                        priority,
                        nextDueDate: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                        lastFired: new Date().toISOString()
                      }

                      updatedTemplates = [...recurringTemplates, newTemplate]

                      toast({
                        title: `Automation created: ${title}`
                      })
                    }

                    const { newTasks, updatedTemplates: engineTemplates } =
                      generateRecurringTasks(updatedTemplates, tasks)

                    const updatedTasks = [...tasks, ...newTasks]

                    setRecurringTemplates(engineTemplates)
                    setTasks(updatedTasks)
                    setKpis(calculateKPIs(updatedTasks, engineTemplates))
                    syncStorage(updatedTasks, engineTemplates)
                  }}
                  initialData={editingTemplate}
                  onCancel={() => setEditingTemplate(null)}
                />
              </CardContent>
            </Card>

            {/* ACTIVE AUTOMATIONS */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active Automations</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {recurringTemplates.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No automations yet.
                  </div>
                ) : (
                  recurringTemplates.map(template => (
                    <div
                      key={template.id}
                      className="p-3 border rounded-md space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{template.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {template.frequency}
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {template.priority}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Next: {new Date(template.nextDueDate).toLocaleDateString()}
                      </div>

                      {template.lastFired && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Last fired: {new Date(template.lastFired).toLocaleDateString()}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => setEditingTemplate(template)}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => {
                            const updated = recurringTemplates.filter(
                              t => t.id !== template.id
                            )
                            setRecurringTemplates(updated)
                            setKpis(calculateKPIs(tasks, updated))
                            syncStorage(tasks, updated)

                            toast({
                              variant: "destructive",
                              title: "Automation deleted"
                            })
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskRow({
  task,
  onComplete,
  onDelete
}: {
  task: Task
  onComplete: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <>
      <div
        className={cn(
          "p-4 flex justify-between items-center hover:bg-muted/50 transition-colors",
          task.priority === "high" && !task.completed && "border-l-4 border-l-destructive bg-destructive/5",
          task.isOverdue && !task.completed && "bg-orange-50 dark:bg-orange-950/20"
        )}
      >
        <div className="flex-1 cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
          <div className="flex items-center gap-3">
            {task.isOverdue && !task.completed && (
              <Flame className="h-4 w-4 text-orange-500 flex-shrink-0" />
            )}
            <div>
              <p className="font-semibold">{task.title}</p>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
                <Badge variant={task.isOverdue && !task.completed ? "destructive" : "secondary"}>
                  {task.priority}
                </Badge>
                <span className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
                {task.tags && task.tags.length > 0 && (
                  <div className="flex gap-1">
                    {task.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onComplete(task.id)}
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showDetails && (task.notes || task.externalLink) && (
        <div className="p-4 bg-muted/30 border-t text-sm space-y-2">
          {task.notes && (
            <div className="flex gap-2">
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p>{task.notes}</p>
            </div>
          )}
          {task.externalLink && (
            <a
              href={task.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-2 text-primary hover:underline"
            >
              <Link2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
              View related link
            </a>
          )}
        </div>
      )}
    </>
  )
}

function CompletedTaskRow({
  task,
  onUndo
}: {
  task: Task
  onUndo: (id: string) => void
}) {
  return (
    <div className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
      <div>
        <p className="line-through opacity-60">{task.title}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Completed on{" "}
          {task.completedAt &&
            new Date(task.completedAt).toLocaleDateString()}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onUndo(task.id)}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  )
}

function KPICard({
  icon,
  label,
  value,
  variant = "default"
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  variant?: "default" | "destructive"
}) {
  return (
    <Card className={cn(
      variant === "destructive" && "border-destructive/50 bg-destructive/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center",
            variant === "destructive"
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RecurringFormView({
  onSave,
  initialData,
  onCancel
}: {
  onSave: any
  initialData?: any
  onCancel: any
}) {
  const [title, setTitle] = useState("")
  const [freq, setFreq] = useState("weekly")
  const [prio, setPrio] = useState("medium")

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setFreq(initialData.frequency)
      setPrio(initialData.priority)
    } else {
      setTitle("")
      setFreq("weekly")
      setPrio("medium")
    }
  }, [initialData])

  return (
    <div className="space-y-4">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Rule name..."
      />

      <div className="grid grid-cols-2 gap-2">
        <select
          className="bg-background text-foreground border border-border rounded-md p-2 text-sm"
          value={freq}
          onChange={(e) => setFreq(e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        <select
          className="bg-background text-foreground border border-border rounded-md p-2 text-sm"
          value={prio}
          onChange={(e) => setPrio(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-1"
          size="sm"
          onClick={() => {
            if (!title.trim()) return
            onSave(title, freq, prio)
          }}
        >
          {initialData ? "Update" : "Create"}
        </Button>

        {initialData && (
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}

function AdvancedAdd({ onAdd }: { onAdd: any }) {
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [date, setDate] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [link, setLink] = useState("")

  const handleAdd = () => {
    if (!title.trim()) return
    onAdd(title, priority, date || undefined, tags.length > 0 ? tags : undefined, notes || undefined, link || undefined)
    setTitle("")
    setDate("")
    setTags([])
    setNotes("")
    setLink("")
  }

  return (
    <div className="grid gap-4 text-sm">
      <Input
        placeholder="Task title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <select
        className="bg-background text-foreground border border-border rounded-md p-2 text-sm"
        value={priority}
        onChange={(e) =>
          setPriority(e.target.value as "low" | "medium" | "high")
        }
      >
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
      </select>

      <input
        type="date"
        className="bg-background text-foreground border border-border rounded-md p-2 text-sm"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <Input
        placeholder="External link (optional)"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        type="url"
      />

      <textarea
        className="bg-background text-foreground border border-border rounded-md p-2 text-sm resize-none"
        placeholder="Notes / instructions..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
      />

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Tags</p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setTags(prev =>
                prev.includes(tag)
                  ? prev.filter(t => t !== tag)
                  : [...prev, tag]
              )}
              className={cn(
                "px-2 py-1 rounded text-xs transition-colors",
                tags.includes(tag)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleAdd} className="w-full" size="sm">Create Task</Button>
    </div>
  )
}
