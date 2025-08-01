'use client';

import React from 'react';
import { Subscription } from '@/lib/types';
import { FinancialUtils, formatRelativeDate, DateUtils } from '@/lib/utils';
import { Button } from './Button';
import { Card } from './Card';
import { cn } from '@/lib/utils';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit?: (subscription: Subscription) => void;
  onDelete?: (subscriptionId: string) => void;
  onToggleActive?: (subscriptionId: string) => void;
  className?: string;
}

export function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
  onToggleActive,
  className,
}: SubscriptionCardProps) {
  const daysUntilBilling = DateUtils.getDaysUntil(subscription.nextBillingDate);
  const isOverdue = daysUntilBilling < 0;
  const isDueSoon = daysUntilBilling <= 3 && daysUntilBilling >= 0;
  
  const getStatusColor = () => {
    if (!subscription.isActive) return 'text-gray-500';
    if (isOverdue) return 'text-red-600';
    if (isDueSoon) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusText = () => {
    if (!subscription.isActive) return 'Paused';
    if (isOverdue) return 'Overdue';
    if (isDueSoon) return 'Due Soon';
    return 'Active';
  };

  const getBillingCycleDisplay = (cycle: string) => {
    switch (cycle) {
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'yearly': return 'Yearly';
      default: return cycle;
    }
  };

  return (
    <Card className={cn('p-4 hover:shadow-md transition-shadow', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">{subscription.name}</h3>
            <span className={cn('text-sm font-medium', getStatusColor())}>
              {getStatusText()}
            </span>
          </div>
          
          {subscription.description && (
            <p className="text-gray-600 text-sm mb-2">{subscription.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span className="font-medium text-lg text-gray-900">
              {FinancialUtils.formatCurrency(subscription.cost)}
            </span>
            <span>/ {getBillingCycleDisplay(subscription.billingCycle)}</span>
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
              {subscription.category}
            </span>
          </div>
          
          <div className="text-sm text-gray-600">
            <span>Next billing: </span>
            <span className={getStatusColor()}>
              {formatRelativeDate(subscription.nextBillingDate)}
            </span>
            <span className="ml-1">
              ({DateUtils.formatDate(subscription.nextBillingDate)})
            </span>
          </div>
          
          {subscription.website && (
            <a
              href={subscription.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm mt-1 inline-block"
            >
              Visit website →
            </a>
          )}
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          {onToggleActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleActive(subscription.id)}
              className={cn(
                subscription.isActive 
                  ? 'text-yellow-600 border-yellow-600 hover:bg-yellow-50' 
                  : 'text-green-600 border-green-600 hover:bg-green-50'
              )}
            >
              {subscription.isActive ? 'Pause' : 'Resume'}
            </Button>
          )}
          
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(subscription)}
            >
              Edit
            </Button>
          )}
          
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(subscription.id)}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onEdit?: (subscription: Subscription) => void;
  onDelete?: (subscriptionId: string) => void;
  onToggleActive?: (subscriptionId: string) => void;
  className?: string;
  emptyMessage?: string;
}

export function SubscriptionList({
  subscriptions,
  onEdit,
  onDelete,
  onToggleActive,
  className,
  emptyMessage = 'No subscriptions found.',
}: SubscriptionListProps) {
  if (subscriptions.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {subscriptions.map((subscription) => (
        <SubscriptionCard
          key={subscription.id}
          subscription={subscription}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  );
}