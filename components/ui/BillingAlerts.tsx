'use client';

import React from 'react';
import { Subscription } from '@/lib/types';
import { DateUtils, FinancialUtils } from '@/lib/utils';
import { Card } from './Card';
import { Button } from './Button';

interface BillingAlertsProps {
  subscriptions: Subscription[];
  onViewSubscription?: (subscription: Subscription) => void;
  className?: string;
}

export function BillingAlerts({
  subscriptions,
  onViewSubscription,
  className,
}: BillingAlertsProps) {
  const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
  
  // Get overdue subscriptions
  const overdueSubscriptions = activeSubscriptions.filter(sub => {
    const daysUntil = DateUtils.getDaysUntil(sub.nextBillingDate);
    return daysUntil < 0;
  });

  // Get subscriptions due soon (within 3 days)
  const dueSoonSubscriptions = activeSubscriptions.filter(sub => {
    const daysUntil = DateUtils.getDaysUntil(sub.nextBillingDate);
    return daysUntil >= 0 && daysUntil <= 3;
  });

  // Get subscriptions due this week (4-7 days)
  const dueThisWeekSubscriptions = activeSubscriptions.filter(sub => {
    const daysUntil = DateUtils.getDaysUntil(sub.nextBillingDate);
    return daysUntil >= 4 && daysUntil <= 7;
  });

  if (overdueSubscriptions.length === 0 && dueSoonSubscriptions.length === 0 && dueThisWeekSubscriptions.length === 0) {
    return null;
  }

  const formatSubscriptionAlert = (subscription: Subscription, daysUntil: number) => {
    const cost = FinancialUtils.formatCurrency(subscription.cost);
    const timeText = daysUntil < 0 
      ? `${Math.abs(daysUntil)} day${Math.abs(daysUntil) > 1 ? 's' : ''} overdue`
      : daysUntil === 0 
        ? 'due today'
        : daysUntil === 1 
          ? 'due tomorrow'
          : `due in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`;

    return { cost, timeText };
  };

  return (
    <div className={className}>
      {/* Overdue Subscriptions */}
      {overdueSubscriptions.length > 0 && (
        <Card className="p-4 border-red-200 bg-red-50 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="font-semibold text-red-800">Overdue Subscriptions</h3>
          </div>
          <div className="space-y-2">
            {overdueSubscriptions.map(subscription => {
              const daysUntil = DateUtils.getDaysUntil(subscription.nextBillingDate);
              const { cost, timeText } = formatSubscriptionAlert(subscription, daysUntil);
              
              return (
                <div key={subscription.id} className="flex items-center justify-between bg-white rounded p-3">
                  <div>
                    <p className="font-medium text-gray-900">{subscription.name}</p>
                    <p className="text-sm text-red-600">{cost} - {timeText}</p>
                  </div>
                  {onViewSubscription && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewSubscription(subscription)}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      View
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Due Soon Subscriptions */}
      {dueSoonSubscriptions.length > 0 && (
        <Card className="p-4 border-yellow-200 bg-yellow-50 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <h3 className="font-semibold text-yellow-800">Due Soon</h3>
          </div>
          <div className="space-y-2">
            {dueSoonSubscriptions.map(subscription => {
              const daysUntil = DateUtils.getDaysUntil(subscription.nextBillingDate);
              const { cost, timeText } = formatSubscriptionAlert(subscription, daysUntil);
              
              return (
                <div key={subscription.id} className="flex items-center justify-between bg-white rounded p-3">
                  <div>
                    <p className="font-medium text-gray-900">{subscription.name}</p>
                    <p className="text-sm text-yellow-600">{cost} - {timeText}</p>
                  </div>
                  {onViewSubscription && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewSubscription(subscription)}
                      className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                    >
                      View
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Due This Week Subscriptions */}
      {dueThisWeekSubscriptions.length > 0 && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex items-center gap-2 mb-3">
            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <h3 className="font-semibold text-blue-800">Due This Week</h3>
          </div>
          <div className="space-y-2">
            {dueThisWeekSubscriptions.map(subscription => {
              const daysUntil = DateUtils.getDaysUntil(subscription.nextBillingDate);
              const { cost, timeText } = formatSubscriptionAlert(subscription, daysUntil);
              
              return (
                <div key={subscription.id} className="flex items-center justify-between bg-white rounded p-3">
                  <div>
                    <p className="font-medium text-gray-900">{subscription.name}</p>
                    <p className="text-sm text-blue-600">{cost} - {timeText}</p>
                  </div>
                  {onViewSubscription && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewSubscription(subscription)}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      View
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}