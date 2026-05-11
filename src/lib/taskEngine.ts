// src/lib/taskEngine.ts

export type TaskPriority = "low" | "medium" | "high";
export type Frequency = "daily" | "weekly" | "monthly" | "custom";

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: TaskPriority;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  fromRecurring?: boolean;
  notes?: string;
  externalLink?: string;
  tags?: string[];
  blockedBy?: string[];
  isOverdue?: boolean;
}

export interface RecurringTemplate {
  id: string;
  title: string;
  frequency: Frequency;
  customDays?: number;
  nextDueDate: string;
  priority: TaskPriority;
  createdAt: string;
  lastFired?: string;
}

/**
 * Helper to calculate the next date based on frequency
 */
export const calculateNextDate = (currentDate: string, template: Partial<RecurringTemplate>): string => {
  const date = new Date(currentDate);
  switch (template.frequency) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "custom":
      if (template.customDays) date.setDate(date.getDate() + template.customDays);
      break;
  }
  return date.toISOString();
};

export const generateRecurringTasks = (
  templates: RecurringTemplate[],
  existingTasks: Task[]
) => {
  const today = new Date();
  const newTasks: Task[] = [];
  const updatedTemplates: RecurringTemplate[] = templates.map((template) => {
    let currentNextDue = new Date(template.nextDueDate);
    let tempTemplate = { ...template };

    // Use a while loop in case multiple periods have passed since last login
    while (currentNextDue <= today) {
      const alreadyExists = existingTasks.some(
        (t) => t.title === tempTemplate.title && t.dueDate === tempTemplate.nextDueDate
      );

      if (!alreadyExists) {
        newTasks.push({
          id: crypto.randomUUID(),
          title: tempTemplate.title,
          dueDate: tempTemplate.nextDueDate,
          priority: tempTemplate.priority,
          completed: false,
          createdAt: new Date().toISOString(),
          fromRecurring: true,
        });
      }

      // Increment the template for the next check
      const nextDateStr = calculateNextDate(tempTemplate.nextDueDate, tempTemplate);
      tempTemplate.nextDueDate = nextDateStr;
      currentNextDue = new Date(nextDateStr);
    }
    return { ...tempTemplate, lastFired: new Date().toISOString() };
  });

  return { newTasks, updatedTemplates };
};

/**
 * Check if a task is overdue
 */
export const isTaskOverdue = (task: Task): boolean => {
  if (task.completed) return false;
  return new Date(task.dueDate) < new Date();
};

/**
 * Bump priority for overdue tasks
 */
export const getBumpedPriority = (task: Task): TaskPriority => {
  if (!isTaskOverdue(task)) return task.priority;
  if (task.priority === "high") return "high";
  if (task.priority === "medium") return "high";
  return "medium";
};

/**
 * Calculate operational KPIs
 */
export const calculateKPIs = (tasks: Task[], templates: RecurringTemplate[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasks = tasks.filter(t => !t.completed && new Date(t.dueDate) < today);
  const dueTodayTasks = tasks.filter(t => !t.completed && new Date(t.dueDate).toDateString() === today.toDateString());
  const completedToday = tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt).toDateString() === today.toDateString());
  const tasksFromAutomation = tasks.filter(t => t.fromRecurring);

  const totalTasksToday = dueTodayTasks.length + completedToday.length;
  const completionRate = totalTasksToday > 0 ? Math.round((completedToday.length / totalTasksToday) * 100) : 0;

  return {
    overdue: overdueTasks.length,
    dueToday: dueTodayTasks.length,
    completionRate,
    automationPulse: tasksFromAutomation.length,
  };
};
