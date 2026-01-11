import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 5) return '🔥';
  if (streak >= 3) return '⚡';
  if (streak >= 1) return '✨';
  return '';
}

export function getTierColor(tier: number): string {
  switch (tier) {
    case 1:
      return 'from-green-400 to-green-600';
    case 2:
      return 'from-blue-400 to-blue-600';
    case 3:
      return 'from-purple-400 to-purple-600';
    case 4:
      return 'from-amber-400 to-amber-600';
    default:
      return 'from-gray-400 to-gray-600';
  }
}

export function getTierName(tier: number): string {
  switch (tier) {
    case 1:
      return 'Beginner';
    case 2:
      return 'Explorer';
    case 3:
      return 'Scholar';
    case 4:
      return 'Master';
    default:
      return 'Unknown';
  }
}
