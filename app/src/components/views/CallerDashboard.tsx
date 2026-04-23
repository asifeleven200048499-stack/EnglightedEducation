import { useState, useEffect } from 'react';
import { Phone, MessageSquare, Search, LogOut, Users, CheckCircle2, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getInitials, getAvatarColor, getStatusColor, formatPhone, generateWhatsAppLink } from '@/lib/utils';
import { LEAD_STATUSES } from '@/lib/constants';
import type { LoginUser } from './LoginView';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://enlightedleads.onrender.com/api';

interface CallerDashboardProps {
  user: LoginUser & { type: 'caller' };
  onLogout: () => void;
}

export function CallerDashboard({ user, onLogout }: CallerDashboardProps) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetch(`${BASE_URL}/callers/${user.id}/contacts/`)
      .then(r => r.json())
      .then(data => { setContacts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user.id]);

  // Verify session every 30s — kicks out if another device logged in
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${BASE_URL}/callers/verify/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callerId: user.id, sessionToken: user.sessionToken }),
        });
        const data = await res.json();
        if (!data.valid) onLogout();
      } catch {}
    };
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [user.id, user.sessionToken, onLogout]);

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}/callers/logout/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callerId: user.id, sessionToken: user.sessionToken }),
      });
    } catch {}
    onLogout();
  };

  const updateStatus = async (contactId: string, status: string) => {
    await fetch(`${BASE_URL}/contacts/${contactId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, status } : c));
  };

  const filtered = contacts.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: contacts.length,
    contacted: contacts.filter(c => c.status === 'contacted').length,
    interested: contacts.filter(c => ['interested', 'qualified'].includes(c.status)).length,
    converted: contacts.filter(c => c.status === 'converted').length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">Enlighted</p>
            <p className="text-xs text-slate-500">{user.name}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </header>

      <main className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total', value: stats.total, color: 'text-slate-900' },
            { label: 'Contacted', value: stats.contacted, color: 'text-blue-600' },
            { label: 'Interested', value: stats.interested, color: 'text-orange-600' },
            { label: 'Converted', value: stats.converted, color: 'text-emerald-600' },
          ].map(s => (
            <Card key={s.label}><CardContent className="p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </CardContent></Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search name or phone..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {LEAD_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Contact List */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading contacts...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No contacts assigned yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(contact => (
              <Card key={contact.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className={`${getAvatarColor(contact.name)} text-white text-sm`}>
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{contact.name}</p>
                      <p className="text-sm text-slate-500">{formatPhone(contact.phone)}</p>
                    </div>
                    <Badge className={getStatusColor(contact.status)}>{contact.status}</Badge>
                  </div>

                  {(contact.course || contact.school) && (
                    <p className="text-xs text-slate-500 mb-3">
                      {[contact.course, contact.school].filter(Boolean).join(' • ')}
                    </p>
                  )}

                  {/* Status Update */}
                  <div className="mb-3">
                    <Select value={contact.status} onValueChange={val => updateStatus(contact.id, val)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAD_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => window.location.href = `tel:${contact.phone}`}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.open(generateWhatsAppLink(contact.phone), '_blank')}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
