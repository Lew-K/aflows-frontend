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
  Clock,
  Plus,
  ChevronDown
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
  const [showAdvancedAdd, setShowAdvancedAdd] = useState(false)
  const [showRecurringForm, setShowRecurringForm] = useState(false)

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

    setShowAdvancedAdd(false)
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
    <div className="w-full min-h-screen bg-background">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* HEADER WITH FOCUS BUTTONS */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold">Operations</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Your business, on autopilot.
            </p>
          </div>

          {/* FOCUS MODE BUTTONS - TOP RIGHT */}
          <div className="flex flex-wrap gap-2 sm:flex-col">
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
              Urgent
            </Button>
            <Button
              variant={focusMode === "today" ? "default" : "outline"}
              size="sm"
              onClick={() => setFocusMode("today")}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Today
            </Button>
          </div>
        </div>

        {/* KPI BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
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
          <div className="lg:col-span-3 space-y-4">

            {/* SEARCH */}
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

            {/* QUICK ADD BUTTON */}
            <Button
              onClick={() => setShowAdvancedAdd(!showAdvancedAdd)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>

            {/* ADVANCED ADD FORM */}
            {showAdvancedAdd && (
              <Card>
                <CardContent className="pt-6">
                  <AdvancedAdd onAdd={addOneOffTask} />
                </CardContent>
              </Card>
            )}

            {/* TAG FILTERS */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Filter by category</p>
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
                      "px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors",
                      selectedTags.includes(tag)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* TABS */}
            <Tabs defaultValue="active">
              <TabsList className="grid w-full grid-cols-2">
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
                    <div className="p-8 sm:p-16 text-center opacity-50">
                      <p className="text-sm">{selectedTags.length > 0 || focusMode !== "all" ? "No tasks match your filters." : "No active tasks. Start by adding a task or creating an automation."}</p>
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
                    <div className="p-8 sm:p-16 text-center opacity-50">
                      <p className="text-sm">No completed tasks yet.</p>
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

          {/* RIGHT SIDEBAR */}
          <div className="space-y-4 lg:col-span-1">

            {/* RECURRING CREATION CARD - COLLAPSIBLE */}
            <Card>
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setShowRecurringForm(!showRecurringForm)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    {editingTemplate ? "Edit" : "New Automation"}
                  </CardTitle>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    showRecurringForm && "rotate-180"
                  )} />
                </div>
              </CardHeader>

              {showRecurringForm && (
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
                      setShowRecurringForm(false)
                    }}
                    initialData={editingTemplate}
                    onCancel={() => setEditingTemplate(null)}
                  />
                </CardContent>
              )}
            </Card>

            {/* ACTIVE AUTOMATIONS */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Automations</CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                {recurringTemplates.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No automations yet.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {recurringTemplates.map(template => (
                      <div
                        key={template.id}
                        className="p-2 border rounded-md text-xs space-y-1"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-semibold">{template.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {template.priority}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground capitalize">
                          {template.frequency}
                        </p>

                        <div className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(template.nextDueDate).toLocaleDateString()}</span>
                        </div>

                        {template.lastFired && (
                          <div className="text-muted-foreground flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            <span>{new Date(template.lastFired).toLocaleDateString()}</span>
                          </div>
                        )}

                        <div className="flex gap-1 pt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => setEditingTemplate(template)}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-destructive"
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
                    ))}
                  </div>
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
          "p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center hover:bg-muted/50 transition-colors gap-3 sm:gap-0",
          task.priority === "high" && !task.completed && "border-l-4 border-l-destructive bg-destructive/5",
          task.isOverdue && !task.completed && "bg-orange-50 dark:bg-orange-950/20"
        )}
      >
        <div className="flex-1 cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
          <div className="flex items-start gap-2 sm:gap-3">
            {task.isOverdue && !task.completed && (
              <Flame className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base break-words">{task.title}</p>
              <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-muted-foreground flex-wrap">
                <Badge variant={task.isOverdue && !task.completed ? "destructive" : "secondary"} className="text-xs">
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

        <div className="flex gap-2 justify-end sm:ml-4">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9"
            onClick={() => onComplete(task.id)}
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 text-destructive"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showDetails && (task.notes || task.externalLink) && (
        <div className="p-3 sm:p-4 bg-muted/30 border-t text-xs sm:text-sm space-y-2">
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
    <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center hover:bg-muted/50 transition-colors gap-3 sm:gap-0">
      <div className="flex-1">
        <p className="line-through opacity-60 text-sm sm:text-base break-words">{task.title}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Completed on{" "}
          {task.completedAt &&
            new Date(task.completedAt).toLocaleDateString()}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 sm:h-9 sm:w-9 justify-self-end"
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
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl sm:text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={cn(
            "h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center flex-shrink-0",
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
        className="text-sm"
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
        className="text-sm"
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
        className="text-sm"
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

      <Button onClick={handleAdd} className="w-full">Create Task</Button>
    </div>
  )
}
