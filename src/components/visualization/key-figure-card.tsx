import React from 'react';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import { clsx } from 'clsx';

export type ChangeType = 'increase' | 'decrease' | 'neutral';

export interface KeyFigureCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ElementType;
  iconColor?: string;
  change?: string;
  changeType?: ChangeType;
  interpretation?: 'positive' | 'negative' | 'neutral';
  className?: string;
}

/**
 * KeyFigureCard - A consistent card component for displaying key figures throughout the app.
 * 
 * @param title - The title/label of the key figure
 * @param value - The main value/statistic to display
 * @param subtitle - Optional smaller text to display below the value
 * @param icon - Optional icon component to display (from Heroicons or similar)
 * @param iconColor - Background color class for the icon (e.g., 'bg-blue-500')
 * @param change - Optional text showing the change (e.g., '+3.2%')
 * @param changeType - Whether the change is an 'increase', 'decrease', or 'neutral'
 * @param interpretation - Override whether the change should be interpreted as 'positive', 'negative', or 'neutral'
 *                       - Use this for metrics where increases might be bad (e.g., expenses, overdue payments)
 * @param className - Additional class names to apply to the card
 */
export default function KeyFigureCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'bg-blue-500',
  change,
  changeType = 'neutral',
  interpretation,
  className,
}: KeyFigureCardProps) {
  // Determine the change color based on changeType and interpretation
  // For some metrics (like expenses), an increase might be bad and a decrease good
  const getChangeColor = () => {
    // If interpretation is explicitly provided, use it
    if (interpretation === 'positive') return 'text-green-600';
    if (interpretation === 'negative') return 'text-red-600';
    if (interpretation === 'neutral') return 'text-gray-600';
    
    // Default behavior based on changeType
    return changeType === 'increase' 
      ? 'text-green-600' 
      : changeType === 'decrease' 
        ? 'text-red-600' 
        : 'text-gray-600';
  };

  return (
    <div className={clsx(
      'relative overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 shadow sm:px-6 sm:pt-6',
      className
    )}>
      <dt>
        {Icon && (
          <div className={clsx('absolute rounded-md p-3', iconColor)}>
            <Icon className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
        )}
        <p className={clsx(
          'truncate text-sm font-medium text-gray-500',
          Icon ? 'ml-16' : ''
        )}>
          {title}
        </p>
      </dt>
      <dd className={clsx('flex flex-col', Icon ? 'ml-16' : '')}>
        <p className={clsx(
          'font-semibold text-gray-900 break-words',
          // Responsive font sizing based on content length
          value.length > 15 ? 'text-xl' : value.length > 10 ? 'text-2xl' : 'text-3xl'
        )}>
          {value}
        </p>
        
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        )}
        
        {change && (
          <p className={clsx('mt-1 flex items-center text-sm font-medium', getChangeColor())}>
            {changeType === 'increase' && (
              <ArrowUpIcon 
                className="mr-1 h-4 w-4 flex-shrink-0 self-center" 
                aria-hidden="true" 
              />
            )}
            {changeType === 'decrease' && (
              <ArrowDownIcon 
                className="mr-1 h-4 w-4 flex-shrink-0 self-center" 
                aria-hidden="true" 
              />
            )}
            <span className="sr-only">
              {changeType === 'increase' ? 'Increased' : changeType === 'decrease' ? 'Decreased' : 'Changed'} by
            </span>
            {change}
          </p>
        )}
      </dd>
    </div>
  );
} 