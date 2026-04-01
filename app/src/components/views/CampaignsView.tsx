import { useState } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Send,
  Users,
  CheckCircle2,
  Eye,
  MessageSquare,
  BarChart3,
  Trash2,
  Edit2,
  Copy,
  Clock,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getStatusColor, truncate } from '@/lib/utils';
import { CAMPAIGN_STATUSES, MESSAGE_TEMPLATES, CONTACT_TAGS } from '@/lib/constants';
import type { Campaign, CampaignStatus } from '@/types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { CHART_COLORS } from '@/lib/constants';

interface CampaignsViewProps {
  store: any;
  setShowCampaignModal: (show: boolean) => void;
}

export function CampaignsView({ store, setShowCampaignModal }: CampaignsViewProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const campaigns = store.campaigns;
  const filteredCampaigns = statusFilter === 'all' 
    ? campaigns 
    : campaigns.filter((c: Campaign) => c.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-slate-500">Create and manage your WhatsApp campaigns</p>
        </div>
        <Button size="sm" onClick={() => setShowCampaignModal(true)} className="bg-emerald-600 hover:bg-emerald-700 self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Campaigns</p>
                <p className="text-2xl font-bold">{campaigns.length}</p>
              </div>
              <Megaphone className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Running</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {campaigns.filter((c: Campaign) => c.status === 'running').length}
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
                <p className="text-sm text-slate-500">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">
                  {campaigns.filter((c: Campaign) => c.status === 'scheduled').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Completed</p>
                <p className="text-2xl font-bold text-purple-600">
                  {campaigns.filter((c: Campaign) => c.status === 'completed').length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Search campaigns..." className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CampaignStatus | 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {CAMPAIGN_STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <div className="space-y-4">
        {filteredCampaigns.map((campaign: Campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{campaign.name}</h3>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                    {campaign.abTestEnabled && (
                      <Badge variant="outline">A/B Test</Badge>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm mb-4">{campaign.description}</p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 mb-4">
                    <div className="text-center p-2 sm:p-3 bg-slate-50 rounded-lg">
                      <p className="text-lg sm:text-2xl font-bold">{campaign.totalRecipients}</p>
                      <p className="text-xs text-slate-500">Recipients</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                      <p className="text-lg sm:text-2xl font-bold text-blue-600">{campaign.sentCount}</p>
                      <p className="text-xs text-slate-500">Sent</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-emerald-50 rounded-lg">
                      <p className="text-lg sm:text-2xl font-bold text-emerald-600">{campaign.deliveredCount}</p>
                      <p className="text-xs text-slate-500">Delivered</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-purple-50 rounded-lg">
                      <p className="text-lg sm:text-2xl font-bold text-purple-600">{campaign.readCount}</p>
                      <p className="text-xs text-slate-500">Read</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-orange-50 rounded-lg col-span-3 sm:col-span-1">
                      <p className="text-lg sm:text-2xl font-bold text-orange-600">{campaign.repliedCount}</p>
                      <p className="text-xs text-slate-500">Replied</p>
                    </div>
                  </div>

                  {/* Progress */}
                  {campaign.status === 'running' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-medium">
                          {Math.round((campaign.sentCount / campaign.totalRecipients) * 100)}%
                        </span>
                      </div>
                      <Progress value={(campaign.sentCount / campaign.totalRecipients) * 100} className="h-2" />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {campaign.status === 'draft' && (
                    <Button size="sm" className="bg-emerald-600">
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                  )}
                  {campaign.status === 'running' && (
                    <Button size="sm" variant="outline">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedCampaign(campaign)}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
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

      {/* Campaign Analytics Modal */}
      {selectedCampaign && (
        <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Campaign Analytics: {selectedCampaign.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-3xl font-bold">{selectedCampaign.sentCount}</p>
                  <p className="text-sm text-slate-500">Sent</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <p className="text-3xl font-bold text-emerald-600">
                    {Math.round((selectedCampaign.deliveredCount / selectedCampaign.sentCount) * 100) || 0}%
                  </p>
                  <p className="text-sm text-slate-500">Delivery Rate</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">
                    {Math.round((selectedCampaign.readCount / selectedCampaign.deliveredCount) * 100) || 0}%
                  </p>
                  <p className="text-sm text-slate-500">Read Rate</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-3xl font-bold text-orange-600">
                    {Math.round((selectedCampaign.repliedCount / selectedCampaign.readCount) * 100) || 0}%
                  </p>
                  <p className="text-sm text-slate-500">Reply Rate</p>
                </div>
              </div>

              {/* Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Sent', value: selectedCampaign.sentCount },
                    { name: 'Delivered', value: selectedCampaign.deliveredCount },
                    { name: 'Read', value: selectedCampaign.readCount },
                    { name: 'Replied', value: selectedCampaign.repliedCount },
                    { name: 'Failed', value: selectedCampaign.failedCount }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ============================================
// Campaign Modal
// ============================================
export function CampaignModal({ open, onClose, store }: { open: boolean; onClose: () => void; store: any }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    messageTemplate: '',
    targetTags: [] as string[],
    targetSegments: [] as string[],
    scheduledAt: null as Date | null,
    abTestEnabled: false,
    variantA: '',
    variantB: ''
  });

  const handleCreate = () => {
    store.createCampaign({
      name: formData.name,
      description: formData.description,
      messageTemplate: formData.messageTemplate,
      targetTags: formData.targetTags,
      targetSegments: formData.targetSegments,
      status: 'draft',
      abTestEnabled: formData.abTestEnabled,
      variantA: formData.variantA,
      variantB: formData.variantB
    });
    onClose();
    setStep(1);
    setFormData({
      name: '',
      description: '',
      messageTemplate: '',
      targetTags: [],
      targetSegments: [],
      scheduledAt: null,
      abTestEnabled: false,
      variantA: '',
      variantB: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>Step {step} of 3</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Campaign Name *</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Summer Admission Drive"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="What is this campaign about?"
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
              <Label>Message Template *</Label>
              <Textarea 
                value={formData.messageTemplate}
                onChange={(e) => setFormData({...formData, messageTemplate: e.target.value})}
                placeholder="Hi {{name}}! ..."
                className="min-h-[100px]"
              />
              <p className="text-xs text-slate-500 mt-1">
                Use {'{{name}}'}, {'{{course}}'} as placeholders
              </p>
            </div>

            <div>
              <Label>Quick Templates</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {MESSAGE_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => setFormData({...formData, messageTemplate: tpl.content})}
                    className="px-3 py-1 text-sm border rounded-full hover:bg-slate-50"
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch 
                checked={formData.abTestEnabled}
                onCheckedChange={(v) => setFormData({...formData, abTestEnabled: v})}
              />
              <Label>Enable A/B Testing</Label>
            </div>

            {formData.abTestEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Variant A</Label>
                  <Textarea 
                    value={formData.variantA}
                    onChange={(e) => setFormData({...formData, variantA: e.target.value})}
                    placeholder="Message variant A"
                  />
                </div>
                <div>
                  <Label>Variant B</Label>
                  <Textarea 
                    value={formData.variantB}
                    onChange={(e) => setFormData({...formData, variantB: e.target.value})}
                    placeholder="Message variant B"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button 
                onClick={() => setStep(3)}
                disabled={!formData.messageTemplate}
                className="bg-emerald-600"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>Target Audience</Label>
              <p className="text-sm text-slate-500 mb-2">Select tags to target</p>
              <div className="flex flex-wrap gap-2">
                {CONTACT_TAGS.map(tag => (
                  <button
                    key={tag.value}
                    onClick={() => {
                      const newTags = formData.targetTags.includes(tag.value)
                        ? formData.targetTags.filter(t => t !== tag.value)
                        : [...formData.targetTags, tag.value];
                      setFormData({...formData, targetTags: newTags});
                    }}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      formData.targetTags.includes(tag.value)
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleCreate} className="bg-emerald-600">
                <Check className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
