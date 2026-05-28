import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Trash2, Mail, Shield, RefreshCw, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
  last_login: string | null;
}

export const TeamManagementModal = ({
  onClose,
  businessName,
}: {
  onClose: () => void;
  businessName: string;
}) => {
  const { user, accessToken } = useAuth();

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [inviting, setInviting] = useState(false);

  const fetchStaff = async () => {
    if (!user?.businessId) return;
    setStaffLoading(true);
    try {
      const res = await fetch(
        `https://api.aflows.uk/api/v1/staff?business_id=${user.businessId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.staff || []);
      setStaffList(list);
    } catch {
      toast.error('Failed to load staff');
    } finally {
      setStaffLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleInvite = async () => {
    if (!inviteName.trim() || !inviteEmail.trim() || !invitePassword.trim()) {
      toast.error('Name, email and password are all required');
      return;
    }
    if (invitePassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setInviting(true);
    try {
      const res = await fetch('https://api.aflows.uk/api/v1/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          business_id: user?.businessId,
          business_name: businessName,
          owner_name: user?.ownerName,
          staff_name: inviteName.trim(),
          staff_email: inviteEmail.trim(),
          staff_password: invitePassword,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success(`${inviteName} has been added as staff`);
      setInviteName('');
      setInviteEmail('');
      setInvitePassword('');
      fetchStaff();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add staff member');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (staffId: string, staffName: string) => {
    if (!confirm(`Remove ${staffName} from your team?`)) return;
    try {
      const res = await fetch(`https://api.aflows.uk/api/v1/staff/${staffId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success(`${staffName} removed`);
      fetchStaff();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove staff member');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold">Team Members</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* Add staff form */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold">Add Staff Member</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set a password for them — they will use this to log in.
              </p>
            </div>

            <Input
              placeholder="Full name"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
            />

            <Input
              placeholder="Email address"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />

            <div className="relative">
              <Input
                placeholder="Set a password for them"
                type={showPassword ? 'text' : 'password'}
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(p => !p)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              onClick={handleInvite}
              disabled={inviting}
              size="sm"
              className="w-full"
            >
              {inviting ? 'Adding...' : (
                <><UserPlus className="w-4 h-4 mr-2" />Add Staff Member</>
              )}
            </Button>
          </div>

          <hr className="border-border/40" />

          {/* Staff list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Current Staff ({staffList.length})</p>
              <button
                onClick={fetchStaff}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>

            {staffLoading ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Loading...</p>
            ) : staffList.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-border rounded-xl">
                <Shield className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No staff members yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Add someone above to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {staffList.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{staff.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{staff.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          staff.is_active
                            ? 'bg-green-500/10 text-green-600'
                            : 'bg-red-500/10 text-red-600'
                        }`}>
                          {staff.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {staff.last_login && (
                          <span className="text-[10px] text-muted-foreground">
                            Last login: {new Date(staff.last_login).toLocaleDateString()}
                          </span>
                        )}
                        {!staff.last_login && (
                          <span className="text-[10px] text-amber-600">Never logged in</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(staff.id, staff.name)}
                      className="ml-3 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
