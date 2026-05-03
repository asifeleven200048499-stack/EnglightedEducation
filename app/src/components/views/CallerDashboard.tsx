import { useState, useEffect } from 'react';
import { Phone, MessageSquare, Search, LogOut, Users, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getInitials, getAvatarColor, getStatusColor, formatPhone, generateWhatsAppLink } from '@/lib/utils';
import { LEAD_STATUSES } from '@/lib/constants';
import type { LoginUser } from './LoginView';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://enlightedleads.onrender.com/api';

const PLACE_COLLEGES: Record<string, string[]> = {
  Bangalore: [
    'CHRIST COLLEGE', 'ALLIANCE COLLEGE', 'PRESIDENCY COLLEGE', 'REVA COLLEGE',
    'BGS AND SJB COLLEGE', 'SAPTHAGIRI COLLEGE', 'EAST POINT COLLEGE', 'ACHARYA COLLEGE',
    'KOSHYS GROUP OF INSTITUTION', 'YENEPOYA UNIVERSITY', 'HILLSIDE COLLEGE',
    'BRINDAVAN COLLEGE', 'RR COLLEGE', 'ABBS COLLEGE', 'HKBK COLLEGE', 'SEA COLLEGE',
    'PADMASHREE COLLEGE', 'OXFORD COLLEGE', 'S-VYASA COLLEGE', 'PES COLLEGE',
    'CHRISTIAN COLLEGE', 'JUPITER COLLEGE', 'SURYA COLLEGE', 'NALAPAD COLLEGE OF NURSING',
    'ABHAYA COLLEGE', 'HEARTLAND COLLEGE', 'NAVANEETHAM COLLEGE', 'FLORENCE COLLEGE',
    'SMT LAKSHMIDEVI COLLEGE',
  ],
  Mangalore: [
    'YENEPOYA COLLEGE', 'SRINIVAS COLLEGE', 'SRIDEVI COLLEGE', 'ALOYSIUS COLLEGE',
    'P.A COLLEGE', 'AGNES COLLEGE', 'AJ COLLEGE OF ENGINEERING', 'INDIANA MEDICAL COLLEGE',
    'ALIYAH COLLEGE OF NURSING', 'UNITY MEDICAL COLLEGE', 'VIDYA COLLEGE OF NURSING',
    'SAHAYADRI COLLEGE OF NURSING', 'PRAGATHY COLLEGE OF NURSING', 'CITY COLLEGE OF NURSING',
    'ATHENA GROUP OF INSTITUTION',
  ],
  Kerala: [
    'KMM (KOCHI)', 'AL AZHAR (IDUKKI)', 'METS (CALICUT)', 'MES (KOCHI)',
    'ELIMS (THRISSUR)', 'JAIN (KOCHI)', 'INDIRA GANDHI (KOCHI)', 'YMBC (KOCHI)',
    'CHINMAYA VISHWA (KOCHI)', 'JAI BHARATH (KOCHI)',
  ],
};

interface CallerDashboardProps {
  user: LoginUser & { type: 'caller' };
  onLogout: () => void;
}

export function CallerDashboard({ user, onLogout }: CallerDashboardProps) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formContact, setFormContact] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', interestedPlace: '', interestedColleges: [] as string[], interestedCourses: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/callers/${user.id}/contacts/`)
      .then(r => r.json())
      .then(data => { setContacts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user.id]);

  const handleLogout = () => onLogout();

  const handleCall = async (contact: any) => {
    const callCount = (contact.customFields?.callCount || 0) + 1;
    const updatedFields = { ...contact.customFields, callCount };
    setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, customFields: updatedFields } : c));
    await fetch(`${BASE_URL}/contacts/${contact.id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customFields: updatedFields }),
    });
    setTimeout(() => { window.location.href = `tel:${contact.phone}`; }, 300);
  };

  const openForm = (contact: any) => {
    setFormContact(contact);
    setFormData({
      name: contact.name || '',
      address: contact.customFields?.address || '',
      interestedPlace: contact.customFields?.interestedPlace || '',
      interestedColleges: contact.customFields?.interestedColleges || [],
      interestedCourses: contact.customFields?.interestedCourses || '',
    });
  };

  const toggleCollege = (college: string) => {
    setFormData(p => ({
      ...p,
      interestedColleges: p.interestedColleges.includes(college)
        ? p.interestedColleges.filter(c => c !== college)
        : [...p.interestedColleges, college],
    }));
  };

  const saveForm = async () => {
    if (!formContact) return;
    setSaving(true);
    const updatedFields = {
      ...formContact.customFields,
      address: formData.address,
      interestedPlace: formData.interestedPlace,
      interestedColleges: formData.interestedColleges,
      interestedCourses: formData.interestedCourses,
    };
    await fetch(`${BASE_URL}/contacts/${formContact.id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formData.name, customFields: updatedFields }),
    });
    setContacts(prev => prev.map(c => c.id === formContact.id
      ? { ...c, name: formData.name, customFields: updatedFields }
      : c
    ));
    setSaving(false);
    setFormContact(null);
  };

  const updateTag = async (contactId: string, tag: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    const callerTags = ['interested', 'not-interested', 'call-later'];
    const otherTags = (contact.tags || []).filter((t: string) => !callerTags.includes(t));
    const newTags = [...otherTags, tag];
    await fetch(`${BASE_URL}/contacts/${contactId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: newTags }),
    });
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, tags: newTags } : c));
  };

  const getCallerTag = (contact: any) => {
    const callerTags = ['interested', 'not-interested', 'call-later'];
    return (contact.tags || []).find((t: string) => callerTags.includes(t)) || null;
  };

  const filtered = contacts.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: contacts.length,
    interested: contacts.filter(c => (c.tags || []).includes('interested')).length,
    notInterested: contacts.filter(c => (c.tags || []).includes('not-interested')).length,
    callLater: contacts.filter(c => (c.tags || []).includes('call-later')).length,
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
            { label: 'Interested', value: stats.interested, color: 'text-emerald-600' },
            { label: 'Not Interested', value: stats.notInterested, color: 'text-red-600' },
            { label: 'Call Later', value: stats.callLater, color: 'text-orange-600' },
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

                  {/* Caller Tag Buttons */}
                  <div className="flex gap-2 mb-3">
                    {[
                      { tag: 'interested', label: 'Interested', active: 'bg-emerald-600 text-white', inactive: 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' },
                      { tag: 'not-interested', label: 'Not Interested', active: 'bg-red-500 text-white', inactive: 'border-red-300 text-red-600 hover:bg-red-50' },
                      { tag: 'call-later', label: 'Call Later', active: 'bg-orange-500 text-white', inactive: 'border-orange-300 text-orange-600 hover:bg-orange-50' },
                    ].map(({ tag, label, active, inactive }) => (
                      <button
                        key={tag}
                        onClick={() => updateTag(contact.id, tag)}
                        className={`flex-1 text-xs py-1.5 rounded-lg border font-medium transition-colors ${
                          getCallerTag(contact) === tag ? active : inactive
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleCall(contact)}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                      {contact.customFields?.callCount > 0 && (
                        <span className="ml-2 bg-emerald-800 text-white text-xs rounded-full px-1.5 py-0.5">
                          {contact.customFields.callCount}
                        </span>
                      )}
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openForm(contact)}
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Student Form Modal */}
      <Dialog open={!!formContact} onOpenChange={() => setFormContact(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Student name" />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} placeholder="Home address" />
            </div>
            <div>
              <Label>Interested Place</Label>
              <Select value={formData.interestedPlace} onValueChange={val => setFormData(p => ({ ...p, interestedPlace: val, interestedColleges: [] }))}>
                <SelectTrigger><SelectValue placeholder="Select place" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bangalore">Bangalore</SelectItem>
                  <SelectItem value="Mangalore">Mangalore</SelectItem>
                  <SelectItem value="Kerala">Kerala</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.interestedPlace && (
              <div>
                <Label>Interested Colleges</Label>
                <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
                  {PLACE_COLLEGES[formData.interestedPlace].map(college => (
                    <label key={college} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 px-1 py-0.5 rounded">
                      <input
                        type="checkbox"
                        checked={formData.interestedColleges.includes(college)}
                        onChange={() => toggleCollege(college)}
                        className="accent-emerald-600"
                      />
                      {college}
                    </label>
                  ))}
                </div>
                {formData.interestedColleges.length > 0 && (
                  <p className="text-xs text-emerald-600 mt-1">{formData.interestedColleges.length} selected</p>
                )}
              </div>
            )}
            <div>
              <Label>Interested Courses</Label>
              <Textarea value={formData.interestedCourses} onChange={e => setFormData(p => ({ ...p, interestedCourses: e.target.value }))} placeholder="e.g. B.Tech, MBBS, B.Com" rows={2} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={saveForm} disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setFormContact(null)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
