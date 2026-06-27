import NodeCache from 'node-cache';

// 5-minute TTL, check for expired keys every 60s
export const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
