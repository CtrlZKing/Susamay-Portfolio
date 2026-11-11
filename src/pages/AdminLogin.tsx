import { useState, FormEvent } from 'react';
import { Lock, ArrowLeft, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api.ts';

interface AdminLoginProps {
  onSuccess: () => void;
  onBackToSite: () => void;
}

export function AdminLogin({ onSuccess, onBackToSite }: AdminLoginProps) {
  const [email, setEmail] = useState('admin@portfolio.local');
  const [password, setPassword] = useState('admin12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.login(email.trim(), password);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={onBackToSite}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Portfolio</span>
        </button>

        <div className="flex justify-center mb-4">
          <div className="p-3 bg-zinc-900 text-white rounded-xs shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
        </div>

        <h2 className="text-center font-display text-2xl font-bold tracking-tight text-zinc-900">
          Portfolio CMS Login
        </h2>
        <p className="mt-1 text-center text-xs text-zinc-500">
          Private administrative access to manage artworks, projects, and settings
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-zinc-200/80 rounded-xs sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Administrator Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xs text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 text-xs font-semibold uppercase tracking-wider text-white bg-zinc-900 hover:bg-zinc-800 rounded-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Access Dashboard</span>
                )}
              </button>
            </div>
          </form>

          {/* Quick Notice for portfolio owner */}
          <div className="mt-6 pt-5 border-t border-zinc-100 text-xs text-zinc-500 space-y-2 bg-zinc-50/70 p-3 rounded-xs">
            <div className="flex items-center gap-1.5 font-medium text-zinc-700">
              <ShieldCheck className="w-4 h-4 text-zinc-600" />
              <span>Initial Credentials Configured</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Email: <code className="text-zinc-900 font-mono">admin@portfolio.local</code><br />
              Password: <code className="text-zinc-900 font-mono">admin12345</code>
            </p>
            <p className="text-[11px] text-zinc-400">
              You can update your login credentials anytime under the Settings tab or connect Supabase Auth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
