import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { PageHeader, EmptyState, ConfirmModal, InitialsAvatar } from '../components/ui/adminHelpers'
import { getAdminCelebrities, createCelebrity, updateCelebrity, deleteCelebrity } from '../api/celebrities.api'
import type { CelebPayload } from '../api/celebrities.api'
import { useAdminNotifStore } from '../stores/adminNotifStore'
import { placeholders } from '../lib/placeholders'

const schema = z.object({
  name:     z.string().min(1, 'Required'),
  slug:     z.string().min(1, 'Required').regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
  bio:      z.string(),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  category: z.string().min(1, 'Required'),
  active:   z.boolean(),
})
type FormValues = z.infer<typeof schema>

export default function CelebritiesPage() {
  const { push } = useAdminNotifStore()
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)

  const { data: celebs = [], isLoading } = useQuery({
    queryKey: ['admin-celebrities'],
    queryFn: getAdminCelebrities,
  })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', bio: '', imageUrl: '', category: '', active: true },
  })

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', slug: '', bio: '', imageUrl: '', category: '', active: true })
    setModalOpen(true)
  }

  const openEdit = (c: any) => {
    setEditing(c)
    reset({ name: c.name, slug: c.slug, bio: c.bio ?? '', imageUrl: c.imageUrl ?? '', category: c.category, active: c.active })
    setModalOpen(true)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('name', e.target.value)
    if (!editing) {
      setValue('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
    }
  }

  const createMutation = useMutation({
    mutationFn: createCelebrity,
    onSuccess: () => {
      push({ title: 'Celebrity created', body: '', variant: 'success' })
      qc.invalidateQueries({ queryKey: ['admin-celebrities'] })
      setModalOpen(false)
    },
    onError: () => push({ title: 'Create failed', body: 'Server error', variant: 'error' }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CelebPayload }) => updateCelebrity(id, data),
    onSuccess: () => {
      push({ title: 'Celebrity updated', body: '', variant: 'success' })
      qc.invalidateQueries({ queryKey: ['admin-celebrities'] })
      setModalOpen(false)
    },
    onError: () => push({ title: 'Update failed', body: 'Server error', variant: 'error' }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCelebrity(id),
    onSuccess: () => {
      push({ title: 'Celebrity deleted', body: '', variant: 'info' })
      qc.invalidateQueries({ queryKey: ['admin-celebrities'] })
      setDeleteTarget(null)
    },
    onError: () => push({ title: 'Delete failed', body: 'Server error', variant: 'error' }),
  })

  const onSubmit = (values: FormValues) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: values as CelebPayload })
    } else {
      createMutation.mutate(values as CelebPayload)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="admin-page">
      <PageHeader
        title="Celebrities"
        subtitle="Manage the celebrity roster"
        action={<Button variant="gold" onClick={openCreate}>+ Add Celebrity</Button>}
      />

      {isLoading ? (
        <div className="flex justify-center pt-16"><Spinner size="md" /></div>
      ) : celebs.length === 0 ? (
        <EmptyState icon="⭐" message="No celebrities yet — add one to get started" />
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                {['Celebrity', 'Slug', 'Category', 'Active', 'Actions'].map(h => (
                  <th key={h} className="font-body text-white/40 text-xs font-medium text-left px-3 py-2 border-b border-sw-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {celebs.map((c: any) => (
                <tr key={c.id} className="border-b border-sw-border/40 hover:bg-sw-card-2 transition-colors">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={c.imageUrl || placeholders.celebrityAvatar(c.name)}
                        alt={c.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => { e.currentTarget.src = placeholders.celebrityAvatar(c.name); }}
                      />
                      <p className="font-heading font-semibold text-white text-sm">{c.name}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono text-white/50 text-xs">{c.slug}</td>
                  <td className="px-3 py-3 font-body text-white/60 text-sm">{c.category}</td>
                  <td className="px-3 py-3">
                    <span className={`font-body text-xs font-semibold ${c.active ? 'text-win' : 'text-loss'}`}>
                      {c.active ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => openEdit(c)}>Edit</Button>
                      <Button variant="danger" onClick={() => setDeleteTarget(c)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit ${editing.name}` : 'Add Celebrity'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Name" error={errors.name?.message} {...register('name')} onChange={handleNameChange} />
          <Input label="Slug" error={errors.slug?.message} hint="Auto-generated — override if needed" {...register('slug')} />
          <Input label="Category" placeholder="e.g. Music, Sports, Film" error={errors.category?.message} {...register('category')} />
          <Input label="Image URL (optional)" error={errors.imageUrl?.message} {...register('imageUrl')} />
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-white/70 text-sm">Bio</label>
            <textarea className="input-sw min-h-[80px] resize-none" {...register('bio')} />
            {errors.bio && <p className="font-body text-loss text-xs">{errors.bio.message}</p>}
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('active')} className="w-4 h-4 accent-[#FFD700]" />
            <span className="font-body text-white/70 text-sm">Active (visible to users)</span>
          </label>
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="gold" type="submit" loading={isPending}>
              {editing ? 'Save Changes' : 'Create Celebrity'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete Celebrity"
        body={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}