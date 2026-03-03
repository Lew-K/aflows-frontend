// src/lib/taskEngine.ts

export type TaskPriority = "low" | "medium" | "high"

export interface Task {
  id: string
  title: string
  dueDate: string
  priority: TaskPriority
  completed: boolean
  createdAt: string
  completedAt?: string
  fromRecurring?: boolean
}

export interface RecurringTemplate {
  id: string
  title: string
  frequency: "weekly" | "monthly" | "custom"
  customDays?: number
  nextDueDate: string
  priority: TaskPriority
  createdAt: string
}

export const generateRecurringTasks = (
  templates: RecurringTemplate[],
  existingTasks: Task[]
) => {
  const today = new Date()
  const newTasks: Task[] = []
  const updatedTemplates: RecurringTemplate[] = []

  templates.forEach((template) => {
    const nextDue = new Date(template.nextDueDate)

    if (nextDue <= today) {
      const alreadyExists = existingTasks.some(
        (task) =>
          task.title === template.title &&
          task.dueDate === template.nextDueDate &&
          task.fromRecurring
      )

      if (!alreadyExists) {
        newTasks.push({
          id: crypto.randomUUID(),
          title: template.title,
          dueDate: template.nextDueDate,
          priority: template.priority,
          completed: false,
          createdAt: new Date().toISOString(),
          fromRecurring: true,
        })
      }

      const updatedDate = new Date(template.nextDueDate)

      if (template.frequency === "weekly") {
        updatedDate.setDate(updatedDate.getDate() + 7)
      }

      if (template.frequency === "monthly") {
        updatedDate.setMonth(updatedDate.getMonth() + 1)
      }

      if (template.frequency === "custom" && template.customDays) {
        updatedDate.setDate(updatedDate.getDate() + template.customDays)
      }

      updatedTemplates.push({
        ...template,
        nextDueDate: updatedDate.toISOString(),
      })
    } else {
      updatedTemplates.push(template)
    }
  })

  return { newTasks, updatedTemplates }
}
