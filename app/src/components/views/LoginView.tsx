import { useState } from 'react';
import { MessageSquare, Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ADMINS = [
  { username: 'AlFaizPJ', password: 'Faizxuv', name: 'Faiz', role: 'admin' },
  { username: 'RihabCK', password: 'Toyotacamry4647', name: 'Rihab CK', role: 'admin' },
];

export type LoginUser =
  | { type: 'admin'; name: string; role: string }
  | { type: 'caller'; id: string; name: string; username: string; assignedSchools: string[]; assignedCourses: string[] };

interface LoginViewProps {
  onLogin: (user: LoginUser) => void;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'https://enlightedleads.onrender.com/api';

export function LoginView({ onLogin }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check admin credentials first
    const admin = ADMINS.find(a => a.username === username && a.password === password);
    if (admin) {
      onLogin({ type: 'admin', name: admin.name, role: admin.role });
      setLoading(false);
      return;
    }

    // Try caller login via API
    try {
      const res = await fetch(`${BASE_URL}/callers/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        onLogin({
          type: 'caller',
          id: data.caller.id,
          name: data.caller.name,
          username: data.caller.username,
          assignedSchools: data.caller.assignedSchools,
          assignedCourses: data.caller.assignedCourses,
        });
      } else {
        setError('Invalid username or password.');
      }
    } catch {
      setError('Connection error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-2xl">Enlighted</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={loading || !username || !password}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
