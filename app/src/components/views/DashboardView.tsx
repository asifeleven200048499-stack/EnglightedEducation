import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  MessageSquare, 
  Megaphone, 
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Activity,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Cell,
  Legend
} from 'recharts';
import { CHART_COLORS } from '@/lib/constants';
import { getStatusColor, getAvatarColor, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { DashboardStats } from '@/types';

interface DashboardViewProps {
  stats: DashboardStats;
  store: any;
  setActiveView: (view: string) => void;
}

export function DashboardView({ stats, store, setActiveView }: DashboardViewProps) {
  const recentContacts = store.contacts.slice(0, 5);
  const activeCampaigns = store.campaigns.filter((c: any) => c.status === 'running');
  const pendingTasks = store.tasks.filter((t: any) => t.status !== 'completed');

  const pipelineData = [
    { name: 'New', value: stats.pipelineDistribution.new, color: CHART_COLORS.secondary },
    { name: 'Contacted', value: stats.pipelineDistribution.contacted, color: CHART_COLORS.accent },
    { name: 'Interested', value: stats.pipelineDistribution.interested, color: CHART_COLORS.primary },
    { name: 'Qualified', value: stats.pipelineDistribution.qualified, color: CHART_COLORS.purple },
    { name: 'Converted', value: stats.pipelineDistribution.converted, color: '#22c55e' },
    { name: 'Lost', value: stats.pipelineDistribution.lost, color: CHART_COLORS.slate },
  ];

  const leadScoreData = stats.leadScoreDistribution.map(item => ({
    name: item.range,
    value: item.count
  }));

  const campaignData = stats.campaignPerformance.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back! Here's what's happening with your leads.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActiveView('contacts')}>
            <Users className="w-4 h-4 mr-2" />
            View Contacts
          </Button>
          <Button onClick={() => setActiveView('campaigns')} className="bg-emerald-600 hover:bg-emerald-700">
            <Megaphone className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Contacts</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalContacts}</p>
                <div className="flex items-center mt-2 text-sm">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600 mr-1" />
                  <span className="text-emerald-600 font-medium">+{stats.newContactsToday}</span>
                  <span className="text-slate-500 ml-1">today</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Leads</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.activeLeads}</p>
                <div className="flex items-center mt-2 text-sm">
                  <Activity className="w-4 h-4 text-blue-600 mr-1" />
                  <span className="text-blue-600 font-medium">
                    {Math.round((stats.activeLeads / stats.totalContacts) * 100)}%
                  </span>
                  <span className="text-slate-500 ml-1">of total</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Conversion Rate</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.conversionRate}%</p>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-600 mr-1" />
                  <span className="text-emerald-600 font-medium">+2.5%</span>
                  <span className="text-slate-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Campaigns</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.activeCampaigns}</p>
                <div className="flex items-center mt-2 text-sm">
                  <Megaphone className="w-4 h-4 text-orange-600 mr-1" />
                  <span className="text-orange-600 font-medium">
                    {store.campaigns.filter((c: any) => c.status === 'scheduled').length}
                  </span>
                  <span className="text-slate-500 ml-1">scheduled</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              Lead Pipeline
            </CardTitle>
            <CardDescription>Distribution of leads across pipeline stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {pipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lead Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Lead Score Distribution
            </CardTitle>
            <CardDescription>Contacts grouped by lead score ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadScoreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {leadScoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[
                        CHART_COLORS.secondary,
                        CHART_COLORS.accent,
                        CHART_COLORS.primary,
                        CHART_COLORS.danger
                      ][index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Contacts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Recent Contacts
              </CardTitle>
              <CardDescription>Latest leads added to your database</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveView('contacts')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentContacts.map((contact: any) => (
                <div key={contact.id} className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className={`${getAvatarColor(contact.name)} text-white text-sm`}>
                      {getInitials(contact.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{contact.name}</p>
                    <p className="text-sm text-slate-500">{contact.course || 'No course'}</p>
                  </div>
                  <Badge className={getStatusColor(contact.status)}>
                    {contact.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-orange-600" />
                Active Campaigns
              </CardTitle>
              <CardDescription>Currently running campaigns</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveView('campaigns')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeCampaigns.length > 0 ? (
                activeCampaigns.map((campaign: any) => (
                  <div key={campaign.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-slate-900">{campaign.name}</p>
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                        Running
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-medium">
                          {Math.round((campaign.sentCount / campaign.totalRecipients) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(campaign.sentCount / campaign.totalRecipients) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{campaign.sentCount} sent</span>
                        <span>{campaign.totalRecipients} total</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No active campaigns</p>
                  <Button 
                    variant="link" 
                    onClick={() => setActiveView('campaigns')}
                    className="text-emerald-600"
                  >
                    Start a campaign
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Pending Tasks
              </CardTitle>
              <CardDescription>Tasks requiring your attention</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveView('tasks')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTasks.slice(0, 5).map((task: any) => (
                <div 
                  key={task.id} 
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    task.priority === 'urgent' ? 'bg-red-500' :
                    task.priority === 'high' ? 'bg-orange-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm">{task.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{task.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No pending tasks</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
