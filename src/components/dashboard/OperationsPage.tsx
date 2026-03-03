"use client"

import { useEffect, useMemo, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import {
  Task,
  RecurringTemplate,
  generateRecurringTasks,
  calculateNextDate,
  TaskPriority,
  Frequency
} from "@/lib/taskEngine"

const BUSINESS_ID = "default";

export default function OperationsPage() {
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [recurringTemplates, setRecurringTemplates] = useState<RecurringTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showCompleted, setShowCompleted] = useState(false)
  const [showRecurringForm, setShowRecurringForm] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // Initialization
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem(`aflows_tasks_${BUSINESS_ID}`) || "[]");
    const savedTemplates = JSON.parse(localStorage.getItem(`aflows_recurring_${BUSINESS_ID}`) || "[]");

    const { newTasks, updatedTemplates } = generateRecurringTasks(savedTemplates, savedTasks);
    const allTasks = [...savedTasks, ...newTasks];

    setTasks(allTasks);
    setRecurringTemplates(updatedTemplates);

    localStorage.setItem(`aflows_tasks_${BUSINESS_ID}`, JSON.stringify(allTasks));
    localStorage.setItem(`aflows_recurring_${BUSINESS_ID}`, JSON.stringify(updatedTemplates));

    if (newTasks.length > 0) {
      toast({ title: `${newTasks.length} recurring tasks generated.` });
    }
  }, []);

  const getStatus = (dueDate: string) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const due = new Date(dueDate).setHours(0, 0, 0, 0);

    if (due < today) return "overdue";
    if (due === today) return "today";
    return "upcoming";
  };

  const completeTask = (task: Task) => {
    const updatedTasks = tasks.map((t) =>
      t.id === task.id ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
    );
    setTasks(updatedTasks);
    localStorage.setItem(`aflows_tasks_${BUSINESS_ID}`, JSON.stringify(updatedTasks));

    if (task.fromRecurring) {
      const updatedTemplates = recurringTemplates.map((template) => 
        template.title === task.title 
          ? { ...template, nextDueDate: calculateNextDate(template.nextDueDate, template) }
          : template
      );
      setRecurringTemplates(updatedTemplates);
      localStorage.setItem(`aflows_recurring_${BUSINESS_ID}`, JSON.stringify(updatedTemplates));
    }
  };

  const createRecurringTemplate = (title: string, frequency: Frequency, customDays: number | undefined, priority: TaskPriority) => {
    const newTemplate: RecurringTemplate = {
      id: crypto.randomUUID(),
      title, frequency, customDays, priority,
      nextDueDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const updated = [...recurringTemplates, newTemplate];
    setRecurringTemplates(updated);
    localStorage.setItem(`aflows_recurring_${BUSINESS_ID}`, JSON.stringify(updated));
    setShowRecurringForm(false);
  };

  const filteredTasks = useMemo(() => 
    tasks.filter(t => !t.completed && t.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [tasks, searchQuery]
  );

  const upcomingNotifications = tasks.filter(t => !t.completed && getStatus(t.dueDate) === "upcoming");

  return (
    <div className="p-6 space-y-8">
      {/* Header and Notifications UI remains similar, but use filteredTasks and upcomingNotifications variables */}
      <div className="flex justify-between items-center">
         <h1 className="text-xl font-semibold">Business Operations</h1>
         <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)}>
              🔔 {upcomingNotifications.length > 0 && <span className="bg-red-500 text-white p-1 rounded-full text-[10px]">{upcomingNotifications.length}</span>}
            </button>
            {/* Notification Dropdown logic... */}
         </div>
      </div>

      <input 
        className="w-full border p-2 rounded" 
        placeholder="Search tasks..." 
        value={searchQuery} 
        onChange={(e) => setSearchQuery(e.target.value)} 
      />

      {/* Task Table Logic using filteredTasks.map(...) */}
      {/* ... */}
      
      {showRecurringForm && <RecurringForm onCreate={createRecurringTemplate} />}
    </div>
  )
}

// Sub-component for form
function RecurringForm({ onCreate }: { onCreate: any }) {
    // Keep your existing form state/UI here
    return (<div>...</div>);
}
