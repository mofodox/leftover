'use client';

import React from 'react';
import { Card } from './Card';
import { Subscription, Expense } from '../../lib/types';
import { CURRENCY_SYMBOL } from '../../lib/constants';
import { DateUtils } from '../../lib/utils';

interface FinancialSummaryProps {
  subscriptions: Subscription[];
  expenses: Expense[];
  className?: string;
}

interface SummaryCard {
  title: string;
  amount: number;
  description: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  subscriptions,
  expenses,
  className = ''
}) => {
  // Calculate subscription totals
  const calculateSubscriptionTotals = () => {
    const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
    
    const monthlyTotal = activeSubscriptions.reduce((total, sub) => {
      switch (sub.billingCycle) {
        case 'monthly':
          return total + sub.cost;
        case 'quarterly':
          return total + (sub.cost / 3);
        case 'yearly':
          return total + (sub.cost / 12);
        default:
          return total;
      }
    }, 0);

    const yearlyTotal = monthlyTotal * 12;

    return { monthlyTotal, yearlyTotal };
  };

  // Calculate expense totals for different periods
  const calculateExpenseTotals = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Current month expenses
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });

    // Last month expenses
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === lastMonth && 
             expenseDate.getFullYear() === lastMonthYear;
    });

    // Current year expenses
    const currentYearExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === currentYear;
    });

    const currentMonthTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const currentYearTotal = currentYearExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate trend
    const monthlyTrend = lastMonthTotal > 0 
      ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
      : 0;

    return {
      currentMonthTotal,
      lastMonthTotal,
      currentYearTotal,
      monthlyTrend
    };
  };

  // Calculate category breakdown
  const calculateCategoryBreakdown = () => {
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5); // Top 5 categories
  };

  const { monthlyTotal: subscriptionMonthly, yearlyTotal: subscriptionYearly } = calculateSubscriptionTotals();
  const { 
    currentMonthTotal, 
    lastMonthTotal, 
    currentYearTotal, 
    monthlyTrend 
  } = calculateExpenseTotals();
  const topCategories = calculateCategoryBreakdown();

  const summaryCards: SummaryCard[] = [
    {
      title: 'Monthly Subscriptions',
      amount: subscriptionMonthly,
      description: `${subscriptions.filter(s => s.isActive).length} active subscriptions`,
      trend: 'neutral'
    },
    {
      title: 'Yearly Subscriptions',
      amount: subscriptionYearly,
      description: 'Total annual subscription cost',
      trend: 'neutral'
    },
    {
      title: 'This Month Expenses',
      amount: currentMonthTotal,
      description: 'Current month spending',
      trend: monthlyTrend > 0 ? 'up' : monthlyTrend < 0 ? 'down' : 'neutral',
      trendValue: Math.abs(monthlyTrend)
    },
    {
      title: 'This Year Expenses',
      amount: currentYearTotal,
      description: 'Total spending this year',
      trend: 'neutral'
    }
  ];

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-red-600';
      case 'down':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
                {card.trend && (
                  <span className={`text-sm ${getTrendColor(card.trend)}`}>
                    {getTrendIcon(card.trend)}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">
                  {CURRENCY_SYMBOL}{card.amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">{card.description}</p>
                {card.trendValue && card.trendValue > 0 && (
                  <p className={`text-xs ${getTrendColor(card.trend)}`}>
                    {card.trendValue.toFixed(1)}% vs last month
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Category Breakdown */}
      {topCategories.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Expense Categories</h3>
          <div className="space-y-3">
            {topCategories.map(([category, amount], index) => {
              const percentage = currentYearTotal > 0 ? (amount / currentYearTotal) * 100 : 0;
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" style={{
                      backgroundColor: `hsl(${(index * 60) % 360}, 70%, 50%)`
                    }}></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {category}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {CURRENCY_SYMBOL}{amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {subscriptions.filter(s => s.isActive).length}
            </p>
            <p className="text-sm text-gray-600">Active Subscriptions</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {expenses.length}
            </p>
            <p className="text-sm text-gray-600">Total Expenses</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {topCategories.length}
            </p>
            <p className="text-sm text-gray-600">Expense Categories</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FinancialSummary;