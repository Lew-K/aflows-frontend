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
}

export interface RecurringTemplate {
  id: string;
  title: string;
  frequency: Frequency;
  customDays?: number;
  nextDueDate: string;
  priority: TaskPriority;
  createdAt: string;
}

/** * Helper to calculate the next date based on frequency 
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
    return tempTemplate;
  });

  return { newTasks, updatedTemplates };
};
