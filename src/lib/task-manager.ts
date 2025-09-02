/**
 * Task Management System
 * Convert notes to actionable tasks and manage them
 */

import { Task, Note, EditorOutputData } from './types';

export class TaskManager {
  /**
   * Extract tasks from note content
   */
  static extractTasksFromNote(note: Note): Task[] {
    const tasks: Task[] = [];
    
    if (!note.content?.blocks) return tasks;

    note.content.blocks.forEach((block, index) => {
      if (block.type === 'checklist' && block.data.items) {
        block.data.items.forEach((item: any, itemIndex: number) => {
          const taskId = `${note.id}_${index}_${itemIndex}`;
          
          tasks.push({
            id: taskId,
            title: item.text || 'নামহীন কাজ',
            completed: item.checked || false,
            priority: this.extractPriority(item.text),
            dueDate: this.extractDueDate(item.text),
            createdAt: Date.now()
          });
        });
      }
      
      // Extract tasks from paragraphs that look like tasks
      if (block.type === 'paragraph' && block.data.text) {
        const taskPattern = /^[\[\(]?\s*(?:todo|কাজ|task)[\]\)]?\s*:?\s*(.+)/i;
        const match = block.data.text.match(taskPattern);
        
        if (match) {
          const taskId = `${note.id}_para_${index}`;
          
          tasks.push({
            id: taskId,
            title: match[1].trim(),
            completed: false,
            priority: this.extractPriority(match[1]),
            dueDate: this.extractDueDate(match[1]),
            createdAt: Date.now()
          });
        }
      }
    });

    return tasks;
  }

  /**
   * Extract priority from text
   */
  private static extractPriority(text: string): 'low' | 'medium' | 'high' {
    const highKeywords = ['জরুরি', 'গুরুত্বপূর্ণ', 'urgent', 'important', 'high', 'critical'];
    const mediumKeywords = ['মাঝারি', 'medium', 'normal'];
    
    const lowerText = text.toLowerCase();
    
    if (highKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'high';
    }
    
    if (mediumKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Extract due date from text
   */
  private static extractDueDate(text: string): number | undefined {
    // Simple date extraction patterns
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,  // DD/MM/YYYY
      /(\d{1,2})-(\d{1,2})-(\d{4})/,   // DD-MM-YYYY
      /(আজ|today)/i,
      /(আগামীকাল|tomorrow)/i,
      /(\d+)\s*(দিন|days?)\s*(পর|later)/i
    ];

    const today = new Date();
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        if (match[0].match(/(আজ|today)/i)) {
          return today.getTime();
        }
        
        if (match[0].match(/(আগামীকাল|tomorrow)/i)) {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          return tomorrow.getTime();
        }
        
        if (match[3] && match[1] && match[2]) {
          // DD/MM/YYYY format
          const day = parseInt(match[1]);
          const month = parseInt(match[2]) - 1; // JS months are 0-indexed
          const year = parseInt(match[3]);
          
          const date = new Date(year, month, day);
          return date.getTime();
        }
        
        if (match[1] && match[0].includes('দিন')) {
          const days = parseInt(match[1]);
          const futureDate = new Date(today);
          futureDate.setDate(futureDate.getDate() + days);
          return futureDate.getTime();
        }
      }
    }
    
    return undefined;
  }

  /**
   * Convert tasks back to checklist blocks
   */
  static tasksToChecklistBlocks(tasks: Task[]): any[] {
    const blocks = [];
    
    if (tasks.length > 0) {
      const items = tasks.map(task => ({
        text: this.formatTaskText(task),
        checked: task.completed
      }));
      
      blocks.push({
        type: 'checklist',
        data: { items }
      });
    }
    
    return blocks;
  }

  /**
   * Format task text with priority and due date
   */
  private static formatTaskText(task: Task): string {
    let text = task.title;
    
    // Add priority indicator
    if (task.priority === 'high') {
      text = `🔴 ${text}`;
    } else if (task.priority === 'medium') {
      text = `🟡 ${text}`;
    }
    
    // Add due date
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        text += ' (আজ)';
      } else if (diffDays === 1) {
        text += ' (আগামীকাল)';
      } else if (diffDays > 0) {
        text += ` (${diffDays} দিন পর)`;
      } else {
        text += ' (সময় শেষ)';
      }
    }
    
    return text;
  }

  /**
   * Create a task note from a task
   */
  static createTaskNote(task: Task): Partial<Note> {
    const content: EditorOutputData = {
      version: '2.28.2',
      time: Date.now(),
      blocks: [
        {
          type: 'header',
          data: {
            text: task.title,
            level: 2
          }
        },
        {
          type: 'paragraph',
          data: {
            text: `অগ্রাধিকার: ${this.getPriorityText(task.priority)}`
          }
        }
      ]
    };

    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      content.blocks.push({
        type: 'paragraph',
        data: {
          text: `শেষ তারিখ: ${dueDate.toLocaleDateString('bn-BD')}`
        }
      });
    }

    content.blocks.push({
      type: 'checklist',
      data: {
        items: [
          {
            text: 'কাজটি সম্পূর্ণ করুন',
            checked: task.completed
          }
        ]
      }
    });

    return {
      title: `কাজ: ${task.title}`,
      content,
      tags: ['কাজ', 'task'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  /**
   * Get priority text in Bengali
   */
  private static getPriorityText(priority: 'low' | 'medium' | 'high'): string {
    switch (priority) {
      case 'high': return 'উচ্চ 🔴';
      case 'medium': return 'মাঝারি 🟡';
      case 'low': return 'নিম্ন 🟢';
      default: return 'মাঝারি';
    }
  }

  /**
   * Get tasks grouped by status
   */
  static groupTasksByStatus(tasks: Task[]): {
    pending: Task[];
    completed: Task[];
    overdue: Task[];
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    
    return {
      pending: tasks.filter(task => !task.completed && (!task.dueDate || task.dueDate >= todayTimestamp)),
      completed: tasks.filter(task => task.completed),
      overdue: tasks.filter(task => !task.completed && task.dueDate && task.dueDate < todayTimestamp)
    };
  }

  /**
   * Get tasks grouped by priority
   */
  static groupTasksByPriority(tasks: Task[]): {
    high: Task[];
    medium: Task[];
    low: Task[];
  } {
    return {
      high: tasks.filter(task => task.priority === 'high'),
      medium: tasks.filter(task => task.priority === 'medium'),
      low: tasks.filter(task => task.priority === 'low')
    };
  }

  /**
   * Calculate task completion percentage
   */
  static getCompletionPercentage(tasks: Task[]): number {
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  }

  /**
   * Get upcoming tasks (next 7 days)
   */
  static getUpcomingTasks(tasks: Task[], days: number = 7): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    const futureDate = todayTimestamp + (days * 24 * 60 * 60 * 1000);
    
    return tasks.filter(task => 
      !task.completed && 
      task.dueDate && 
      task.dueDate >= todayTimestamp && 
      task.dueDate <= futureDate
    ).sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0));
  }
  
  /**
   * Merge existing tasks with newly extracted tasks
   */
  static mergeTasks(existingTasks: Task[], extractedTasks: Task[]): Task[] {
    const taskMap = new Map<string, Task>();
    
    // Add existing tasks to map first
    for (const task of existingTasks) {
      taskMap.set(task.title, task);
    }
    
    // Add or update with extracted tasks
    for (const task of extractedTasks) {
      if (taskMap.has(task.title)) {
        // If task exists, update its 'completed' status from note
        const existing = taskMap.get(task.title)!;
        taskMap.set(task.title, { ...existing, completed: task.completed });
      } else {
        // If it's a new task, add it
        taskMap.set(task.title, task);
      }
    }
    
    return Array.from(taskMap.values());
  }
}
