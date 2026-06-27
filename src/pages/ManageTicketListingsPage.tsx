// admin/src/pages/ManageTicketListingsPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/axios';
import { Button } from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { PageHeader, EmptyState } from '../components/ui/adminHelpers';
import Badge from '../components/ui/Badge';

interface TicketListing {
  id: string;
  matchId: string;
  match: { homeTeam: { name: string }; awayTeam: { name: string }; matchDate: string; venue: string };
  priceCoins: number;
  seatInfo: string;
  status: string;
  expiresAt: string;
}

export default function ManageTicketListingsPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ matchId: '', priceCoins: 100, seatInfo: '', expiresAt: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-ticket-listings'],
    queryFn: () => adminApi.get('/admin/football/tickets/listings').then(res => res.data),
  });
  const listings: TicketListing[] = data?.listings || [];

  const createMutation = useMutation({
    mutationFn: (payload: any) => adminApi.post('/admin/football/tickets/listings', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-ticket-listings'] }); setModalOpen(false); },
  });
  const cancelMutation = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/admin/football/tickets/listings/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-ticket-listings'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div className="admin-page">
      <PageHeader title="Ticket Resale Listings" subtitle="Create and manage resale tickets" />
      <div className="mb-4">
        <Button onClick={() => setModalOpen(true)}>+ New Listing</Button>
      </div>
      {isLoading ? <Spinner /> : listings.length === 0 ? <EmptyState message="No ticket listings." /> : (
        <div className="grid gap-3">
          {listings.map(listing => (
            <div key={listing.id} className="card p-4 flex justify-between items-start">
              <div>
                <h3 className="font-heading font-bold text-white">{listing.match.homeTeam.name} vs {listing.match.awayTeam.name}</h3>
                <p className="text-white/60 text-sm">{new Date(listing.match.matchDate).toLocaleString()} · {listing.match.venue}</p>
                <p className="text-white">Price: {listing.priceCoins} coins</p>
                <p className="text-white/40 text-xs">Seat: {listing.seatInfo || 'General'}</p>
                <Badge variant={listing.status === 'active' ? 'platinum' : 'bronze'}>{listing.status}</Badge>
              </div>
              {listing.status === 'active' && (
                <Button variant="danger" size="sm" onClick={() => cancelMutation.mutate(listing.id)}>Cancel</Button>
              )}
            </div>
          ))}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Ticket Listing">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Match ID" value={form.matchId} onChange={e => setForm({ ...form, matchId: e.target.value })} required />
          <Input label="Price (Coins)" type="number" value={form.priceCoins} onChange={e => setForm({ ...form, priceCoins: parseInt(e.target.value) })} required />
          <Input label="Seat Info" value={form.seatInfo} onChange={e => setForm({ ...form, seatInfo: e.target.value })} />
          <Input label="Expires At (UTC)" type="datetime-local" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} required />
          <Button type="submit" className="w-full">Create</Button>
        </form>
      </Modal>
    </div>
  );
}