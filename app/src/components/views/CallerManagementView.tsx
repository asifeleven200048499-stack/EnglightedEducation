import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Eye, EyeOff, Loader2, Shield, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COURSES, SCHOOLS } from '@/lib/constants';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://enlightedleads.onrender.com/api';

interface Caller {
  id: string;
  name: string;
  username: string;
  assignedSchools: string[];
  assignedCourses: string[];
  isActive: boolean;
  createdAt: string;
}

const CALLER_SLOTS = Array.from({ length: 15 }, (_, i) => `Caller ${i + 1}`);

export function CallerManagementView() {
  const [callers, setCallers] = useState<Caller[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCaller, setEditingCaller] = useState<Caller | null>(null);

  const fetchCallers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/callers/`);
      const data = await res.json();
      setCallers(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchCallers(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this caller?')) return;
    await fetch(`${BASE_URL}/callers/${id}/`, { method: 'DELETE' });
    setCallers(prev => prev.filter(c => c.id !== id));
  };

  const handleToggle = async (caller: Caller) => {
    const res = await fetch(`${BASE_URL}/callers/${caller.id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !caller.isActive }),
    });
    const updated = await res.json();
    setCallers(prev => prev.map(c => c.id === caller.id ? updated : c));
  };

  const handleSaved = (caller: Caller) => {
    setCallers(prev => {
      const exists = prev.find(c => c.id === caller.id);
      return exists ? prev.map(c => c.id === caller.id ? caller : c) : [caller, ...prev];
    });
    setShowModal(false);
    setEditingCaller(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Caller Management</h1>
          <p className="text-slate-500">Manage callers, assign schools and courses</p>
        </div>
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 self-start sm:self-auto"
          onClick={() => { setEditingCaller(null); setShowModal(true); }}
          disabled={callers.length >= 15}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Caller
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{callers.length}</p>
          <p className="text-sm text-slate-500">Total</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{callers.filter(c => c.isActive).length}</p>
          <p className="text-sm text-slate-500">Active</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-slate-400">{callers.filter(c => !c.isActive).length}</p>
          <p className="text-sm text-slate-500">Disabled</p>
        </CardContent></Card>
      </div>

      {/* Callers Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {callers.map((caller) => (
            <Card key={caller.id} className={`transition-shadow hover:shadow-md ${!caller.isActive ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{caller.name}</p>
                      <p className="text-sm text-slate-500">@{caller.username}</p>
                    </div>
                  </div>
                  <Badge className={caller.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}>
                    {caller.isActive ? 'Active' : 'Disabled'}
                  </Badge>
                </div>

                {caller.assignedCourses.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-slate-500 mb-1">Courses</p>
                    <div className="flex flex-wrap gap-1">
                      {caller.assignedCourses.slice(0, 3).map(c => (
                        <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                      ))}
                      {caller.assignedCourses.length > 3 && <Badge variant="outline" className="text-xs">+{caller.assignedCourses.length - 3}</Badge>}
                    </div>
                  </div>
                )}

                {caller.assignedSchools.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 mb-1">Schools</p>
                    <div className="flex flex-wrap gap-1">
                      {caller.assignedSchools.slice(0, 2).map(s => (
                        <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                      ))}
                      {caller.assignedSchools.length > 2 && <Badge variant="outline" className="text-xs">+{caller.assignedSchools.length - 2}</Badge>}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditingCaller(caller); setShowModal(true); }}>
                    <Edit2 className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleToggle(caller)}>
                    {caller.isActive ? <ShieldOff className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(caller.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 3 - (callers.length % 3 || 3)) }).map((_, i) => (
            <Card key={`empty-${i}`} className="border-dashed opacity-40">
              <CardContent className="p-4 flex items-center justify-center h-full min-h-[160px]">
                <div className="text-center text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Slot available</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CallerModal
        open={showModal}
        caller={editingCaller}
        onClose={() => { setShowModal(false); setEditingCaller(null); }}
        onSaved={handleSaved}
        nextName={`Caller ${callers.length + 1}`}
      />
    </div>
  );
}


function CallerModal({ open, caller, onClose, onSaved, nextName }: {
  open: boolean;
  caller: Caller | null;
  onClose: () => void;
  onSaved: (c: Caller) => void;
  nextName: string;
}) {
  const [form, setForm] = useState({
    name: caller?.name || nextName,
    username: caller?.username || '',
    password: '',
    assignedSchools: caller?.assignedSchools || [] as string[],
    assignedCourses: caller?.assignedCourses || [] as string[],
    isActive: caller?.isActive ?? true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({
      name: caller?.name || nextName,
      username: caller?.username || '',
      password: '',
      assignedSchools: caller?.assignedSchools || [],
      assignedCourses: caller?.assignedCourses || [],
      isActive: caller?.isActive ?? true,
    });
    setError('');
  }, [caller, open, nextName]);

  const toggleItem = (list: string[], item: string) =>
    list.includes(item) ? list.filter(x => x !== item) : [...list, item];

  const handleSave = async () => {
    if (!form.name || !form.username) { setError('Name and username are required.'); return; }
    if (!caller && !form.password) { setError('Password is required for new callers.'); return; }
    setSaving(true);
    setError('');
    try {
      const body: any = {
        name: form.name,
        username: form.username,
        assignedSchools: form.assignedSchools,
        assignedCourses: form.assignedCourses,
        isActive: form.isActive,
      };
      if (form.password) body.password = form.password;

      const url = caller ? `${BASE_URL}/callers/${caller.id}/` : `${BASE_URL}/callers/`;
      const method = caller ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.status === 409) { setError('Username already taken.'); setSaving(false); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      onSaved(data);
    } catch {
      setError('Failed to save. Please try again.');
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{caller ? 'Edit Caller' : 'Add New Caller'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Display Name *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Caller 1" />
            </div>
            <div>
              <Label>Username *</Label>
              <Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="login username" />
            </div>
          </div>

          <div>
            <Label>{caller ? 'New Password (leave blank to keep)' : 'Password *'}</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder={caller ? 'Leave blank to keep current' : 'Set password'}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label>Assign Courses</Label>
            <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
              {COURSES.map(c => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, assignedCourses: toggleItem(form.assignedCourses, c) })}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    form.assignedCourses.includes(c)
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Assign Schools</Label>
            <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
              {SCHOOLS.map(s => (
                <button
                  key={s}
                  onClick={() => setForm({ ...form, assignedSchools: toggleItem(form.assignedSchools, s) })}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    form.assignedSchools.includes(s)
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : ''}`} />
            </button>
            <Label>{form.isActive ? 'Active — can log in' : 'Disabled — cannot log in'}</Label>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {saving ? 'Saving...' : caller ? 'Save Changes' : 'Add Caller'}
            </Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
