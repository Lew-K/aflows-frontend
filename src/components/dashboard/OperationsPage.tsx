"use client"

import { useEffect, useMemo, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
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

  // =============================
  // ENGINE SYNC
  // =============================
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

  // =============================
  // TASK ACTIONS
  // =============================

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
      title: `Task created`,
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

    const task = tasks.find(t => t.id === id)
    toast({
      title: "Task completed",
      description: task?.title
    })
  }

  const undoTask = (id: string) => {
    const updated = tasks.map(t =>
      t.id === id ? { ...t, completed: false, completedAt: undefined } : t
    )
    setTasks(updated)
    syncStorage(updated, recurringTemplates)
  }

  // =============================
  // RECURRING
  // =============================

  const handleSaveTemplate = (
    title: string,
    frequency: any,
    priority: any
  ) => {
    let updatedTemplates

    if (editingTemplate) {
      updatedTemplates = recurringTemplates.map(t =>
        t.id === editingTemplate.id
          ? { ...t, title, frequency, priority }
          : t
      )
      setEditingTemplate(null)
      toast({ title: "Template updated" })
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
  }

  const deleteTemplate = (id: string) => {
    const updated = recurringTemplates.filter(t => t.id !== id)
    setRecurringTemplates(updated)
    syncStorage(tasks, updated)

    toast({
      variant: "destructive",
      title: "Template removed"
    })
  }

  // =============================
  // FILTERING
  // =============================

  const filtered = useMemo(
    () =>
      tasks.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [tasks, searchQuery]
  )

  const activeTasks = filtered.filter(t => !t.completed)
  const completedTasks = filtered.filter(t => t.completed)

  // =============================
  // UI
  // =============================

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-4xl font-extrabold">Operations</h1>
        <p className="text-muted-foreground mt-1">
          Your business, on autopilot.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <QuickAddTask onAdd={addOneOffTask} />
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        {/* ACTIVE */}
        <TabsContent value="active">
          <Card>
            <div className="divide-y">
              {activeTasks.length === 0 ? (
                <div className="p-16 text-center opacity-50">
                  Add tasks to stay on top of your business operations.
                </div>
              ) : (
                activeTasks.map(task => (
                  <div
                    key={task.id}
                    className={cn(
                      "p-4 flex justify-between items-center",
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

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => completeTask(task.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        {/* COMPLETED */}
        <TabsContent value="completed">
          <Card>
            <div className="divide-y">
              {completedTasks.length === 0 ? (
                <div className="p-16 text-center opacity-40">
                  No completed tasks yet.
                </div>
              ) : (
                completedTasks.map(task => (
                  <div key={task.id} className="p-4 flex justify-between">
                    <div>
                      <p className="line-through opacity-60">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Completed{" "}
                        {task.completedAt &&
                          new Date(task.completedAt).toLocaleString()}
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
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// =================================
// QUICK ADD
// =================================

function QuickAddTask({ onAdd }: { onAdd: any }) {
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
    <div className="flex gap-2 items-center border p-2 rounded-md">
      <Input
        placeholder="New task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
      />

      <select
        className="border rounded px-2 py-1 text-sm"
        value={priority}
        onChange={(e) =>
          setPriority(e.target.value as "low" | "medium" | "high")
        }
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      />

      <Button size="icon" onClick={handleAdd}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
