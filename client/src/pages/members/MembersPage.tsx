import { useState, useEffect, useCallback } from 'react';
import {
  Users, UserPlus, Trash2, Loader2, HeartHandshake,
  Heart, Mail, Calendar, Crown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/auth.store';
import { useFamilyStore } from '../../stores/family.store';
import { familyApi } from '../../lib/api/family.api';
import { getAvatarUrl } from '../../lib/api/user.api';
import type { FamilyDetails, FamilyMember } from '../../lib/api/family.api';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import InviteMemberModal from './InviteMemberModal';

const RELATIONSHIP_LABELS: Record<string, string> = {
  spouse: 'Spouse', father: 'Father', mother: 'Mother', brother: 'Brother',
  sister: 'Sister', son: 'Son', daughter: 'Daughter', grandparent: 'Grandparent', other: 'Self',
};

const RELATIONSHIP_GRADIENTS: Record<string, string> = {
  spouse: 'from-pink-500 to-rose-500',
  father: 'from-blue-500 to-indigo-500',
  mother: 'from-purple-500 to-violet-500',
  brother: 'from-emerald-500 to-teal-500',
  sister: 'from-amber-500 to-orange-500',
  son: 'from-cyan-500 to-blue-500',
  daughter: 'from-fuchsia-500 to-pink-500',
  grandparent: 'from-slate-500 to-gray-500',
  other: 'from-primary-500 to-violet-500',
};

const RELATIONSHIP_BG: Record<string, string> = {
  spouse: 'bg-pink-50 border-pink-200',
  father: 'bg-blue-50 border-blue-200',
  mother: 'bg-purple-50 border-purple-200',
  brother: 'bg-emerald-50 border-emerald-200',
  sister: 'bg-amber-50 border-amber-200',
  son: 'bg-cyan-50 border-cyan-200',
  daughter: 'bg-fuchsia-50 border-fuchsia-200',
  grandparent: 'bg-slate-50 border-slate-200',
  other: 'bg-primary-50 border-primary-200',
};

export default function MembersPage() {
  const [family, setFamily] = useState<FamilyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FamilyMember | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuthStore();
  const { activeFamily } = useFamilyStore();

  const activeFamilyId = activeFamily?.id;

  const fetchFamily = useCallback(async () => {
    if (!activeFamilyId) return;
    try {
      setLoading(true);
      const res = await familyApi.details(activeFamilyId);
      setFamily(res.data.data);
    } catch {
      toast.error('Failed to load family details');
    } finally {
      setLoading(false);
    }
  }, [activeFamilyId]);

  useEffect(() => { fetchFamily(); }, [fetchFamily]);

  const handleDelete = async () => {
    if (!family || !deleteTarget) return;
    setDeleting(true);
    try {
      await familyApi.removeMember(family.id, deleteTarget.id);
      toast.success(`${deleteTarget.name} removed from family`);
      setDeleteTarget(null);
      fetchFamily();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  const members = family?.members || [];
  const selfMember = members.find((m) => m.userId === user?.id);
  const otherMembers = members.filter((m) => m.userId !== user?.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">Family Members</h1>
          <p className="text-sm text-subtle mt-1">
            {family?.name || 'Your family'} — {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-heading">{members.length}</p>
          <p className="text-xs text-muted mt-0.5">Total Members</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">
            {new Set(members.map((m) => m.relationship)).size}
          </p>
          <p className="text-xs text-muted mt-0.5">Relationships</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-success-600">
            {members.filter((m) => m.joinedAt).length}
          </p>
          <p className="text-xs text-muted mt-0.5">Active</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-accent-600">
            {family?.createdAt ? new Date(family.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
          </p>
          <p className="text-xs text-muted mt-0.5">Family Since</p>
        </div>
      </div>

      {/* ── Family Hub + Members Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Family Hub Card */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center shadow-xl shadow-primary-600/20 ring-4 ring-card mb-4">
            <HeartHandshake className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-lg font-bold text-heading">{family?.name}</h2>
          {activeFamily?.slogan && (
            <p className="text-xs text-muted italic mt-1">"{activeFamily.slogan}"</p>
          )}

          <div className="w-full mt-6 space-y-2">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3">Relationships</p>
            {[...new Set(members.map((m) => m.relationship))].map((rel) => {
              const count = members.filter((m) => m.relationship === rel).length;
              const gradient = RELATIONSHIP_GRADIENTS[rel] || RELATIONSHIP_GRADIENTS.other;
              return (
                <div key={rel} className="flex items-center justify-between px-3 py-2 bg-surface rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`} />
                    <span className="text-xs font-medium text-heading capitalize">
                      {RELATIONSHIP_LABELS[rel] || rel}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-muted">{count}</span>
                </div>
              );
            })}
          </div>

          {/* You card */}
          {selfMember && (
            <div className="w-full mt-6 p-3 bg-primary-500/5 border border-primary-200 rounded-xl">
              <div className="flex items-center gap-3">
                <MemberAvatar member={selfMember} size="sm" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-heading">{selfMember.name}</p>
                  <p className="text-[10px] text-primary-600 font-medium flex items-center gap-1">
                    <Heart className="w-2.5 h-2.5 fill-current" /> That's you
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right — Member Cards Grid (spans 2 cols) */}
        <div className="lg:col-span-2">
          {otherMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {otherMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onDelete={() => setDeleteTarget(member)}
                />
              ))}

              {/* Invite CTA card */}
              <button
                onClick={() => setInviteOpen(true)}
                className="border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-500/5 transition-all group min-h-[180px]"
              >
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center group-hover:bg-primary-500/10 transition-colors">
                  <UserPlus className="w-5 h-5 text-muted group-hover:text-primary-600 transition-colors" />
                </div>
                <p className="text-sm font-medium text-muted group-hover:text-primary-600 transition-colors">
                  Invite another member
                </p>
              </button>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-muted" />
              </div>
              <h3 className="text-lg font-semibold text-heading mb-1">Your family awaits</h3>
              <p className="text-sm text-subtle mb-6 max-w-xs">
                Invite your family members to start tracking finances together
              </p>
              <button
                onClick={() => setInviteOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Send First Invite
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {activeFamilyId && (
        <InviteMemberModal
          open={inviteOpen}
          familyId={activeFamilyId}
          onClose={() => setInviteOpen(false)}
          onSuccess={() => { setInviteOpen(false); fetchFamily(); }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        danger
        title="Remove member?"
        message={`Are you sure you want to remove ${deleteTarget?.name} from the family? They will lose access to all family data.`}
        confirmLabel="Remove"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

/* ── Member Avatar ── */
function MemberAvatar({ member, size = 'md' }: { member: FamilyMember; size?: 'sm' | 'md' | 'lg' }) {
  const gradient = RELATIONSHIP_GRADIENTS[member.relationship] || RELATIONSHIP_GRADIENTS.other;
  const avatarUrl = getAvatarUrl(member.avatar);
  const initials = member.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const sizeMap = { sm: 'w-10 h-10', md: 'w-14 h-14', lg: 'w-20 h-20' };
  const textMap = { sm: 'text-xs', md: 'text-sm', lg: 'text-xl' };
  const ringMap = { sm: 'p-[1.5px]', md: 'p-[2px]', lg: 'p-[3px]' };

  return (
    <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br ${gradient} ${ringMap[size]} shadow-lg shrink-0`}>
      <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt={member.name} className="w-full h-full object-cover rounded-full" />
        ) : (
          <span className={`${textMap[size]} font-bold bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>
            {initials}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Member Card ── */
function MemberCard({ member, onDelete }: { member: FamilyMember; onDelete: () => void }) {
  const gradient = RELATIONSHIP_GRADIENTS[member.relationship] || RELATIONSHIP_GRADIENTS.other;
  const cardBg = RELATIONSHIP_BG[member.relationship] || RELATIONSHIP_BG.other;
  const joinDate = member.joinedAt
    ? new Date(member.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <div className={`relative border rounded-2xl p-5 group hover:shadow-md transition-all ${cardBg}`}>
      {/* Delete button */}
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 w-7 h-7 bg-white/80 border border-border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-danger-500 hover:border-danger-500 hover:text-white text-muted"
        title="Remove member"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-start gap-4">
        <MemberAvatar member={member} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-heading truncate">{member.name}</h3>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${gradient}`}>
            {RELATIONSHIP_LABELS[member.relationship] || member.relationship}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-subtle">
          <Mail className="w-3 h-3 text-muted" />
          <span className="truncate">{member.email}</span>
        </div>
        {joinDate && (
          <div className="flex items-center gap-2 text-xs text-subtle">
            <Calendar className="w-3 h-3 text-muted" />
            <span>Joined {joinDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}
