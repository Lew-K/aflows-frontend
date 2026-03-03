"use client"

import { useEffect, useMemo, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import {
  Task,
  RecurringTemplate,
  generateRecurringTasks,
} from "@/lib/taskEngine"

export function OperationsPage() {
  const { toast } = useToast()

  const businessId = "default"

  const [tasks, setTasks] = useState<Task[]>([])
  const [recurringTemplates, setRecurringTemplates] = useState<
    RecurringTemplate[]
  >([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showCompleted, setShowCompleted] = useState(false)
  const [showRecurringForm, setShowRecurringForm] = useState(false)

  // Notification dropdown
  const [showNotifications, setShowNotifications] = useState(false)

  // ----------------------------
  // LOAD + RECURRING GENERATION
  // ----------------------------

  useEffect(() => {
    const savedTasks = localStorage.getItem(`aflows_tasks_${businessId}`)
    const savedTemplates = localStorage.getItem(
      `aflows_recurring_${businessId}`
    )

    const parsedTasks = savedTasks ? JSON.parse(savedTasks) : []
    const parsedTemplates = savedTemplates
      ? JSON.parse(savedTemplates)
      : []

    const { newTasks, updatedTemplates } = generateRecurringTasks(
      parsedTemplates,
      parsedTasks
    )

    const allTasks = [...parsedTasks, ...newTasks]

    setTasks(allTasks)
    setRecurringTemplates(updatedTemplates)

    localStorage.setItem(
      `aflows_tasks_${businessId}`,
      JSON.stringify(allTasks)
    )

    localStorage.setItem(
      `aflows_recurring_${businessId}`,
      JSON.stringify(updatedTemplates)
    )

    if (newTasks.length > 0) {
      newTasks.forEach((task: Task) => {
        toast({
          title: `Recurring task created: ${task.title}`,
        })
      })
    }
  }, [])

  // ----------------------------
  // HELPERS
  // ----------------------------

  const getStatus = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)

    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )
    const dueOnly = new Date(
      due.getFullYear(),
      due.getMonth(),
      due.getDate()
    )

    if (dueOnly < todayOnly) return "overdue"
    if (dueOnly.getTime() === todayOnly.getTime()) return "today"
    return "upcoming"
  }

  const saveTasks = (updated: Task[]) => {
    setTasks(updated)
    localStorage.setItem(
      `aflows_tasks_${businessId}`,
      JSON.stringify(updated)
    )
  }

  const saveTemplates = (updated: RecurringTemplate[]) => {
    setRecurringTemplates(updated)
    localStorage.setItem(
      `aflows_recurring_${businessId}`,
      JSON.stringify(updated)
    )
  }

  // ----------------------------
  // COMPLETE TASK
  // ----------------------------

  const completeTask = (task: Task) => {
    const updatedTasks = tasks.map((t) =>
      t.id === task.id
        ? { ...t, completed: true, completedAt: new Date().toISOString() }
        : t
    )

    saveTasks(updatedTasks)

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
            nextDate.setDate(
              nextDate.getDate() + template.customDays
            )
          }

          return {
            ...template,
            nextDueDate: nextDate.toISOString(),
          }
        }

        return template
      })

      saveTemplates(updatedTemplates)
    }
  }

  // ----------------------------
  // CREATE RECURRING
  // ----------------------------

  const createRecurringTemplate = (
    title: string,
    frequency: "weekly" | "monthly" | "custom",
    customDays: number | undefined,
    priority: "low" | "medium" | "high"
  ) => {
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
    saveTemplates(updated)

    toast({
      title: `Recurring task created: ${title}`,
    })
  }

  // ----------------------------
  // FILTERS
  // ----------------------------

  const activeTasks = useMemo(
    () =>
      tasks
        .filter((t) => !t.completed)
        .filter((t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [tasks, searchQuery]
  )

  const completedTasks = tasks.filter((t) => t.completed)

  const upcomingNotifications = tasks.filter((task) => {
    const status = getStatus(task.dueDate)
    return !task.completed && status === "upcoming"
  })

  // ----------------------------
  // UI
  // ----------------------------

  return (
    <div className="p-6 space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          Business Operations
        </h1>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() =>
              setShowNotifications(!showNotifications)
            }
            className="relative"
          >
            🔔
            {upcomingNotifications.length > 0 && (
              <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full px-2">
                {upcomingNotifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 bg-white border rounded-xl shadow-lg p-4 space-y-2 z-50">
              {upcomingNotifications.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No upcoming tasks.
                </p>
              )}

              {upcomingNotifications.map((task) => (
                <div
                  key={task.id}
                  className="text-xs border-b pb-2"
                >
                  <p className="font-medium">{task.title}</p>
                  <p>
                    Due{" "}
                    {new Date(
                      task.dueDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={(e) =>
          setSearchQuery(e.target.value)
        }
        className="w-full border rounded-lg px-4 py-2 text-sm"
      />

      {/* EMPTY STATE */}
      {activeTasks.length === 0 && (
        <div className="text-center py-16 border rounded-xl bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Add tasks to stay on top of your business operations.
          </p>
        </div>
      )}

      {/* ACTIVE TABLE */}
      {activeTasks.length > 0 && (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">
                  Task
                </th>
                <th className="text-left px-4 py-3">
                  Priority
                </th>
                <th className="text-left px-4 py-3">
                  Due
                </th>
                <th className="text-left px-4 py-3">
                  Status
                </th>
                <th className="text-right px-4 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {activeTasks.map((task) => {
                const status = getStatus(
                  task.dueDate
                )

                return (
                  <tr
                    key={task.id}
                    className={`border-t ${
                      task.priority ===
                        "high" &&
                      status === "today"
                        ? "animate-pulse"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-medium">
                      {task.title}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-200">
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(
                        task.dueDate
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {status === "overdue" && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                          Overdue
                        </span>
                      )}
                      {status === "today" && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                          Due Today
                        </span>
                      )}
                      {status === "upcoming" && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                          Upcoming
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() =>
                          completeTask(task)
                        }
                        className="text-xs px-3 py-1 bg-primary text-white rounded-md"
                      >
                        Complete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* COMPLETED */}
      <div>
        <button
          onClick={() =>
            setShowCompleted(!showCompleted)
          }
          className="text-sm font-medium"
        >
          Completed Tasks ({completedTasks.length})
        </button>

        {showCompleted && (
          <div className="mt-4 border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {completedTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-t line-through text-muted-foreground"
                  >
                    <td className="px-4 py-3">
                      {task.title}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(
                        task.completedAt || ""
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECURRING SECTION */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <h2 className="text-lg font-medium">
            Recurring Templates
          </h2>
          <button
            onClick={() =>
              setShowRecurringForm(!showRecurringForm)
            }
            className="text-sm bg-primary text-white px-3 py-1 rounded-md"
          >
            Create Recurring Task
          </button>
        </div>

        {showRecurringForm && (
          <RecurringForm
            onCreate={createRecurringTemplate}
          />
        )}

        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {recurringTemplates.map((template) => (
                <tr key={template.id} className="border-t">
                  <td className="px-4 py-3">
                    {template.title}
                  </td>
                  <td className="px-4 py-3">
                    {template.frequency}
                  </td>
                  <td className="px-4 py-3">
                    Next:{" "}
                    {new Date(
                      template.nextDueDate
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ----------------------------
// RECURRING FORM COMPONENT
// ----------------------------

function RecurringForm({
  onCreate,
}: {
  onCreate: (
    title: string,
    frequency: "weekly" | "monthly" | "custom",
    customDays: number | undefined,
    priority: "low" | "medium" | "high"
  ) => void
}) {
  const [title, setTitle] = useState("")
  const [frequency, setFrequency] =
    useState<"weekly" | "monthly" | "custom">(
      "monthly"
    )
  const [customDays, setCustomDays] =
    useState<number>()
  const [priority, setPriority] =
    useState<"low" | "medium" | "high">(
      "medium"
    )

  return (
    <div className="border rounded-xl p-4 space-y-3">
      <input
        placeholder="Task title"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
        className="w-full border px-3 py-2 rounded-md text-sm"
      />

      <select
        value={frequency}
        onChange={(e) =>
          setFrequency(
            e.target.value as any
          )
        }
        className="w-full border px-3 py-2 rounded-md text-sm"
      >
        <option value="weekly">
          Weekly
        </option>
        <option value="monthly">
          Monthly
        </option>
        <option value="custom">
          Custom
        </option>
      </select>

      {frequency === "custom" && (
        <input
          type="number"
          placeholder="Every X days"
          onChange={(e) =>
            setCustomDays(
              Number(e.target.value)
            )
          }
          className="w-full border px-3 py-2 rounded-md text-sm"
        />
      )}

      <select
        value={priority}
        onChange={(e) =>
          setPriority(
            e.target.value as any
          )
        }
        className="w-full border px-3 py-2 rounded-md text-sm"
      >
        <option value="low">Low</option>
        <option value="medium">
          Medium
        </option>
        <option value="high">
          High
        </option>
      </select>

      <button
        onClick={() =>
          onCreate(
            title,
            frequency,
            customDays,
            priority
          )
        }
        className="w-full bg-primary text-white py-2 rounded-md text-sm"
      >
        Create
      </button>
    </div>
  )
}
