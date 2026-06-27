// Detect if running in development (localhost)
const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

// Admin API base – dev: localhost, prod: Railway backend URL
export const API_BASE = isDev
  ? 'http://localhost:3001/api/admin/v1'
  : 'https://starworld-backend-production.up.railway.app/api/admin/v1';

// Socket.IO URL – dev: localhost, prod: Railway URL
export const SOCKET_URL = isDev ? 'http://localhost:3001' : 'https://starworld-backend-production.up.railway.app';

export const COIN_RATE = 3;
export const usdToCoins = (usd: number) => Math.floor(usd * COIN_RATE);
export const coinsToUsd = (coins: number) => (coins / COIN_RATE).toFixed(2);