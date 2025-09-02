/**
 * Task Management Dialog
 * Display and manage tasks extracted from notes
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { Note, Task } from '@/lib/types';
import { TaskManager } from '@/lib/task-manager';
import { useNotesStore } from '@/stores/use-notes';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface TaskManagementProps {
  note: Note;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const getPriorityColor = (priority: Task['priority']) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-700 border-red-200';
    case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getPriorityText = (priority: Task['priority']) => {
  switch (priority) {
    case 'high': return 'উচ্চ';
    case 'medium': return 'মাঝারি';
    case 'low': return 'কম';
    default: return 'সাধারণ';
  }
};

export function TasksDialog({ note, isOpen, onOpenChange }: TaskManagementProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { updateNote } = useNotesStore();

  useEffect(() => {
    if (isOpen && note) {
      // Extract tasks from note content
      const extractedTasks = TaskManager.extractTasksFromNote(note);
      const existingTasks = note.tasks || [];
      
      // Merge existing and extracted tasks
      const allTasks = TaskManager.mergeTasks(existingTasks, extractedTasks);
      setTasks(allTasks);
    }
  }, [isOpen, note]);

  const handleToggleTask = async (taskId: string) => {
    setIsLoading(true);
    try {
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      
      setTasks(updatedTasks);
      await updateNote(note.id, { tasks: updatedTasks });
      
      const task = updatedTasks.find(t => t.id === taskId);
      toast.success(
        task?.completed ? 'কাজ সম্পন্ন করা হয়েছে' : 'কাজ অসম্পন্ন চিহ্নিত করা হয়েছে'
      );
    } catch (error) {
      toast.error('কাজের অবস্থা পরিবর্তন করা যায়নি');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePriority = async (taskId: string, newPriority: Task['priority']) => {
    setIsLoading(true);
    try {
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, priority: newPriority } : task
      );
      
      setTasks(updatedTasks);
      await updateNote(note.id, { tasks: updatedTasks });
      toast.success('কাজের অগ্রাধিকার পরিবর্তন করা হয়েছে');
    } catch (error) {
      toast.error('অগ্রাধিকার পরিবর্তন করা যায়নি');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setIsLoading(true);
    try {
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      await updateNote(note.id, { tasks: updatedTasks });
      toast.success('কাজ মুছে ফেলা হয়েছে');
    } catch (error) {
      toast.error('কাজ মুছে ফেলা যায়নি');
    } finally {
      setIsLoading(false);
    }
  };

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.CheckSquare className="h-5 w-5" />
            কাজের তালিকা - {note.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">অগ্রগতি</span>
              <span className="text-2xl font-bold">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>সম্পন্ন: {completedTasks.length}</span>
              <span>বাকি: {pendingTasks.length}</span>
              <span>মোট: {tasks.length}</span>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icons.CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">কোন কাজ পাওয়া যায়নি</p>
              <p className="text-sm">
                নোটে চেকলিস্ট যোগ করুন অথবা "কাজ:" দিয়ে প্যারাগ্রাফ শুরু করুন
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Pending Tasks */}
              {pendingTasks.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wide">
                    অসম্পন্ন কাজ ({pendingTasks.length})
                  </h3>
                  <div className="space-y-2">
                    {pendingTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => handleToggleTask(task.id)}
                          disabled={isLoading}
                        >
                          <Icons.Circle className="h-4 w-4" />
                        </Button>
                        
                        <div className="flex-1">
                          <p className="text-sm font-medium">{task.title}</p>
                          {task.dueDate && (
                            <p className="text-xs text-muted-foreground">
                              শেষ তারিখ: {new Date(task.dueDate).toLocaleDateString('bn-BD')}
                            </p>
                          )}
                        </div>
                        
                        <Badge 
                          variant="outline"
                          className={getPriorityColor(task.priority)}
                        >
                          {getPriorityText(task.priority)}
                        </Badge>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Icons.Trash className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wide">
                    সম্পন্ন কাজ ({completedTasks.length})
                  </h3>
                  <div className="space-y-2">
                    {completedTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-green-50/50 opacity-75"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => handleToggleTask(task.id)}
                          disabled={isLoading}
                        >
                          <Icons.CheckSquare className="h-4 w-4 text-green-600" />
                        </Button>
                        
                        <div className="flex-1">
                          <p className="text-sm font-medium line-through text-muted-foreground">
                            {task.title}
                          </p>
                        </div>
                        
                        <Badge 
                          variant="outline"
                          className="bg-green-100 text-green-700 border-green-200"
                        >
                          সম্পন্ন
                        </Badge>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Icons.Trash className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {tasks.length > 0 && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Mark all as complete
                  const allCompleted = tasks.map(task => ({ ...task, completed: true }));
                  setTasks(allCompleted);
                  updateNote(note.id, { tasks: allCompleted });
                  toast.success('সব কাজ সম্পন্ন চিহ্নিত করা হয়েছে');
                }}
                disabled={pendingTasks.length === 0}
              >
                <Icons.CheckSquare className="h-4 w-4 mr-1" />
                সব সম্পন্ন
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Reset all tasks
                  const allPending = tasks.map(task => ({ ...task, completed: false }));
                  setTasks(allPending);
                  updateNote(note.id, { tasks: allPending });
                  toast.success('সব কাজ রিসেট করা হয়েছে');
                }}
                disabled={completedTasks.length === 0}
              >
                <Icons.RotateCcw className="h-4 w-4 mr-1" />
                রিসেট
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TasksDialog;
