// admin/src/pages/DepositsQueuePage.tsx
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { PageHeader, EmptyState, CopyBlock, InitialsAvatar } from '../components/ui/adminHelpers';
import { usePendingDeposits, useDepositHistory, useCreditDeposit, useRejectDeposit } from '../hooks/useDeposits';
import { useAdminNotifStore } from '../stores/adminNotifStore';
import { COIN_RATE } from '../lib/constants';

type Tab = 'pending' | 'history';

const METHOD_LINKS: Record<string, (hash: string) => string> = {
  BTC:  h => `https://mempool.space/tx/${h}`,
  ETH:  h => `https://etherscan.io/tx/${h}`,
  USDT: h => `https://etherscan.io/tx/${h}`,
  BNB:  h => `https://bscscan.com/tx/${h}`,
};

const REJECT_REASONS = [
  'Invalid TX hash',
  'Gift card already used',
  'Amount mismatch',
  'Suspicious activity',
  'Other',
];

// Safe helper to get deposit amount (supports both usdValue and amountUsd)
const getDepositAmount = (dep: any): number => {
  if (!dep) return 0;
  const val = dep.usdValue ?? dep.amountUsd ?? 0;
  return typeof val === 'number' ? val : parseFloat(val) || 0;
};

export default function DepositsQueuePage() {
  const qc = useQueryClient();
  const { push } = useAdminNotifStore();
  const [tab, setTab] = useState<Tab>('pending');
  const [selected, setSelected] = useState<any>(null);
  const [creditOpen, setCreditOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [creditCoins, setCreditCoins] = useState('');
  const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0]);
  const [rejectOther, setRejectOther] = useState('');

  const { data: pendingData, isLoading: pendingLoading } = usePendingDeposits();
  const { data: historyData, isLoading: histLoading } = useDepositHistory();
  const pending = Array.isArray(pendingData) ? pendingData : [];
  const history = historyData?.deposits ? historyData.deposits : [];

  const creditMutation = useCreditDeposit();
  const rejectMutation = useRejectDeposit();

  const openCredit = (dep: any) => {
    if (!dep) return;
    setSelected(dep);
    const amount = getDepositAmount(dep);
    setCreditCoins(String(Math.floor(amount * COIN_RATE)));
    setCreditOpen(true);
  };
  const openReject = (dep: any) => {
    if (!dep) return;
    setSelected(dep);
    setRejectReason(REJECT_REASONS[0]);
    setRejectOther('');
    setRejectOpen(true);
  };

  const handleCredit = () => {
    creditMutation.mutate(
      { id: selected.id, coins: Number(creditCoins) },
      {
        onSuccess: () => {
          push({ title: 'Deposit credited', body: `${creditCoins} coins → ${selected.user?.username}`, variant: 'success' });
          qc.invalidateQueries({ queryKey: ['admin-deposits-pending'] });
          setCreditOpen(false);
          setSelected(null);
        },
        onError: () => push({ title: 'Credit failed', body: 'Check the server logs', variant: 'error' }),
      }
    );
  };

  const handleReject = () => {
    const reason = rejectReason === 'Other' ? rejectOther : rejectReason;
    rejectMutation.mutate(
      { id: selected.id, reason },
      {
        onSuccess: () => {
          push({ title: 'Deposit rejected', body: reason, variant: 'info' });
          qc.invalidateQueries({ queryKey: ['admin-deposits-pending'] });
          setRejectOpen(false);
          setSelected(null);
        },
        onError: () => push({ title: 'Reject failed', body: 'Check the server logs', variant: 'error' }),
      }
    );
  };

  return (
    <div className="admin-page">
      <PageHeader title="Deposits Queue" subtitle="Review and credit or reject pending deposit submissions" />

      <div className="flex gap-1 mb-6 border-b border-sw-border">
        {(['pending', 'history'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-5 py-2.5 font-heading font-semibold text-sm capitalize transition-colors border-b-2 -mb-px',
              tab === t ? 'border-gold text-gold' : 'border-transparent text-white/40 hover:text-white/70'
            )}
          >
            {t}
            {t === 'pending' && pending.length > 0 && (
              <span className="ml-2 bg-gold text-sw-bg text-xs font-bold px-1.5 py-0.5 rounded-full">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-220px)] min-h-0">
        {/* Left: list */}
        <div className="md:w-[380px] flex-shrink-0 flex flex-col gap-2 overflow-y-auto pr-1">
          {tab === 'pending' && (
            pendingLoading
              ? <div className="flex justify-center pt-10"><Spinner size="md" /></div>
              : pending.length === 0
                ? <EmptyState icon="✅" message="No pending deposits" />
                : [...pending]
                    .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                    .map((dep: any) => (
                      <DepositRow key={dep.id} dep={dep} selected={selected?.id === dep.id} onClick={() => setSelected(dep)} />
                    ))
          )}
          {tab === 'history' && (
            histLoading
              ? <div className="flex justify-center pt-10"><Spinner size="md" /></div>
              : history.length === 0
                ? <EmptyState message="No deposit history" />
                : history.map((dep: any) => (
                    <DepositRow key={dep.id} dep={dep} selected={selected?.id === dep.id} onClick={() => setSelected(dep)} />
                  ))
          )}
        </div>

        {/* Right: detail */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex items-center justify-center">
                <p className="font-body text-white/20 text-sm">← Select a deposit to review</p>
              </motion.div>
            ) : (
              <motion.div key={selected.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="card p-6 flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <InitialsAvatar name={selected.user?.username ?? '?'} size="lg" />
                  <div>
                    <p className="font-heading font-bold text-white text-lg">{selected.user?.username}</p>
                    <p className="font-body text-white/40 text-sm">{selected.user?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={selected.user?.tier?.slug ?? 'bronze'} />
                      <span className="coin-chip text-xs"><span className="coin-dot" />{(selected.user?.coinBalance ?? 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Detail label="Method" value={selected.method} />
                  <Detail label="Amount" value={`$${getDepositAmount(selected).toFixed(2)} USD`} />
                  <Detail label="Status"><Badge variant={selected.status} /></Detail>
                  <Detail label="Submitted" value={formatDistanceToNow(new Date(selected.createdAt), { addSuffix: true })} />
                </div>

                {selected.txHash && (
                  <div className="flex flex-col gap-1">
                    <p className="font-body text-white/40 text-xs">TX Hash</p>
                    <div className="flex items-center gap-2">
                      <CopyBlock value={selected.txHash} truncate={32} />
                      {METHOD_LINKS[selected.method] && (
                        <a href={METHOD_LINKS[selected.method](selected.txHash)} target="_blank" rel="noopener noreferrer" className="text-cyan text-xs font-body hover:underline">View ↗</a>
                      )}
                    </div>
                  </div>
                )}
                {selected.giftCardDigits && (
                  <div className="flex flex-col gap-1">
                    <p className="font-body text-white/40 text-xs">Gift Card Digits</p>
                    <CopyBlock value={selected.giftCardDigits} />
                  </div>
                )}

                <div className="card p-3 bg-gold/5 border-gold/20 border rounded-lg">
                  <p className="font-body text-white/50 text-xs mb-1">Coin calculation</p>
                  <p className="font-heading font-bold text-white">
                    ${getDepositAmount(selected).toFixed(2)} × {COIN_RATE} ={' '}
                    <span className="text-gold">{Math.floor(getDepositAmount(selected) * COIN_RATE)} coins</span>
                  </p>
                </div>

                {selected.status === 'pending' && (
                  <div className="flex gap-3">
                    <Button variant="success" onClick={() => openCredit(selected)} className="flex-1">Credit Deposit</Button>
                    <Button variant="danger" onClick={() => openReject(selected)} className="flex-1">Reject</Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Credit modal */}
      <Modal open={creditOpen} onClose={() => setCreditOpen(false)} title="Credit Deposit">
        <div className="flex flex-col gap-4">
          <p className="font-body text-white/60 text-sm">
            Crediting <strong className="text-white">{selected?.user?.username}</strong> for a{' '}
            <strong className="text-white">${getDepositAmount(selected).toFixed(2)}</strong> {selected?.method} deposit.
          </p>
          <Input
            label="Coins to award"
            type="number"
            value={creditCoins}
            onChange={e => setCreditCoins(e.target.value)}
            hint={`Default: $${getDepositAmount(selected).toFixed(2)} × ${COIN_RATE} = ${Math.floor(getDepositAmount(selected) * COIN_RATE)} coins`}
          />
          <div className="bg-loss/10 border border-loss/20 rounded-lg p-3">
            <p className="font-body text-loss text-xs">⚠ This action is irreversible. Coins will be credited immediately.</p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setCreditOpen(false)}>Cancel</Button>
            <Button variant="success" onClick={handleCredit} loading={creditMutation.isPending}>Confirm Credit</Button>
          </div>
        </div>
      </Modal>

      {/* Reject modal */}
      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Deposit">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-white/70 text-sm">Reason</label>
            <select className="input-sw" value={rejectReason} onChange={e => setRejectReason(e.target.value)}>
              {REJECT_REASONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          {rejectReason === 'Other' && (
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-white/70 text-sm">Details</label>
              <textarea
                className="input-sw min-h-[80px] resize-none"
                value={rejectOther}
                onChange={e => setRejectOther(e.target.value)}
                placeholder="Describe the issue…"
              />
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} loading={rejectMutation.isPending}>Reject Deposit</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function DepositRow({ dep, selected, onClick }: { dep: any; selected: boolean; onClick: () => void }) {
  if (!dep) return null;
  const getAmount = (d: any) => {
    if (!d) return 0;
    const val = d.usdValue ?? d.amountUsd ?? 0;
    return typeof val === 'number' ? val : parseFloat(val) || 0;
  };
  const amount = getAmount(dep);
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left card p-3 flex items-center gap-3 transition-all',
        selected ? 'border-gold/30 bg-gold/5' : 'hover:border-sw-border-2'
      )}
    >
      <InitialsAvatar name={dep.user?.username ?? '?'} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-heading font-semibold text-white text-sm truncate">{dep.user?.username}</p>
          <Badge variant={dep.user?.tier?.slug ?? 'bronze'} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-body text-white/40 text-xs">{dep.method}</span>
          <span className="font-body text-white/60 text-xs font-medium">${amount.toFixed(2)}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Badge variant={dep.status} />
        <span className="font-body text-white/30 text-xs">
          {formatDistanceToNow(new Date(dep.createdAt), { addSuffix: true })}
        </span>
      </div>
    </button>
  );
}

function Detail({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="font-body text-white/30 text-xs">{label}</p>
      {children ?? <p className="font-body text-white text-sm">{value}</p>}
    </div>
  );
}