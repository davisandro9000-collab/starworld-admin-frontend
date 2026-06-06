import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/axios';
import { Button } from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { PageHeader, EmptyState } from '../components/ui/adminHelpers';
import { useAdminNotifStore } from '../stores/adminNotifStore';

interface FootballStar {
  id: string;
  name: string;
  slug: string;
  nationality: string;
  club: string;
  bio: string;
  avatarUrl: string;
}

export default function FootballAdminPage() {
  const { push } = useAdminNotifStore();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FootballStar | null>(null);
  const [formData, setFormData] = useState({
    name: '', slug: '', nationality: '', club: '', bio: '', avatarUrl: '',
  });

  const { data: stars, isLoading } = useQuery<FootballStar[]>({
    queryKey: ['admin-football-stars'],
    queryFn: () => adminApi.get('/football/stars').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => adminApi.post('/football/stars', data),
    onSuccess: () => {
      push({ title: 'Star created', body: '', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['admin-football-stars'] });
      setModalOpen(false);
    },
    onError: () => push({ title: 'Create failed', body: 'Server error', variant: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof formData }) =>
      adminApi.put(`/football/stars/${id}`, data),
    onSuccess: () => {
      push({ title: 'Star updated', body: '', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['admin-football-stars'] });
      setModalOpen(false);
    },
    onError: () => push({ title: 'Update failed', body: 'Server error', variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/football/stars/${id}`),
    onSuccess: () => {
      push({ title: 'Star deleted', body: '', variant: 'info' });
      qc.invalidateQueries({ queryKey: ['admin-football-stars'] });
    },
    onError: () => push({ title: 'Delete failed', body: 'Server error', variant: 'error' }),
  });

  const syncMatches = useMutation({
    mutationFn: () => adminApi.post('/football/matches/sync', { competition: 'WC' }),
    onSuccess: () => {
      push({ title: 'Matches synced', body: 'External data imported', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['admin-football-matches'] });
    },
    onError: () => push({ title: 'Sync failed', body: 'Server error', variant: 'error' }),
  });

  const openModal = (star: FootballStar | null = null) => {
    if (star) {
      setEditing(star);
      setFormData(star);
    } else {
      setEditing(null);
      setFormData({ name: '', slug: '', nationality: '', club: '', bio: '', avatarUrl: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="admin-page">
      <PageHeader title="Football" subtitle="Manage stars and sync matches" />
      <div className="flex gap-2 mb-6">
        <Button variant="gold" onClick={() => openModal()}>+ Add Star</Button>
        <Button variant="outline" onClick={() => syncMatches.mutate()} loading={syncMatches.isPending}>
          Sync World Cup Matches
        </Button>
      </div>

      {isLoading ? (
        <Spinner size="md" />
      ) : !stars?.length ? (
        <EmptyState icon="⚽" message="No football stars yet" />
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Name</th><th>Slug</th><th>Nationality</th><th>Club</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stars.map((star) => (
                <tr key={star.id}>
                  <td className="font-medium">{star.name}</td>
                  <td className="font-mono text-sm">{star.slug}</td>
                  <td>{star.nationality}</td>
                  <td>{star.club}</td>
                  <td className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openModal(star)}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => deleteMutation.mutate(star.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Star' : 'Add Star'}>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          <Input label="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Slug" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} required />
          <Input label="Nationality" value={formData.nationality} onChange={e => setFormData({ ...formData, nationality: e.target.value })} />
          <Input label="Club" value={formData.club} onChange={e => setFormData({ ...formData, club: e.target.value })} />
          <Input label="Avatar URL" value={formData.avatarUrl} onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })} />
          <textarea
            className="input-sw w-full"
            rows={3}
            placeholder="Bio"
            value={formData.bio}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="gold" type="submit" loading={createMutation.isPending || updateMutation.isPending}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}