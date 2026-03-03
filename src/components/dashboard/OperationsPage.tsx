"use client"

import { useEffect, useMemo, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Bell, Plus, Search, CheckCircle2, Trash2, 
  Repeat, AlertCircle, Calendar as CalendarIcon, Edit3 
} from "lucide-react"
import { Task, RecurringTemplate, generateRecurringTasks } from "@/lib/taskEngine"
import { cn } from "@/lib/utils"

export default function OperationsPage() {
  const { toast } = useToast()
  const businessId = "default"

  // State
  const [tasks, setTasks] = useState<Task[]>([])
  const [recurringTemplates, setRecurringTemplates] = useState<RecurringTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [editingTemplate, setEditingTemplate] = useState<RecurringTemplate | null>(null)

  // --- ENGINE SYNC ---
  useEffect(() => {
    const savedTasks = localStorage.getItem(`aflows_tasks_${businessId}`)
    const savedTemplates = localStorage.getItem(`aflows_recurring_${businessId}`)

    let parsedTasks = savedTasks ? JSON.parse(savedTasks) : []
    let parsedTemplates = savedTemplates ? JSON.parse(savedTemplates) : []

    const { newTasks, updatedTemplates } = generateRecurringTasks(parsedTemplates, parsedTasks)
    
    const allTasks = [...parsedTasks, ...newTasks]
    setTasks(allTasks)
    setRecurringTemplates(updatedTemplates)
    syncStorage(allTasks, updatedTemplates)
  }, [])

  const syncStorage = (updatedTasks: Task[], updatedTemplates: RecurringTemplate[]) => {
    localStorage.setItem(`aflows_tasks_${businessId}`, JSON.stringify(updatedTasks))
    localStorage.setItem(`aflows_recurring_${businessId}`, JSON.stringify(updatedTemplates))
  }

  // --- ACTIONS ---
  const addOneOffTask = (title: string, priority: any, dueDate?: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      priority,
      dueDate: dueDate || new Date().toISOString(),
      completed: false,
      fromRecurring: false
    }
    const updated = [newTask, ...tasks]
    setTasks(updated)
    syncStorage(updated, recurringTemplates)
    toast({ title: "Task Created" })
  }

  const handleSaveTemplate = (title: string, frequency: any, priority: any) => {
    let updatedTemplates;
    if (editingTemplate) {
      // EDIT MODE
      updatedTemplates = recurringTemplates.map(t => 
        t.id === editingTemplate.id ? { ...t, title, frequency, priority } : t
      )
      setEditingTemplate(null)
      toast({ title: "Template Updated" })
    } else {
      // CREATE MODE
      const newTemplate: RecurringTemplate = {
        id: crypto.randomUUID(),
        title,
        frequency,
        priority,
        nextDueDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
      updatedTemplates = [...recurringTemplates, newTemplate]
      toast({ title: "Automation Active" })
    }

    const { newTasks } = generateRecurringTasks(updatedTemplates, tasks)
    const updatedTasks = [...tasks, ...newTasks]
    setRecurringTemplates(updatedTemplates)
    setTasks(updatedTasks)
    syncStorage(updatedTasks, updatedTemplates)
  }

  const deleteTemplate = (id: string) => {
    const updated = recurringTemplates.filter(t => t.id !== id)
    setRecurringTemplates(updated)
    syncStorage(tasks, updated)
    toast({ variant: "destructive", title: "Template Removed" })
  }

  const completeTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: true, completedAt: new Date().toISOString() } : t)
    setTasks(updated)
    syncStorage(updated, recurringTemplates)
  }

  const activeTasks = useMemo(() => 
    tasks.filter(t => !t.completed && t.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [tasks, searchQuery]
  )

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Operations</h1>
          <p className="text-muted-foreground mt-1 text-lg">Your business, on autopilot.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN FEED */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Find a task..." 
                className="pl-10 h-12 bg-card border-none shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <QuickAddTask onAdd={addOneOffTask} />
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="active" className="px-8">Active Agenda</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4">
              <Card className="border-none shadow-sm bg-card/50 backdrop-blur">
                <div className="divide-y divide-border/50">
                  {activeTasks.length === 0 ? (
                    <div className="p-20 text-center opacity-40">
                      <CheckCircle2 className="h-16 w-16 mx-auto mb-4" />
                      <p className="text-xl font-medium">Clear skies. No pending tasks.</p>
                    </div>
                  ) : (
                    activeTasks.map(task => (
                      <div key={task.id} className={cn(
                        "p-5 flex items-center justify-between hover:bg-primary/[0.02] transition-all",
                        task.priority === 'high' && "border-l-4 border-l-destructive"
                      )}>
                        <div className="flex items-center gap-4">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="rounded-full h-10 w-10 hover:border-primary hover:text-primary"
                            onClick={() => completeTask(task.id)}
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </Button>
                          <div>
                            <p className="font-bold text-base">{task.title}</p>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-[10px] h-4">
                                {task.priority}
                              </Badge>
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </TabsContent>
            {/* Completed content remains similar to previous version */}
          </Tabs>
        </div>

        {/* AUTOMATION SIDEBAR */}
        <div className="space-y-6">
          <Card className="border-primary/20 bg-gradient-to-b from-primary/[0.05] to-transparent">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Repeat className="h-5 w-5 text-primary" />
                {editingTemplate ? "Edit Rule" : "New Automation"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecurringFormView 
                onSave={handleSaveTemplate} 
                initialData={editingTemplate} 
                onCancel={() => setEditingTemplate(null)}
              />
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">Active Automation Rules</h3>
            {recurringTemplates.map(template => (
              <Card key={template.id} className="p-4 hover:shadow-md transition-shadow group border-border/50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm group-hover:text-primary transition-colors">{template.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground capitalize">
                      <Badge variant="outline" className="font-normal">{template.frequency}</Badge>
                      <span>•</span>
                      <span>Next: {new Date(template.nextDueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingTemplate(template)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTemplate(template.id)}>
                      <Trash2 className="h-4 w-4" />
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

// --- UPDATED SUBCOMPONENTS ---

function QuickAddTask({ onAdd }: { onAdd: any }) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("") // Date selection state

  const handleAdd = () => {
    if (!title) return
    onAdd(title, 'medium', date || undefined)
    setTitle("")
    setDate("")
  }

  return (
    <div className="flex gap-2 items-center bg-card p-1 rounded-lg shadow-sm border">
      <Input 
        placeholder="Add task..." 
        className="h-9 border-none focus-visible:ring-0 w-40" 
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input 
        type="date" 
        className="h-9 bg-transparent text-xs border-l pl-2 text-muted-foreground focus:outline-none"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <Button size="sm" onClick={handleAdd} className="h-8 w-8 p-0 rounded-full">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

function RecurringFormView({ onSave, initialData, onCancel }: { onSave: any, initialData?: any, onCancel: any }) {
  const [title, setTitle] = useState("")
  const [freq, setFreq] = useState("weekly")
  const [prio, setPrio] = useState("medium")

  // Sync with initialData when editing
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setFreq(initialData.frequency)
      setPrio(initialData.priority)
    } else {
      setTitle("")
    }
  }, [initialData])

  return (
    <div className="space-y-4">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Rule name..." className="bg-background" />
      <div className="grid grid-cols-2 gap-2">
        <select className="bg-background border rounded-md p-2 text-sm" value={freq} onChange={(e) => setFreq(e.target.value)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <select className="bg-background border rounded-md p-2 text-sm" value={prio} onChange={(e) => setPrio(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div className="flex gap-2">
        <Button className="flex-1" onClick={() => onSave(title, freq, prio)}>
          {initialData ? "Update Rule" : "Start Rule"}
        </Button>
        {initialData && <Button variant="outline" onClick={onCancel}>Cancel</Button>}
      </div>
    </div>
  )
}
