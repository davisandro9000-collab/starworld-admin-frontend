import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import Spinner from '../components/ui/Spinner';
import Input from '../components/ui/Input';
import { PageHeader, EmptyState, InitialsAvatar, ConfirmModal } from '../components/ui/adminHelpers';
import { useUserSearch, useUserDetail, useGrantCoins, useBanUser, useUnbanUser } from '../hooks/useUsers';
import { useQueryClient } from '@tanstack/react-query';

type User = {
  id: string;
  username: string;
  email: string;
  coinBalance: number;
  tier: { slug: string };
  isBanned: boolean;
  createdAt: string;
};

export default function UsersPage() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [grantAmount, setGrantAmount] = useState('');
  const [grantReason, setGrantReason] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banOpen, setBanOpen] = useState(false);
  const [unbanOpen, setUnbanOpen] = useState(false);

  const { q, search, data: searchResult, isLoading } = useUserSearch();
  const users = (searchResult?.users as User[]) ?? [];

  const { data: detail, isLoading: detailLoading } = useUserDetail(selectedId);

  const grantMutation = useGrantCoins();
  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();

  const handleGrant = () => {
    if (!selectedId || !grantAmount) return;
    grantMutation.mutate(
      { id: selectedId, amount: Number(grantAmount), reason: grantReason },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ['admin-user', selectedId] });
          setGrantAmount('');
          setGrantReason('');
        },
      }
    );
  };

  const handleBan = () => {
    if (!selectedId) return;
    banMutation.mutate(
      { id: selectedId, reason: banReason },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ['admin-user', selectedId] });
          setBanOpen(false);
          setBanReason('');
        },
      }
    );
  };

  const handleUnban = () => {
    if (!selectedId) return;
    unbanMutation.mutate(selectedId, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['admin-user', selectedId] });
        setUnbanOpen(false);
      },
    });
  };

  return (
    <div className="admin-page">
      <PageHeader title="Users" subtitle="Search, inspect, and manage user accounts" />

      <div className="max-w-md mb-6">
        <Input
          placeholder="Search username or email… (min 2 chars)"
          value={q}
          onChange={e => search(e.target.value)}
        />
      </div>

      <div className="flex gap-4 min-h-0">
        <div className="flex-1 min-w-0 overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center pt-16"><Spinner size="md" /></div>
          ) : users.length === 0 ? (
            <EmptyState
              icon="🔍"
              message={q.length < 2 ? 'Type at least 2 characters to search' : 'No users found'}
            />
          ) : (
            <table className="admin-table w-full">
              <thead>
                <tr>
                  {['User', 'Tier', 'Balance', 'Status', 'Joined', ''].map(h => (
                    <th key={h} className="font-body text-white/40 text-xs font-medium text-left px-3 py-2 border-b border-sw-border">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u: User) => (
                  <tr
                    key={u.id}
                    onClick={() => setSelectedId(u.id)}
                    className={cn(
                      'border-b border-sw-border/50 cursor-pointer transition-colors',
                      selectedId === u.id ? 'bg-gold/5' : 'hover:bg-sw-card-2'
                    )}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <InitialsAvatar name={u.username} size="sm" />
                        <div>
                          <p className="font-heading font-semibold text-white text-sm">{u.username}</p>
                          <p className="font-body text-white/40 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3"><Badge variant={u.tier?.slug as any} /></td>
                    <td className="px-3 py-3">
                      <span className="coin-chip text-xs">
                        <span className="coin-dot" />{u.coinBalance?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-3 py-3"><Badge variant={u.isBanned ? 'banned' : 'active' as any} /></td>
                    <td className="px-3 py-3 font-body text-white/40 text-xs">
                      {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-3 py-3">
                      <button className="btn-ghost text-xs px-2 py-1">View →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <AnimatePresence>
          {selectedId && (
            <motion.div
              initial={{ x: 420, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 420, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="w-[400px] flex-shrink-0 card overflow-y-auto max-h-[calc(100vh-180px)] flex flex-col gap-5 p-5"
            >
              {detailLoading || !detail ? (
                <div className="flex justify-center pt-10"><Spinner size="md" /></div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={detail.username} size="lg" />
                      <div>
                        <p className="font-heading font-bold text-white text-lg">{detail.username}</p>
                        <p className="font-body text-white/40 text-xs">{detail.email}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={detail.tier?.slug as any} />
                          <Badge variant={detail.isBanned ? 'banned' : 'active' as any} />
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setSelectedId(null)} className="text-white/30 hover:text-white text-lg leading-none">×</button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <StatCard label="Total Deposited" value={`$${detail.totalDepositsUsd ?? 0}`} />
                    <StatCard label="Games Played"    value={detail.totalGamesPlayed ?? 0} />
                    <StatCard label="Games Won"       value={detail.totalGamesWon ?? 0} />
                    <StatCard label="Referrals"       value={detail.referralCount ?? 0} />
                  </div>

                  <Section title="Coin History">
                    {(detail.coinHistory ?? []).slice(0, 10).map((e: any, i: number) => (
                      <div key={i} className="flex justify-between items-center py-1.5 border-b border-sw-border/40 last:border-0">
                        <p className="font-body text-white/60 text-xs truncate flex-1">{e.reason}</p>
                        <span className={cn('font-heading font-bold text-xs ml-2', e.amount > 0 ? 'text-win' : 'text-loss')}>
                          {e.amount > 0 ? '+' : ''}{e.amount}
                        </span>
                      </div>
                    ))}
                  </Section>

                  <Section title="Grant Coins">
                    <div className="flex flex-col gap-2">
                      <Input placeholder="Amount" type="number" value={grantAmount} onChange={e => setGrantAmount(e.target.value)} />
                      <Input placeholder="Reason" value={grantReason} onChange={e => setGrantReason(e.target.value)} />
                      <Button variant="gold" onClick={handleGrant} loading={grantMutation.isPending} disabled={!grantAmount}>
                        Grant Coins
                      </Button>
                    </div>
                  </Section>

                  <Section title="Account Actions">
                    {detail.isBanned ? (
                      <Button variant="success" onClick={() => setUnbanOpen(true)} className="w-full">Unban User</Button>
                    ) : (
                      <Button variant="danger" onClick={() => setBanOpen(true)} className="w-full">Ban User</Button>
                    )}
                  </Section>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ConfirmModal
        open={banOpen}
        onClose={() => setBanOpen(false)}
        onConfirm={handleBan}
        title="Ban User"
        body={`This will prevent ${detail?.username} from accessing StarWorld.`}
        confirmLabel="Ban User"
        variant="danger"
        loading={banMutation.isPending}
      >
        <Input label="Reason" placeholder="e.g. Fraud, abuse" value={banReason} onChange={e => setBanReason(e.target.value)} />
      </ConfirmModal>

      <ConfirmModal
        open={unbanOpen}
        onClose={() => setUnbanOpen(false)}
        onConfirm={handleUnban}
        title="Unban User"
        body={`Restore access for ${detail?.username}?`}
        confirmLabel="Unban"
        variant="success"
        loading={unbanMutation.isPending}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-heading font-semibold text-white/50 text-xs uppercase tracking-wider mb-2">{title}</p>
      {children}
    </div>
  );
}