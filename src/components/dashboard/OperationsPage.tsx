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
  RotateCcw,
  Settings2
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
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  // Load Data
  useEffect(() => {
    const savedTasks = localStorage.getItem(`aflows_tasks_${businessId}`)
    const savedTemplates = localStorage.getItem(`aflows_recurring_${businessId}`)

    const parsedTasks = savedTasks ? JSON.parse(savedTasks) : []
    const parsedTemplates = savedTemplates ? JSON.parse(savedTemplates) : []

    const { newTasks, updatedTemplates } = generateRecurringTasks(parsedTemplates, parsedTasks)
    
    const allTasks = [...parsedTasks, ...newTasks]
    setTasks(allTasks)
    setRecurringTemplates(updatedTemplates)
  }, [])

  // Sync to Storage whenever state changes
  useEffect(() => {
    if (tasks.length > 0 || recurringTemplates.length > 0) {
        localStorage.setItem(`aflows_tasks_${businessId}`, JSON.stringify(tasks))
        localStorage.setItem(`aflows_recurring_${businessId}`, JSON.stringify(recurringTemplates))
    }
  }, [tasks, recurringTemplates])

  const addOneOffTask = (title: string, priority: "low" | "medium" | "high", dueDate?: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
      completed: false,
      fromRecurring: false
    }
    setTasks([newTask, ...tasks])
    toast({ title: "Task Created", description: title })
  }

  const completeTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
    ))
  }

  const undoTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: false, completedAt: undefined } : t
    ))
  }

  const filtered = useMemo(() => 
    tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())), 
  [tasks, searchQuery])

  const activeTasks = filtered.filter(t => !t.completed)
  const completedTasks = filtered.filter(t => t.completed)

  return (
    // Changed max-w-7xl to w-full to occupy full width
    <div className="p-6 space-y-8 w-full"> 
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Operations</h1>
          <p className="text-muted-foreground mt-1">Manage daily routines and one-off objectives.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* MAIN TASK AREA */}
        <div className="lg:col-span-3 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter tasks by name..." 
              className="pl-10 h-12 text-lg" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Card className="border-dashed border-2">
            <CardHeader className="flex flex-row justify-between items-center py-3">
              <CardTitle className="text-sm font-medium">Quick Task Entry</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowQuickAdd(!showQuickAdd)}>
                {showQuickAdd ? "Hide Details" : "Add with Details"}
              </Button>
            </CardHeader>
            {showQuickAdd && (
              <CardContent>
                <AdvancedAdd onAdd={addOneOffTask} />
              </CardContent>
            )}
          </Card>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2">
              <TabsTrigger value="active">Active Tasks ({activeTasks.length})</TabsTrigger>
              <TabsTrigger value="completed">Archive</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4">
              <Card>
                {activeTasks.length === 0 ? (
                  <div className="p-20 text-center text-muted-foreground">No pending tasks. You're all caught up!</div>
                ) : (
                  activeTasks.map(task => (
                    <div key={task.id} className={cn("p-4 flex justify-between items-center border-b last:border-0", task.priority === "high" && "bg-destructive/5")}>
                      <div className="flex items-start gap-4">
                         <Button variant="outline" size="icon" className="rounded-full h-8 w-8" onClick={() => completeTask(task.id)}>
                            <CheckCircle2 className="h-4 w-4" />
                         </Button>
                         <div>
                            <p className="font-medium">{task.title}</p>
                            <div className="flex items-center gap-3 mt-1">
                                <Badge variant={task.priority === "high" ? "destructive" : "secondary"} className="capitalize">{task.priority}</Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <CalendarIcon className="h-3 w-3" />
                                    {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                            </div>
                         </div>
                      </div>
                    </div>
                  ))
                )}
              </Card>
            </TabsContent>

            <TabsContent value="completed">
                <Card>
                    {completedTasks.map(task => (
                        <div key={task.id} className="p-4 flex justify-between items-center border-b opacity-60">
                            <p className="line-through">{task.title}</p>
                            <Button variant="ghost" size="icon" onClick={() => undoTask(task.id)}>
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* SIDEBAR: RECURRING TASKS */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-md border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Repeat className="h-5 w-5 text-primary" />
                {editingTemplate ? "Edit Schedule" : "Automate Task"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecurringFormView 
                onSave={(title: string, frequency: any, priority: any) => {
                  let updatedTemplates
                  if (editingTemplate) {
                    updatedTemplates = recurringTemplates.map(t => 
                      t.id === editingTemplate.id ? { ...t, title, frequency, priority } : t
                    )
                    setEditingTemplate(null)
                  } else {
                    const newTemplate: RecurringTemplate = {
                      id: crypto.randomUUID(),
                      title, frequency, priority,
                      nextDueDate: new Date().toISOString(),
                      createdAt: new Date().toISOString()
                    }
                    updatedTemplates = [...recurringTemplates, newTemplate]
                  }
                  
                  const { newTasks, updatedTemplates: engineTemplates } = generateRecurringTasks(updatedTemplates, tasks)
                  setRecurringTemplates(engineTemplates)
                  setTasks([...tasks, ...newTasks])
                  toast({ title: "Schedule Updated" })
                }}
                initialData={editingTemplate}
                onCancel={() => setEditingTemplate(null)}
              />
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Active Schedules</h3>
            {recurringTemplates.map(template => (
              <Card key={template.id} className="p-4 group hover:border-primary transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm">{template.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      {template.frequency} • Next: {new Date(template.nextDueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingTemplate(template)}>
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => {
                        setRecurringTemplates(prev => prev.filter(t => t.id !== template.id))
                    }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function RecurringFormView({ onSave, initialData, onCancel }: { onSave: any, initialData?: any, onCancel: any }) {
  const [title, setTitle] = useState("")
  const [freq, setFreq] = useState("weekly")
  const [customDays, setCustomDays] = useState("7")
  const [prio, setPrio] = useState("medium")

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setFreq(initialData.frequency.includes('days') ? "custom" : initialData.frequency)
      setPrio(initialData.priority)
    }
  }, [initialData])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase">Task Name</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Monthly Tax Filing" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase">Frequency</label>
          <select 
            className="w-full bg-background border rounded-md p-2 text-sm"
            value={freq} 
            onChange={(e) => setFreq(e.target.value)}
          >
            <option value="daily">Every Day</option>
            <option value="weekly">Every Week</option>
            <option value="monthly">Every Month</option>
            <option value="custom">Custom Interval</option>
          </select>
        </div>

        {freq === "custom" && (
           <div className="space-y-2">
             <label className="text-xs font-semibold uppercase">Days between tasks</label>
             <Input type="number" value={customDays} onChange={(e) => setCustomDays(e.target.value)} />
           </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase">Urgency</label>
          <select 
            className="w-full bg-background border rounded-md p-2 text-sm"
            value={prio} 
            onChange={(e) => setPrio(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High / Critical</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button className="flex-1" onClick={() => {
          if (!title.trim()) return
          const finalFreq = freq === "custom" ? `every ${customDays} days` : freq
          onSave(title, finalFreq, prio)
          setTitle(""); setFreq("weekly");
        }}>
          {initialData ? "Save Changes" : "Activate Schedule"}
        </Button>
        {initialData && <Button variant="outline" onClick={onCancel}>Cancel</Button>}
      </div>
    </div>
  )
}

function AdvancedAdd({ onAdd }: { onAdd: any }) {
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [date, setDate] = useState("")

  return (
    <div className="flex flex-wrap md:flex-nowrap gap-4 items-end">
      <div className="flex-1 space-y-2">
        <label className="text-xs font-bold">TASK TITLE</label>
        <Input placeholder="What needs to be done?" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="w-full md:w-40 space-y-2">
        <label className="text-xs font-bold">DUE DATE</label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="w-full md:w-40 space-y-2">
        <label className="text-xs font-bold">PRIORITY</label>
        <select className="w-full bg-background border rounded-md p-2 h-10" value={priority} onChange={(e) => setPriority(e.target.value as any)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <Button onClick={() => { onAdd(title, priority, date); setTitle(""); setDate(""); }} className="h-10">Create</Button>
    </div>
  )
}
