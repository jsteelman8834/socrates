'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  type: 'knowledge' | 'wisdom';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProgressBar({
  value,
  max,
  label,
  type,
  showLabel = true,
  size = 'md',
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const typeStyles = {
    knowledge: {
      bg: 'bg-blue-100',
      fill: 'bg-gradient-to-r from-blue-400 to-blue-600',
      text: 'text-blue-600',
      icon: '📚',
      name: 'Knowledge',
    },
    wisdom: {
      bg: 'bg-amber-100',
      fill: 'bg-gradient-to-r from-amber-400 to-amber-600',
      text: 'text-amber-600',
      icon: '🦉',
      name: 'Wisdom',
    },
  };

  const sizeStyles = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const styles = typeStyles[type];

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className={cn('text-sm font-medium', styles.text)}>
            {styles.icon} {label || styles.name}
          </span>
          <span className={cn('text-sm font-medium', styles.text)}>
            {value}/{max}
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          styles.bg,
          sizeStyles[size]
        )}
      >
        <motion.div
          className={cn('h-full rounded-full', styles.fill)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
