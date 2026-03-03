import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Task, RecurringTemplate, generateRecurringTasks } from "@/lib/taskEngine"

const { toast } = useToast()

const businessId = "default" // replace with your real businessId if available

const [tasks, setTasks] = useState<Task[]>([])
const [recurringTemplates, setRecurringTemplates] = useState<RecurringTemplate[]>([])
const [searchQuery, setSearchQuery] = useState("")

useEffect(() => {
  const savedTasks = localStorage.getItem(`aflows_tasks_${businessId}`)
  const savedTemplates = localStorage.getItem(`aflows_recurring_${businessId}`)

  const parsedTasks = savedTasks ? JSON.parse(savedTasks) : []
  const parsedTemplates = savedTemplates ? JSON.parse(savedTemplates) : []

  const { newTasks, updatedTemplates } = generateRecurringTasks(
    parsedTemplates,
    parsedTasks
  )

  const allTasks = [...parsedTasks, ...newTasks]

  setTasks(allTasks)
  setRecurringTemplates(updatedTemplates)

  localStorage.setItem(`aflows_tasks_${businessId}`, JSON.stringify(allTasks))
  localStorage.setItem(
    `aflows_recurring_${businessId}`,
    JSON.stringify(updatedTemplates)
  )

  if (newTasks.length > 0) {
    newTasks.forEach((task) => {
      toast({
        title: `Recurring task created: ${task.title}`,
      })
    })
  }
}, [])

const getStatus = (dueDate: string) => {
  const today = new Date()
  const due = new Date(dueDate)

  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const dueOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate())

  if (dueOnly < todayOnly) return "overdue"
  if (dueOnly.getTime() === todayOnly.getTime()) return "today"
  return "upcoming"
}

const completeTask = (task: Task) => {
  const updatedTasks = tasks.map((t) =>
    t.id === task.id
      ? { ...t, completed: true, completedAt: new Date().toISOString() }
      : t
  )

  setTasks(updatedTasks)
  localStorage.setItem(
    `aflows_tasks_${businessId}`,
    JSON.stringify(updatedTasks)
  )

  // If task came from recurring → advance template immediately
  if (task.fromRecurring) {
    const updatedTemplates = recurringTemplates.map((template) => {
      if (template.title === task.title) {
        const nextDate = new Date(template.nextDueDate)

        if (template.frequency === "weekly") {
          nextDate.setDate(nextDate.getDate() + 7)
        }

        if (template.frequency === "monthly") {
          nextDate.setMonth(nextDate.getMonth() + 1)
        }

        if (template.frequency === "custom" && template.customDays) {
          nextDate.setDate(nextDate.getDate() + template.customDays)
        }

        return {
          ...template,
          nextDueDate: nextDate.toISOString(),
        }
      }

      return template
    })

    setRecurringTemplates(updatedTemplates)
    localStorage.setItem(
      `aflows_recurring_${businessId}`,
      JSON.stringify(updatedTemplates)
    )
  }
}

const filteredTasks = tasks
  .filter((task) => !task.completed)
  .filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
