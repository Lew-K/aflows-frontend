"use client"

import { useEffect, useMemo, useState } from "react"
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
  RotateCcw
} from "lucide-react"
import { Task, RecurringTemplate, generateRecurringTasks } from "@/lib/taskEngine"
import { cn } from "@/lib/utils"

export function OperationsPage() {
  const { toast } = useToast()
  const businessId = "default"

  const [tasks, setTasks] = useState<Task[]>([])
  const [recurringTemplates, setRecurringTemplates] = useState<RecurringTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [editingTemplate, setEditingTemplate] = useState<RecurringTemplate | null>(null)
  const [showAdvancedAdd, setShowAdvancedAdd] = useState(false)

  // ================= ENGINE SYNC =================
  useEffect(() => {
    const savedTasks = localStorage.getItem(`aflows_tasks_${businessId}`)
    const savedTemplates = localStorage.getItem(`aflows_recurring_${businessId}`)

    const parsedTasks = savedTasks ? JSON.parse(savedTasks) : []
    const parsedTemplates = savedTemplates ? JSON.parse(savedTemplates) : []

    const { newTasks, updatedTemplates } =
      generateRecurringTasks(parsedTemplates, parsedTasks)

    const allTasks = [...parsedTasks, ...newTasks]

    setTasks(allTasks)
    setRecurringTemplates(updatedTemplates)
    syncStorage(allTasks, updatedTemplates)
  }, [])

  const syncStorage = (updatedTasks: Task[], updatedTemplates: RecurringTemplate[]) => {
    localStorage.setItem(`aflows_tasks_${businessId}`, JSON.stringify(updatedTasks))
    localStorage.setItem(`aflows_recurring_${businessId}`, JSON.stringify(updatedTemplates))
  }

  // ================= TASK ACTIONS =================

  const addOneOffTask = (
    title: string,
    priority: "low" | "medium" | "high",
    dueDate?: string
  ) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      priority,
      dueDate: dueDate
        ? new Date(dueDate).toISOString()
        : new Date().toISOString(),
      completed: false,
      fromRecurring: false
    }

    const updated = [newTask, ...tasks]
    setTasks(updated)
    syncStorage(updated, recurringTemplates)

    toast({
      title: "Task Created",
      description: title
    })
  }

  const completeTask = (id: string) => {
    const updated = tasks.map(t =>
      t.id === id
        ? { ...t, completed: true, completedAt: new Date().toISOString() }
        : t
    )
    setTasks(updated)
    syncStorage(updated, recurringTemplates)
  }

  const undoTask = (id: string) => {
    const updated = tasks.map(t =>
      t.id === id ? { ...t, completed: false, completedAt: undefined } : t
    )
    setTasks(updated)
    syncStorage(updated, recurringTemplates)
  }

  // ================= FILTERING =================

  const filtered = useMemo(
    () =>
      tasks.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [tasks, searchQuery]
  )

  const activeTasks = filtered.filter(t => !t.completed)
  const completedTasks = filtered.filter(t => t.completed)

  // ================= UI =================

  return (
    <div className="p-6 space-y-8 w-full px-8 xl:px-12 2xl:px-16">
      <div>
        <h1 className="text-4xl font-extrabold">Operations</h1>
        <p className="text-muted-foreground mt-1">
          Your business, on autopilot.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-8">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">

          {/* SEARCH */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* ADVANCED ADD */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Add Task</CardTitle>
              <Button
                variant="ghost"
                onClick={() => setShowAdvancedAdd(!showAdvancedAdd)}
              >
                {showAdvancedAdd ? "Hide Options" : "More Options"}
              </Button>
            </CardHeader>
          
            <CardContent className="space-y-4">
              {/* QUICK ADD */}
              <Input
                placeholder="What needs to be done?"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = (e.target as HTMLInputElement).value
                    if (!value.trim()) return
                    addOneOffTask(value, "medium")
                    ;(e.target as HTMLInputElement).value = ""
                  }
                }}
              />
          
              {/* ADVANCED */}
              {showAdvancedAdd && (
                <AdvancedAdd onAdd={addOneOffTask} />
              )}
            </CardContent>
          </Card>

          {/* TABS */}
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <Card>
                {activeTasks.length === 0 ? (
                  <div className="p-16 text-center opacity-50">
                    No active tasks.

                    Start by adding a task or creating an automation.
                  </div>
                ) : (
                  activeTasks.map(task => (
                    <div
                      key={task.id}
                      className={cn(
                        "p-4 flex justify-between items-center border-b",
                        task.priority === "high" &&
                          "border-l-4 border-l-destructive"
                      )}
                    >
                      <div>
                        <p className="font-semibold">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Badge>{task.priority}</Badge>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => completeTask(task.id)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            const updated = tasks.filter(t => t.id !== task.id)
                            setTasks(updated)
                            syncStorage(updated, recurringTemplates)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </Card>
            </TabsContent>

            <TabsContent value="completed">
              <Card>
                {completedTasks.map(task => (
                  <div key={task.id} className="p-4 flex justify-between border-b">
                    <div>
                      <p className="line-through opacity-60">
                        {task.title}
                      </p>
                      
                      <p className="text-xs text-muted-foreground">
                        Completed on{" "}
                        {task.completedAt &&
                          new Date(task.completedAt).toLocaleDateString()}
                      </p>
                        {task.title}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => undoTask(task.id)}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6 sticky top-6 h-fit">
        
          {/* RECURRING CREATION CARD */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                {editingTemplate ? "Edit Recurring Rule" : "New Recurring Rule"}
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
                      createdAt: new Date().toISOString()
                    }
        
                    updatedTemplates = [...recurringTemplates, newTemplate]
        
                    toast({
                      title: `Recurring task created: ${title}`
                    })
                  }
        
                  const { newTasks, updatedTemplates: engineTemplates } =
                    generateRecurringTasks(updatedTemplates, tasks)
        
                  const updatedTasks = [...tasks, ...newTasks]
        
                  setRecurringTemplates(engineTemplates)
                  setTasks(updatedTasks)
                  syncStorage(updatedTasks, engineTemplates)
                }}
                initialData={editingTemplate}
                onCancel={() => setEditingTemplate(null)}
              />
            </CardContent>
          </Card>
        
          {/* ACTIVE RECURRING RULES */}
          <Card>
            <CardHeader>
              <CardTitle>Active Automations</CardTitle>
            </CardHeader>
        
            <CardContent className="space-y-3">
              {recurringTemplates.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No recurring automations yet.
                </div>
              ) : (
                recurringTemplates.map(template => (
                  <div
                    key={template.id}
                    className="p-3 border rounded-md flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-sm">{template.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {template.frequency} • Next:{" "}
                        {new Date(template.nextDueDate).toLocaleDateString()}
                      </p>
                    </div>
        
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingTemplate(template)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
        
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          const updated = recurringTemplates.filter(
                            t => t.id !== template.id
                          )
                          setRecurringTemplates(updated)
                          syncStorage(tasks, updated)
        
                          toast({
                            variant: "destructive",
                            title: "Recurring rule deleted"
                          })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
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
          className="bg-background text-foreground border border-border rounded-md p-2"
          value={freq}
          onChange={(e) => setFreq(e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        <select
          className="bg-background text-foreground border border-border rounded-md p-2"
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
          onClick={() => {
            if (!title.trim()) return
            onSave(title, freq, prio)
          }}
        >
          {initialData ? "Update Rule" : "Create Rule"}
        </Button>

        {initialData && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}

// ================= ADVANCED ADD =================

function AdvancedAdd({ onAdd }: { onAdd: any }) {
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [date, setDate] = useState("")

  const handleAdd = () => {
    if (!title.trim()) return
    onAdd(title, priority, date || undefined)
    setTitle("")
    setDate("")
  }

  return (
    <div className="grid gap-4">
      <Input
        placeholder="Task title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <select
          className="bg-background text-foreground border border-border rounded-md p-2"
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
          className="bg-background text-foreground border border-border rounded-md p-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <Button onClick={handleAdd}>Create Task</Button>
    </div>
  )
}
