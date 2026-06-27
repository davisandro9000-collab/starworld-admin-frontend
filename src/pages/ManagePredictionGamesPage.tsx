// admin/src/pages/ManagePredictionGamesPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/axios';
import { Button } from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { PageHeader, EmptyState } from '../components/ui/adminHelpers';
import Badge from '../components/ui/Badge';

interface PredictionGame {
  id: string;
  name: string;
  description: string;
  predictionType: string;
  matchId: string | null;
  points: number;
  coinReward: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export default function ManagePredictionGamesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PredictionGame | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    predictionType: 'WINNER',
    matchId: '',
    points: 10,
    coinReward: 5,
    startsAt: '',
    endsAt: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-prediction-games'],
    queryFn: () => adminApi.get('/admin/football/predictions/games').then(res => res.data),
  });
  const games: PredictionGame[] = data?.games || [];

  const createMutation = useMutation({
    mutationFn: (payload: any) => adminApi.post('/admin/football/predictions/games', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-prediction-games'] });
      setModalOpen(false);
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) =>
      adminApi.put(`/admin/football/predictions/games/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-prediction-games'] });
      setModalOpen(false);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/admin/football/predictions/games/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-prediction-games'] }),
  });
  const resolveMutation = useMutation({
    mutationFn: ({ id, winnerTeamId }: { id: string; winnerTeamId: string }) =>
      adminApi.post(`/admin/football/predictions/games/${id}/resolve`, { correctTeamId: winnerTeamId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-prediction-games'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, ...form });
    else createMutation.mutate(form);
  };

  const handleEdit = (game: PredictionGame) => {
    setEditing(game);
    setForm({
      name: game.name,
      description: game.description || '',
      predictionType: game.predictionType,
      matchId: game.matchId || '',
      points: game.points,
      coinReward: game.coinReward,
      startsAt: game.startsAt.slice(0, 16),
      endsAt: game.endsAt.slice(0, 16),
    });
    setModalOpen(true);
  };

  return (
    <div className="admin-page">
      <PageHeader title="Prediction Games" subtitle="Manage and resolve prediction contests" />
      <div className="mb-4">
        <Button onClick={() => { setEditing(null); setForm({ name: '', description: '', predictionType: 'WINNER', matchId: '', points: 10, coinReward: 5, startsAt: '', endsAt: '' }); setModalOpen(true); }}>
          + New Game
        </Button>
      </div>
      {isLoading ? <Spinner /> : games.length === 0 ? <EmptyState message="No prediction games yet." /> : (
        <div className="grid gap-3">
          {games.map(game => (
            <div key={game.id} className="card p-4 flex justify-between items-start">
              <div>
                <h3 className="font-heading font-bold text-white">{game.name}</h3>
                <p className="text-white/60 text-sm">{game.description}</p>
                <div className="flex gap-3 mt-2 text-xs text-white/40">
                  <span>Type: {game.predictionType}</span>
                  <span>Points: {game.points}</span>
                  <span>Coins: {game.coinReward}</span>
                  <Badge variant={game.isActive ? 'platinum' : 'bronze'}>{game.isActive ? 'Active' : 'Resolved'}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(game)}>Edit</Button>
                <Button variant="danger" size="sm" onClick={() => deleteMutation.mutate(game.id)}>Delete</Button>
                {game.isActive && (
                  <Button variant="success" size="sm" onClick={() => {
                    const winnerId = prompt('Enter winner team ID:');
                    if (winnerId) resolveMutation.mutate({ id: game.id, winnerTeamId: winnerId });
                  }}>Resolve</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Game' : 'New Game'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Input label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <label className="block text-white/70 text-sm">Prediction Type</label>
          <select className="input-sw w-full" value={form.predictionType} onChange={e => setForm({ ...form, predictionType: e.target.value })}>
            <option value="WINNER">Winner</option>
            <option value="FIRST_SCORER">First Scorer</option>
            <option value="ASSIST">Assist</option>
            <option value="NEXT_STAGE">Next Stage</option>
          </select>
          <Input label="Match ID" value={form.matchId} onChange={e => setForm({ ...form, matchId: e.target.value })} />
          <Input label="Points" type="number" value={form.points} onChange={e => setForm({ ...form, points: parseInt(e.target.value) })} required />
          <Input label="Coin Reward" type="number" value={form.coinReward} onChange={e => setForm({ ...form, coinReward: parseInt(e.target.value) })} required />
          <Input label="Start Date (UTC)" type="datetime-local" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} required />
          <Input label="End Date (UTC)" type="datetime-local" value={form.endsAt} onChange={e => setForm({ ...form, endsAt: e.target.value })} required />
          <Button type="submit" className="w-full">Save</Button>
        </form>
      </Modal>
    </div>
  );
}