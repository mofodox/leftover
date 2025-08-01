'use client';

import React from 'react';
import { Expense } from '@/lib/types';
import { FinancialUtils, formatRelativeDate, DateUtils } from '@/lib/utils';
import { CATEGORIES, PAYMENT_METHODS } from '@/lib/constants';
import { Button } from './Button';
import { Card } from './Card';
import { cn } from '@/lib/utils';

interface ExpenseCardProps {
  expense: Expense;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expenseId: string) => void;
  onDuplicate?: (expense: Expense) => void;
  className?: string;
}

export function ExpenseCard({
  expense,
  onEdit,
  onDelete,
  onDuplicate,
  className,
}: ExpenseCardProps) {
  const daysAgo = DateUtils.getDaysUntil(expense.date);
  const isToday = daysAgo === 0;
  const isRecent = Math.abs(daysAgo) <= 7;
  
  const getDateColor = () => {
    if (isToday) return 'text-blue-600';
    if (isRecent) return 'text-green-600';
    return 'text-gray-600';
  };

  const getCategoryInfo = (categoryValue: string) => {
    const category = CATEGORIES.find(cat => cat.value === categoryValue);
    return category || { value: categoryValue, label: categoryValue, icon: '📦' };
  };

  const getPaymentMethodLabel = (methodValue: string) => {
    const method = PAYMENT_METHODS.find(pm => pm.value === methodValue);
    return method?.label || methodValue;
  };

  const categoryInfo = getCategoryInfo(expense.category);

  return (
    <Card className={cn('p-4 hover:shadow-md transition-shadow', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{categoryInfo.icon}</span>
            <h3 className="font-semibold text-lg">{expense.description}</h3>
            {expense.isRecurring && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Recurring
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span className="font-medium text-xl text-gray-900">
              {FinancialUtils.formatCurrency(expense.amount)}
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
              {categoryInfo.label}
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
              {getPaymentMethodLabel(expense.paymentMethod)}
            </span>
          </div>
          
          <div className="text-sm text-gray-600">
            <span>Date: </span>
            <span className={getDateColor()}>
              {formatRelativeDate(expense.date)}
            </span>
            <span className="ml-1">
              ({DateUtils.formatDate(expense.date)})
            </span>
          </div>
          
          <div className="text-xs text-gray-500 mt-2">
            <span>Added {formatRelativeDate(expense.createdAt)}</span>
            {expense.updatedAt !== expense.createdAt && (
              <span className="ml-2">• Updated {formatRelativeDate(expense.updatedAt)}</span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(expense)}
            >
              Edit
            </Button>
          )}
          
          {onDuplicate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDuplicate(expense)}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              Duplicate
            </Button>
          )}
          
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(expense.id)}
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

interface ExpenseListProps {
  expenses: Expense[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (expenseId: string) => void;
  onDuplicate?: (expense: Expense) => void;
  className?: string;
  emptyMessage?: string;
}

export function ExpenseList({
  expenses,
  onEdit,
  onDelete,
  onDuplicate,
  className,
  emptyMessage = 'No expenses found.',
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  );
}