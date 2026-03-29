import { useState, useEffect } from 'react';
import {
  Plus, Trash2, Heart, Edit, Users, Loader2, Activity,
} from 'lucide-react';
import { activityApi } from '../../lib/api/activity.api';
import type { ActivityItem } from '../../lib/api/activity.api';
import { useFamilyStore } from '../../stores/family.store';

const RELATIONSHIP_LABELS: Record<string, string> = {
  spouse: 'Spouse', father: 'Father', mother: 'Mother', brother: 'Brother',
  sister: 'Sister', son: 'Son', daughter: 'Daughter', grandparent: 'Grandparent', other: '',
};

function getActivityIcon(type: string) {
  switch (type) {
    case 'expense_added': return { icon: Plus, color: 'bg-success-500/10 text-success-600' };
    case 'expense_deleted': return { icon: Trash2, color: 'bg-danger-500/10 text-danger-600' };
    case 'expense_updated': return { icon: Edit, color: 'bg-primary-500/10 text-primary-600' };
    case 'member_joined': return { icon: Users, color: 'bg-violet-100 text-violet-600' };
    case 'reaction_added': return { icon: Heart, color: 'bg-pink-100 text-pink-600' };
    default: return { icon: Activity, color: 'bg-surface text-muted' };
  }
}

function getActivityMessage(item: ActivityItem): string {
  const name = item.userName;
  const rel = RELATIONSHIP_LABELS[item.userRelationship];
  const who = rel ? `${name} (${rel})` : name;
  const m = item.meta;

  switch (item.type) {
    case 'expense_added':
      return `${who} added ₹${m.amount?.toLocaleString('en-IN')} ${m.category}`;
    case 'expense_deleted':
      return `${who} deleted ₹${m.amount?.toLocaleString('en-IN')} ${m.category}`;
    case 'expense_updated':
      return `${who} updated an expense`;
    case 'member_joined':
      return `${who} joined the family`;
    case 'member_removed':
      return `${m.memberName || 'A member'} was removed`;
    case 'reaction_added':
      return `${who} reacted ${m.emoji} to ₹${m.amount?.toLocaleString('en-IN')} ${m.category}`;
    case 'family_updated':
      return `${who} updated family settings`;
    default:
      return `${who} performed an action`;
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function ActivityFeed() {
  const { activeFamily } = useFamilyStore();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeFamily) return;
    setLoading(true);
    activityApi.feed(activeFamily.id, 10)
      .then((res) => setItems(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeFamily]);

  // Listen for refresh events
  useEffect(() => {
    const handler = () => {
      if (!activeFamily) return;
      activityApi.feed(activeFamily.id, 10)
        .then((res) => setItems(res.data.data))
        .catch(() => {});
    };
    window.addEventListener('balance-refresh', handler);
    return () => window.removeEventListener('balance-refresh', handler);
  }, [activeFamily]);

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
          <Activity className="w-4 h-4 text-primary-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-heading">Family Activity</h2>
          <p className="text-[10px] text-muted">What's happening in your family</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="w-8 h-8 text-muted mx-auto mb-2" />
          <p className="text-xs text-muted">No activity yet. Add an expense to get started!</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {items.map((item) => {
            const { icon: Icon, color } = getActivityIcon(item.type);
            return (
              <div key={item.id} className="flex items-start gap-3 py-2.5 group">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-body leading-relaxed">
                    {getActivityMessage(item)}
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">{timeAgo(item.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
