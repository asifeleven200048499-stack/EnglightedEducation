import { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Circle,
  AlertCircle,
  MoreHorizontal,
  Edit2,
  Trash2,
  Flag,
  ArrowUpCircle,
  ArrowDownCircle,
  MinusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TASK_PRIORITIES, TASK_STATUSES } from '@/lib/constants';
import { getPriorityColor, formatDate, getInitials, getAvatarColor } from '@/lib/utils';
import type { Task, TaskStatus, TaskPriority } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TasksViewProps {
  store: any;
  setShowTaskModal: (show: boolean) => void;
}

export function TasksView({ store, setShowTaskModal }: TasksViewProps) {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const tasks = store.tasks;
  const filteredTasks = tasks.filter((task: Task) => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    return true;
  });

  const pendingTasks = tasks.filter((t: Task) => t.status !== 'completed');
  const completedTasks = tasks.filter((t: Task) => t.status === 'completed');
  const overdueTasks = tasks.filter((t: Task) => {
    if (t.status === 'completed') return false;
    return new Date(t.dueDate) < new Date();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-500">Manage your follow-ups and to-dos</p>
        </div>
        <Button size="sm" onClick={() => setShowTaskModal(true)} className="bg-emerald-600 hover:bg-emerald-700 self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Tasks</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pending</p>
                <p className="text-2xl font-bold text-blue-600">{pendingTasks.length}</p>
              </div>
              <Circle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Completed</p>
                <p className="text-2xl font-bold text-emerald-600">{completedTasks.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Search tasks..." className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | 'all')}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {TASK_STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TaskPriority | 'all')}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {TASK_PRIORITIES.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="overdue" className="text-red-600">
            Overdue ({overdueTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <TaskList tasks={filteredTasks} store={store} onEdit={setEditingTask} />
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <TaskList tasks={filteredTasks.filter((t: Task) => t.status !== 'completed')} store={store} onEdit={setEditingTask} />
        </TabsContent>
        <TabsContent value="overdue" className="mt-4">
          <TaskList tasks={overdueTasks} store={store} onEdit={setEditingTask} />
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <TaskList tasks={completedTasks} store={store} onEdit={setEditingTask} />
        </TabsContent>
      </Tabs>

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          open={!!editingTask}
          onClose={() => setEditingTask(null)}
          store={store}
        />
      )}
    </div>
  );
}

// ============================================
// Task List Component
// ============================================
function TaskList({ tasks, store, onEdit }: { tasks: Task[]; store: any; onEdit: (task: Task) => void }) {
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <Card key={task.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <button
                onClick={() => store.completeTask(task.id)}
                className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  task.status === 'completed'
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-slate-300 hover:border-emerald-500'
                }`}
              >
                {task.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {task.title}
                  </h4>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  {new Date(task.dueDate) < new Date() && task.status !== 'completed' && (
                    <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-500 mb-2">{task.description}</p>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Due {formatDate(task.dueDate)}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {task.assignedTo}
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => store.completeTask(task.id)}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark Complete
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => store.deleteTask(task.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
      {tasks.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No tasks found</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// Task Modal
// ============================================
export function TaskModal({ open, onClose, store }: { open: boolean; onClose: () => void; store: any }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedTo: 'Admin'
  });

  const handleSubmit = () => {
    store.createTask({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      dueDate: new Date(formData.dueDate),
      assignedTo: formData.assignedTo
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Task title"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Task description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(v) => setFormData({...formData, priority: v as TaskPriority})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input 
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.title}
            className="w-full bg-emerald-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Edit Task Modal
// ============================================
function EditTaskModal({ task, open, onClose, store }: { task: Task; open: boolean; onClose: () => void; store: any }) {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    dueDate: new Date(task.dueDate).toISOString().split('T')[0],
    status: task.status
  });

  const handleSubmit = () => {
    store.updateTask(task.id, {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      dueDate: new Date(formData.dueDate),
      status: formData.status
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(v) => setFormData({...formData, priority: v as TaskPriority})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v) => setFormData({...formData, status: v as TaskStatus})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Due Date</Label>
            <Input 
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="flex-1 bg-emerald-600">
              Save Changes
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
