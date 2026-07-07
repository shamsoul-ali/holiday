import { format, parseISO, differenceInDays } from 'date-fns';

export const formatDate = (dateStr: string): string => {
  return format(parseISO(dateStr), 'dd MMM yyyy');
};

export const formatDateShort = (dateStr: string): string => {
  return format(parseISO(dateStr), 'dd MMM');
};

export const formatDateRange = (start: string, end: string): string => {
  return `${formatDateShort(start)} - ${formatDateShort(end)}`;
};

export const getDuration = (start: string, end: string): string => {
  const days = differenceInDays(parseISO(end), parseISO(start));
  return `${days + 1}D${days}N`;
};

export const getRelativeTime = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateShort(dateStr);
};
