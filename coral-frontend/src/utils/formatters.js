import { formatDistanceToNow } from 'date-fns';

export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch (e) {
    return '';
  }
};

export const formatNumber = (num, decimals = 2) => {
  if (num === undefined || num === null) return '0.00';
  return Number(num).toFixed(decimals);
};
