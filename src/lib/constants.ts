export const COIN_RATE = 3
export const usdToCoins = (usd: number) => Math.floor(usd * COIN_RATE)
export const coinsToUsd = (coins: number) => (coins / COIN_RATE).toFixed(2)
