import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Megaphone,
  Zap,
  CheckSquare,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  Upload,
  Send,
  PlusSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useStore } from '@/hooks/useStore';
import { LoginView } from '@/components/views/LoginView';
import { DashboardView } from '@/components/views/DashboardView';
import { ContactsView } from '@/components/views/ContactsView';
import { InboxView } from '@/components/views/InboxView';
import { CampaignsView, CampaignModal } from '@/components/views/CampaignsView';
import { AutomationsView } from '@/components/views/AutomationsView';
import { TasksView, TaskModal } from '@/components/views/TasksView';
import { AnalyticsView } from '@/components/views/AnalyticsView';
import { getInitials } from '@/lib/utils';
import type { Contact } from '@/types';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(3);

  const store = useStore();
  const stats = store.getDashboardStats();

  if (!isLoggedIn) {
    return <LoginView onLogin={() => setIsLoggedIn(true)} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'inbox', label: 'Inbox', icon: MessageSquare },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'automations', label: 'Automations', icon: Zap },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView stats={stats} store={store} setActiveView={setActiveView} />;
      case 'contacts':
        return <ContactsView store={store} searchQuery={searchQuery} setSelectedContact={() => {}} />;
      case 'inbox':
        return <InboxView store={store} />;
      case 'campaigns':
        return <CampaignsView store={store} setShowCampaignModal={setShowCampaignModal} />;
      case 'automations':
        return <AutomationsView store={store} />;
      case 'tasks':
        return <TasksView store={store} setShowTaskModal={setShowTaskModal} />;
      case 'analytics':
        return <AnalyticsView stats={stats} store={store} />;
      default:
        return <DashboardView stats={stats} store={store} setActiveView={setActiveView} />;
    }
  };

  const handleNavClick = (id: string) => {
    setActiveView(id);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col transition-all duration-300
          ${ mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${ sidebarOpen ? 'w-64' : 'lg:w-16 w-64'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-200">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <span className="ml-3 font-semibold text-slate-900">Enlighted</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                  activeView === item.id
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className={`p-4 border-t border-slate-200 ${!sidebarOpen ? 'lg:hidden' : ''}`}>
            <p className="text-xs font-medium text-slate-500 uppercase mb-3">Quick Actions</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => { setActiveView('contacts'); setMobileSidebarOpen(false); }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Contacts
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => { setShowCampaignModal(true); setMobileSidebarOpen(false); }}
              >
                <Send className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => { setShowTaskModal(true); setMobileSidebarOpen(false); }}
              >
                <PlusSquare className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </div>
          </div>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-emerald-600 text-white text-sm">
                {getInitials(store.currentUser.name)}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{store.currentUser.name}</p>
                <p className="text-xs text-slate-500 capitalize">{store.currentUser.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            {/* Desktop sidebar toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search contacts, campaigns..."
                className="pl-10 w-48 md:w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 pb-20 lg:pb-6">
          {renderView()}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 flex">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                  activeView === item.id ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="truncate w-full text-center px-1">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Modals */}
      <CampaignModal
        open={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        store={store}
      />
      <TaskModal
        open={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        store={store}
      />
    </div>
  );
}

export default App;
