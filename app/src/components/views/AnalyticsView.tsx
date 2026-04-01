import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Megaphone,
  Target,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { CHART_COLORS } from '@/lib/constants';
import type { DashboardStats } from '@/types';

interface AnalyticsViewProps {
  stats: DashboardStats;
  store: any;
}

export function AnalyticsView({ stats, store }: AnalyticsViewProps) {
  const [dateRange, setDateRange] = useState('7d');

  // Sample data for charts
  const messageActivityData = [
    { day: 'Mon', sent: 45, received: 32 },
    { day: 'Tue', sent: 52, received: 38 },
    { day: 'Wed', sent: 38, received: 28 },
    { day: 'Thu', sent: 65, received: 45 },
    { day: 'Fri', sent: 48, received: 35 },
    { day: 'Sat', sent: 25, received: 18 },
    { day: 'Sun', sent: 30, received: 22 },
  ];

  const leadSourceData = [
    { name: 'WhatsApp Group', value: 35 },
    { name: 'Facebook', value: 25 },
    { name: 'Website', value: 20 },
    { name: 'Referral', value: 15 },
    { name: 'Other', value: 5 },
  ];

  const conversionFunnelData = [
    { name: 'New', value: 100, percentage: 100 },
    { name: 'Contacted', value: 75, percentage: 75 },
    { name: 'Interested', value: 45, percentage: 45 },
    { name: 'Qualified', value: 25, percentage: 25 },
    { name: 'Converted', value: 15, percentage: 15 },
  ];

  const teamPerformanceData = [
    { name: 'Agent 1', contacts: 45, messages: 320, conversions: 12 },
    { name: 'Agent 2', contacts: 38, messages: 280, conversions: 10 },
    { name: 'Agent 3', contacts: 52, messages: 410, conversions: 15 },
    { name: 'Agent 4', contacts: 30, messages: 190, conversions: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500">Track your performance and insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Contacts</p>
                <p className="text-3xl font-bold">{stats.totalContacts}</p>
                <div className="flex items-center mt-2 text-sm text-emerald-600">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>+12.5%</span>
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
                <p className="text-sm text-slate-500">Messages Sent</p>
                <p className="text-3xl font-bold">1,245</p>
                <div className="flex items-center mt-2 text-sm text-emerald-600">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>+8.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Reply Rate</p>
                <p className="text-3xl font-bold">68.5%</p>
                <div className="flex items-center mt-2 text-sm text-red-600">
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                  <span>-2.1%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Conversion Rate</p>
                <p className="text-3xl font-bold">{stats.conversionRate}%</p>
                <div className="flex items-center mt-2 text-sm text-emerald-600">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>+5.4%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pipeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChartIcon className="w-5 h-5 text-emerald-600" />
                  Lead Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'New', value: stats.pipelineDistribution.new },
                      { name: 'Contacted', value: stats.pipelineDistribution.contacted },
                      { name: 'Interested', value: stats.pipelineDistribution.interested },
                      { name: 'Qualified', value: stats.pipelineDistribution.qualified },
                      { name: 'Converted', value: stats.pipelineDistribution.converted },
                      { name: 'Lost', value: stats.pipelineDistribution.lost },
                    ]} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="value" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Lead Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-blue-600" />
                  Lead Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.leadScoreDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="range"
                        label
                      >
                        {stats.leadScoreDistribution.map((entry, index) => (
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

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionFunnelData.map((stage, index) => (
                  <div key={stage.name} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium">{stage.name}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Progress value={stage.percentage} className="flex-1 h-3" />
                        <span className="text-sm font-medium w-12">{stage.value}</span>
                        <span className="text-sm text-slate-500 w-12">{stage.percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="w-5 h-5 text-blue-600" />
                Message Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={messageActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="sent" 
                      stackId="1" 
                      stroke={CHART_COLORS.primary} 
                      fill={CHART_COLORS.primary} 
                      fillOpacity={0.6}
                      name="Sent"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="received" 
                      stackId="1" 
                      stroke={CHART_COLORS.secondary} 
                      fill={CHART_COLORS.secondary} 
                      fillOpacity={0.6}
                      name="Received"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.campaignPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sent" fill={CHART_COLORS.secondary} />
                      <Bar dataKey="delivered" fill={CHART_COLORS.primary} />
                      <Bar dataKey="read" fill={CHART_COLORS.purple} />
                      <Bar dataKey="replied" fill={CHART_COLORS.accent} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm">Average Response Time</span>
                    <span className="font-semibold">2.5 hours</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm">First Response Time</span>
                    <span className="font-semibold">45 minutes</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm">Resolution Time</span>
                    <span className="font-semibold">1.2 days</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm">Messages per Conversation</span>
                    <span className="font-semibold">8.5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-orange-600" />
                  Lead Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadSourceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        nameKey="name"
                        label
                      >
                        {leadSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={[
                            CHART_COLORS.primary,
                            CHART_COLORS.secondary,
                            CHART_COLORS.accent,
                            CHART_COLORS.purple,
                            CHART_COLORS.slate
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

            <Card>
              <CardHeader>
                <CardTitle>Lead Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>High Quality (80-100)</span>
                      <span className="font-medium">{stats.leadScoreDistribution[3]?.count || 0}</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Good Quality (60-79)</span>
                      <span className="font-medium">{stats.leadScoreDistribution[2]?.count || 0}</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Average Quality (40-59)</span>
                      <span className="font-medium">{stats.leadScoreDistribution[1]?.count || 0}</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Low Quality (0-39)</span>
                      <span className="font-medium">{stats.leadScoreDistribution[0]?.count || 0}</span>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="contacts" fill={CHART_COLORS.secondary} name="Contacts" />
                    <Bar dataKey="messages" fill={CHART_COLORS.primary} name="Messages" />
                    <Bar dataKey="conversions" fill={CHART_COLORS.accent} name="Conversions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
