import { useAccess } from '@/hooks/useAccess';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Trash2, Mail, Shield, RefreshCw, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications } from '@/contexts/NotificationContext';
import { apiFetch } from '@/lib/apiFetch';


interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'cashier' | 'staff';
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
  last_login: string | null;
}

const STAFF_LIMITS: Record<string, number> = {
  starter: 1,
  growth: 3,
  pro: Infinity,
};

export const TeamManagementModal = ({
  onClose,
  businessName,
  onUpgrade,
}: {
  onClose: () => void;
  businessName: string;
  onUpgrade?: () => void;
}) => {
  const { user } = useAuth();

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'manager' | 'cashier'>('cashier');
  const [inviting, setInviting] = useState(false);

  const { tier } = useAccess();
  const staffLimit = STAFF_LIMITS[tier] ?? 1;
  const atLimit = staffList.length >= staffLimit;

  const { addNotification } = useNotifications();


  
  
  const fetchStaff = async () => {
    if (!user?.businessId) return;
    setStaffLoading(true);
    try {
      const res = await apiFetch(
        `https://api.aflows.uk/api/v1/staff?business_id=${user.businessId}`
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
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setInviting(true);
    try {
      const res = await apiFetch('https://api.aflows.uk/api/v1/staff', {
        method: 'POST',
        body: JSON.stringify({
          business_id: user?.businessId,
          business_name: businessName,
          owner_name: user?.ownerName,
          staff_name: inviteName.trim(),
          staff_email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success(`${inviteName} has been added as staff`);
      addNotification('info', 'Staff member added', `${inviteName} can now log in to the dashboard with their email and password.`);
      setInviteName('');
      setInviteEmail('');
      setInviteRole('cashier');
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
      const res = await apiFetch(`https://api.aflows.uk/api/v1/staff/${staffId}`, {
        method: 'DELETE',
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
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
                An invitation email with temporary login credentials will be sent automatically.
              </p>
            </div>

            {!atLimit && (
              <>
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

                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as 'manager' | 'cashier')
                  }
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                </select>
            
            
              </>
            )}

            {atLimit ? (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  You've reached the <span className="font-semibold capitalize">{tier}</span> plan limit of <span className="font-semibold">{staffLimit}</span> staff member{staffLimit !== 1 ? 's' : ''}.
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => onUpgrade ? onUpgrade() : onClose()}
                >
                  Upgrade to Add More Staff
                </Button>
              </div>
            ) : (
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
            )}
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
                      <p className="text-xs text-muted-foreground truncate">
                        {staff.email}
                      </p>
                      
                      <p className="text-xs font-medium capitalize text-primary">
                        {staff.role}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">

                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            staff.role === 'manager'
                              ? 'bg-blue-500/10 text-blue-600'
                              : 'bg-slate-500/10 text-slate-600'
                          }`}
                        >
                          {staff.role}
                        </span>
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
