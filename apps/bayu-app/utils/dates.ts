import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { DurationPreset } from '@/types';

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

const durationDaysMap: Record<DurationPreset, number> = {
  '2D1N': 2,
  '3D2N': 3,
  '4D3N': 4,
  '5D4N': 5,
  '7D6N': 7,
};

export const getDurationDays = (duration: DurationPreset): number => durationDaysMap[duration];

export const computeEndDate = (startDate: string, duration: DurationPreset): string => {
  const days = durationDaysMap[duration];
  return format(addDays(parseISO(startDate), days - 1), 'yyyy-MM-dd');
};

export const formatDurationLabel = (duration: DurationPreset): string => {
  const days = durationDaysMap[duration];
  const nights = days - 1;
  return `${days} Days ${nights} Night${nights > 1 ? 's' : ''}`;
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
