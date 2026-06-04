import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/axios';
import { Button } from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { PageHeader } from '../components/ui/adminHelpers';
import { useAdminNotifStore } from '../stores/adminNotifStore';
import Spinner from '../components/ui/Spinner';

interface Promotion {
  id: string;
  type: 'hero' | 'card';
  title: string;
  description?: string;
  imageUrl?: string;
  accentColor?: string;
  ctaText?: string;
  ctaLink?: string;
  sortOrder: number;
  isActive: boolean;
}

const getPromotions = () => adminApi.get('/promotions').then(r => r.data.promotions);
const createPromotion = (data: Partial<Promotion>) => adminApi.post('/promotions', data).then(r => r.data.promotion);
const updatePromotion = ({ id, data }: { id: string; data: Partial<Promotion> }) => adminApi.put(`/promotions/${id}`, data).then(r => r.data.promotion);
const deletePromotion = (id: string) => adminApi.delete(`/promotions/${id}`).then(r => r.data);

export default function PromotionsPage() {
  const { push } = useAdminNotifStore();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState<Partial<Promotion>>({ type: 'card', isActive: true });

  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ['admin-promotions'],
    queryFn: getPromotions,
  });

  const createMutation = useMutation({
    mutationFn: createPromotion,
    onSuccess: () => {
      push({ title: 'Promotion created', body: '', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['admin-promotions'] });
      setModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: updatePromotion,
    onSuccess: () => {
      push({ title: 'Promotion updated', body: '', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['admin-promotions'] });
      setModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePromotion,
    onSuccess: () => {
      push({ title: 'Promotion deleted', body: '', variant: 'info' });
      qc.invalidateQueries({ queryKey: ['admin-promotions'] });
    },
  });

  const resetForm = () => {
    setEditing(null);
    setFormData({ type: 'card', isActive: true });
  };

  const openCreate = (type: 'hero' | 'card') => {
    setEditing(null);
    setFormData({ type, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (promo: Promotion) => {
    setEditing(promo);
    setFormData(promo);
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const heroPromo = promotions.find((p: Promotion) => p.type === 'hero');
  const cardPromos = promotions.filter((p: Promotion) => p.type === 'card').sort((a: Promotion, b: Promotion) => a.sortOrder - b.sortOrder);

  if (isLoading) return <div className="flex justify-center pt-16"><Spinner size="md" /></div>;

  return (
    <div className="admin-page space-y-8">
      <PageHeader
        title="Promotions"
        subtitle="Manage hero banner and giveaway cards on the landing page"
      />

      {/* Hero Promotion */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-white text-lg">Hero Banner</h2>
          {heroPromo ? (
            <Button variant="outline" onClick={() => openEdit(heroPromo)}>Edit Hero</Button>
          ) : (
            <Button variant="gold" onClick={() => openCreate('hero')}>Create Hero</Button>
          )}
        </div>
        {heroPromo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span className="text-white/40">Title:</span> {heroPromo.title}</div>
            <div><span className="text-white/40">Image URL:</span> {heroPromo.imageUrl || '—'}</div>
            <div className="col-span-2"><span className="text-white/40">Description:</span> {heroPromo.description || '—'}</div>
            <div><span className="text-white/40">CTA Text:</span> {heroPromo.ctaText || '—'}</div>
            <div><span className="text-white/40">Active:</span> {heroPromo.isActive ? '✅ Yes' : '❌ No'}</div>
          </div>
        ) : (
          <p className="text-white/40">No hero promotion set. Click "Create Hero" to add one.</p>
        )}
      </div>

      {/* Card Promotions */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-white text-lg">Giveaway Cards</h2>
          <Button variant="gold" onClick={() => openCreate('card')}>+ Add Card</Button>
        </div>
        {cardPromos.length === 0 ? (
          <p className="text-white/40">No cards yet. Add one to display on landing page.</p>
        ) : (
          <div className="space-y-3">
            {cardPromos.map((promo: Promotion) => (
              <div key={promo.id} className="flex items-center justify-between p-3 bg-sw-card-2 rounded-lg border border-sw-border">
                <div className="flex-1">
                  <p className="font-heading font-semibold text-white">{promo.title}</p>
                  <p className="text-xs text-white/40 truncate">{promo.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(promo)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => deleteMutation.mutate(promo.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Promotion' : 'Add Promotion'}>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex flex-col gap-4">
          <Input
            label="Title"
            value={formData.title || ''}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-white/70 text-sm font-medium mb-1.5">Description</label>
            <textarea
              className="input-sw w-full"
              rows={3}
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <Input
            label="Image URL"
            value={formData.imageUrl || ''}
            onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://..."
          />
          <Input
            label="Accent Color (hex)"
            value={formData.accentColor || ''}
            onChange={e => setFormData({ ...formData, accentColor: e.target.value })}
            placeholder="#FFD700"
          />
          <Input
            label="CTA Text (e.g., 'Learn More')"
            value={formData.ctaText || ''}
            onChange={e => setFormData({ ...formData, ctaText: e.target.value })}
          />
          <Input
            label="CTA Link"
            value={formData.ctaLink || ''}
            onChange={e => setFormData({ ...formData, ctaLink: e.target.value })}
          />
          <Input
            label="Sort Order (for cards)"
            type="number"
            value={formData.sortOrder ?? 0}
            onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
          />
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive ?? true}
              onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 accent-[#FFD700]"
            />
            <span className="font-body text-white/70 text-sm">Active</span>
          </label>
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="gold" type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}