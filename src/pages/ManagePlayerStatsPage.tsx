// admin/src/pages/ManagePlayerStatsPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/axios';
import { Button } from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { PageHeader, EmptyState } from '../components/ui/adminHelpers';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

interface Player {
  id: string;
  name: string;
  position: string;
  number: number;
  goals: number;
  assists: number;
  team: { name: string };
}

export default function ManagePlayerStatsPage() {
  const qc = useQueryClient();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-players'],
    queryFn: () => adminApi.get('/admin/football/players').then((res: any) => res.data),
  });
  const players: Player[] = data?.players || [];

  const updateStatsMutation = useMutation({
    mutationFn: ({ id, goals, assists }: { id: string; goals: number; assists: number }) =>
      adminApi.patch(`/admin/football/players/${id}/stats`, { goals, assists }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-players'] }); setModalOpen(false); },
  });

  const handleUpdate = (player: Player) => {
    setSelectedPlayer(player);
    setGoals(player.goals);
    setAssists(player.assists);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;
    updateStatsMutation.mutate({ id: selectedPlayer.id, goals, assists });
  };

  return (
    <div className="admin-page">
      <PageHeader title="Player Stats" subtitle="Update goals and assists for World Cup players" />
      {isLoading ? <Spinner /> : players.length === 0 ? <EmptyState message="No players found." /> : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sw-card-2">
              <tr className="text-white/60 text-sm">
                <th className="p-2 text-left">Team</th>
                <th className="p-2 text-left">Player</th>
                <th className="p-2 text-left">Position</th>
                <th className="p-2 text-right">Goals</th>
                <th className="p-2 text-right">Assists</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <tr key={player.id} className="border-t border-sw-border/30">
                  <td className="p-2 text-white/80">{player.team.name}</td>
                  <td className="p-2 text-white">{player.name}</td>
                  <td className="p-2 text-white/60">{player.position || '—'}</td>
                  <td className="p-2 text-white text-right">{player.goals}</td>
                  <td className="p-2 text-white text-right">{player.assists}</td>
                  <td className="p-2 text-center">
                    <Button variant="ghost" size="sm" onClick={() => handleUpdate(player)}>Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Update ${selectedPlayer?.name}`}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Goals" type="number" value={goals} onChange={e => setGoals(parseInt(e.target.value))} required />
          <Input label="Assists" type="number" value={assists} onChange={e => setAssists(parseInt(e.target.value))} required />
          <Button type="submit" className="w-full">Save</Button>
        </form>
      </Modal>
    </div>
  );
}