import { adminApi } from './axios';

export async function getPendingDeposits() {
  const res = await adminApi.get('/deposits/pending');
  return res.data.deposits;
}

export async function getPendingCount() {
  const res = await adminApi.get('/deposits/pending/count');
  return res.data.count;
}

export async function getDepositHistory(params?: { status?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));
  const url = `/deposits/history${query.toString() ? `?${query}` : ''}`;
  const res = await adminApi.get(url);
  return res.data;
}

// ✅ Added Idempotency-Key header
export async function creditDeposit(id: string, data: { coinsToAward: number }) {
  const idempotencyKey = crypto.randomUUID();
  const res = await adminApi.post(`/deposits/${id}/credit`, data, {
    headers: { 'Idempotency-Key': idempotencyKey }
  });
  return res.data;
}

export async function rejectDeposit(id: string, data: { reason: string }) {
  const idempotencyKey = crypto.randomUUID();
  const res = await adminApi.post(`/deposits/${id}/reject`, data, {
    headers: { 'Idempotency-Key': idempotencyKey }
  });
  return res.data;
}