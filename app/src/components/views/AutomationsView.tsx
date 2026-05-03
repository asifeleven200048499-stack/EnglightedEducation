import { useState } from 'react';
import {
  Zap,
  Plus,
  Play,
  Pause,
  Edit2,
  Trash2,
  MoreHorizontal,
  MessageSquare,
  Tag,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  GripVertical,
  Copy,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AUTOMATION_TRIGGERS, AUTOMATION_ACTIONS, CONTACT_TAGS } from '@/lib/constants';
import type { Automation } from '@/types';

interface AutomationsViewProps {
  store: any;
}

export function AutomationsView({ store }: AutomationsViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

  const automations = store.automations;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Automations</h1>
          <p className="text-slate-500">Set up automated workflows and sequences</p>
        </div>
        <Button size="sm" onClick={() => setShowCreateModal(true)} className="bg-emerald-600 hover:bg-emerald-700 self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create Automation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Automations</p>
                <p className="text-2xl font-bold">{automations.length}</p>
              </div>
              <Zap className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Active</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {automations.filter((a: Automation) => a.isActive).length}
                </p>
              </div>
              <Play className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Paused</p>
                <p className="text-2xl font-bold text-slate-600">
                  {automations.filter((a: Automation) => !a.isActive).length}
                </p>
              </div>
              <Pause className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {automations.map((automation: Automation) => (
          <Card key={automation.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{automation.name}</h3>
                    <Badge className={automation.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}>
                      {automation.isActive ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                  <p className="text-slate-500 text-sm mb-4">{automation.description}</p>

                  {/* Workflow Visual */}
                  <div className="flex items-center gap-2 flex-wrap overflow-x-auto">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        {AUTOMATION_TRIGGERS.find(t => t.value === automation.trigger.type)?.label}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    {automation.actions.map((action, idx) => (
                      <div key={action.id} className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border">
                          {action.type === 'send-message' && <MessageSquare className="w-4 h-4" />}
                          {action.type === 'add-tag' && <Tag className="w-4 h-4" />}
                          {action.type === 'wait' && <Clock className="w-4 h-4" />}
                          <span className="text-sm">
                            {AUTOMATION_ACTIONS.find(a => a.value === action.type)?.label}
                          </span>
                        </div>
                        {idx < automation.actions.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Switch 
                    checked={automation.isActive}
                    onCheckedChange={() => store.toggleAutomation(automation.id)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingAutomation(automation)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => store.deleteAutomation(automation.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Automation Modal */}
      <CreateAutomationModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        store={store}
      />
    </div>
  );
}

// ============================================
// Create Automation Modal
// ============================================
function CreateAutomationModal({ open, onClose, store }: { open: boolean; onClose: () => void; store: any }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    triggerType: 'new-contact' as const,
    triggerConfig: {} as Record<string, any>,
    actions: [] as { type: string; config: Record<string, any> }[]
  });

  const addAction = (type: string) => {
    setFormData({
      ...formData,
      actions: [...formData.actions, { type, config: {} }]
    });
  };

  const updateAction = (index: number, config: Record<string, any>) => {
    const newActions = [...formData.actions];
    newActions[index].config = config;
    setFormData({ ...formData, actions: newActions });
  };

  const removeAction = (index: number) => {
    setFormData({
      ...formData,
      actions: formData.actions.filter((_, i) => i !== index)
    });
  };

  const handleCreate = () => {
    store.createAutomation({
      name: formData.name,
      description: formData.description,
      trigger: {
        type: formData.triggerType,
        config: formData.triggerConfig
      },
      actions: formData.actions.map((a, i) => ({
        id: `action-${i}`,
        type: a.type,
        config: a.config,
        order: i
      })),
      isActive: false
    });
    onClose();
    setStep(1);
    setFormData({
      name: '',
      description: '',
      triggerType: 'new-contact',
      triggerConfig: {},
      actions: []
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Create Automation</DialogTitle>
          <DialogDescription>Step {step} of 3</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Automation Name *</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Welcome New Contacts"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="What does this automation do?"
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={() => setStep(2)}
                disabled={!formData.name}
                className="bg-emerald-600"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>Trigger *</Label>
              <Select 
                value={formData.triggerType} 
                onValueChange={(v) => setFormData({...formData, triggerType: v as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUTOMATION_TRIGGERS.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-500 mt-1">
                {AUTOMATION_TRIGGERS.find(t => t.value === formData.triggerType)?.description}
              </p>
            </div>

            {(formData.triggerType as string) === 'tag-added' && (
              <div>
                <Label>Tag</Label>
                <Select 
                  value={formData.triggerConfig.tag} 
                  onValueChange={(v) => setFormData({...formData, triggerConfig: {tag: v}})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_TAGS.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)} className="bg-emerald-600">
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>Actions</Label>
              <p className="text-sm text-slate-500 mb-2">Add actions to perform when triggered</p>
              
              <div className="space-y-2">
                {formData.actions.map((action, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    <GripVertical className="w-4 h-4 text-slate-400" />
                    <div className="flex-1">
                      <p className="font-medium">
                        {AUTOMATION_ACTIONS.find(a => a.value === action.type)?.label}
                      </p>
                      {action.type === 'send-message' && (
                        <Textarea 
                          value={action.config.message || ''}
                          onChange={(e) => updateAction(idx, {message: e.target.value})}
                          placeholder="Message content..."
                          className="mt-2 text-sm"
                        />
                      )}
                      {action.type === 'add-tag' && (
                        <Select 
                          value={action.config.tag} 
                          onValueChange={(v) => updateAction(idx, {tag: v})}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select tag" />
                          </SelectTrigger>
                          <SelectContent>
                            {CONTACT_TAGS.map(t => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {action.type === 'wait' && (
                        <div className="flex items-center gap-2 mt-2">
                          <Input 
                            type="number"
                            value={action.config.duration || ''}
                            onChange={(e) => updateAction(idx, {duration: parseInt(e.target.value)})}
                            placeholder="Duration"
                            className="w-24"
                          />
                          <span className="text-sm text-slate-500">minutes</span>
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeAction(idx)}>
                      <XCircle className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {AUTOMATION_ACTIONS.map(action => (
                  <Button
                    key={action.value}
                    variant="outline"
                    size="sm"
                    onClick={() => addAction(action.value)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button 
                onClick={handleCreate}
                disabled={formData.actions.length === 0}
                className="bg-emerald-600"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Create Automation
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
