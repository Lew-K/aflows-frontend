import React, { useEffect, useState } from 'react';
import { X, Monitor, Smartphone, Trash2, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/apiFetch';
import { toast } from 'sonner';

interface Session {
  id: string;
  device_info: string;
  ip_address: string;
  last_seen_at: string;
  created_at: string;
  role: string;
  staff_name: string | null;
}

export const SessionsModal = ({
  onClose,
  businessId,
  accessToken,
}: {
  onClose: () => void;
  businessId: string;
  accessToken: string;
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('https://api.aflows.uk/api/v1/auth/sessions');
      const data = await res.json();
      if (data.success) setSessions(data.sessions);
    } catch {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const revokeSession = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      await apiFetch(`https://api.aflows.uk/api/v1/auth/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      toast.success('Session revoked');
      fetchSessions();
    } catch {
      toast.error('Failed to revoke session');
    } finally {
      setRevoking(null);
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (!userAgent) return <Monitor className="w-4 h-4" />;
    if (/mobile|android|iphone/i.test(userAgent)) return <Smartphone className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-bold">Active Sessions</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchSessions} className="p-1 text-muted-foreground hover:text-foreground">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <div className="text-center py-10">
              <Shield className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No active sessions found</p>
            </div>
          ) : (
            sessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    {getDeviceIcon(session.device_info)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {session.staff_name ? `${session.staff_name} (Staff)` : 'Owner'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.ip_address || 'Unknown IP'} · {formatTime(session.last_seen_at)}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      Since {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => revokeSession(session.id)}
                  disabled={revoking === session.id}
                  className="ml-3 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-4 border-t flex-shrink-0">
          <p className="text-xs text-muted-foreground text-center">
            Revoking a session signs that device out immediately on next request.
          </p>
        </div>
      </div>
    </div>
  );
};
