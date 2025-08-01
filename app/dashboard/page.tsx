'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '../../components/ui/Navigation';
import { FinancialSummary } from '../../components/ui/FinancialSummary';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Subscription, Expense } from '../../lib/types';
import { SubscriptionStorage, ExpenseStorage } from '../../lib/storage';
import { CURRENCY_SYMBOL } from '../../lib/constants';
import { DateUtils } from '../../lib/utils';

export default function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const loadedSubscriptions = SubscriptionStorage.getAll();
      const loadedExpenses = ExpenseStorage.getAll();
      setSubscriptions(loadedSubscriptions);
      setExpenses(loadedExpenses);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate upcoming bills (next 30 days)
  const getUpcomingBills = () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return subscriptions
      .filter(sub => sub.isActive)
      .map(sub => {
        const nextBilling = new Date(sub.nextBillingDate);
        return {
          ...sub,
          nextBilling
        };
      })
      .filter(sub => sub.nextBilling <= thirtyDaysFromNow)
      .sort((a, b) => a.nextBilling.getTime() - b.nextBilling.getTime())
      .slice(0, 5); // Show next 5 upcoming bills
  };

  // Get recent expenses (last 7 days)
  const getRecentExpenses = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return expenses
      .filter(expense => new Date(expense.date) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5); // Show last 5 recent expenses
  };

  // Calculate quick stats
  const getQuickStats = () => {
    const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
    const thisMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const now = new Date();
      return expenseDate.getMonth() === now.getMonth() && 
             expenseDate.getFullYear() === now.getFullYear();
    });

    const monthlySubscriptionCost = activeSubscriptions.reduce((total, sub) => {
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

    const thisMonthExpenseTotal = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    return {
      activeSubscriptions: activeSubscriptions.length,
      monthlySubscriptionCost,
      thisMonthExpenses: thisMonthExpenses.length,
      thisMonthExpenseTotal
    };
  };

  const upcomingBills = getUpcomingBills();
  const recentExpenses = getRecentExpenses();
  const quickStats = getQuickStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation items={[]} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation items={[]} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Overview of your subscriptions and expenses
          </p>
        </div>

        {/* Financial Summary - Full Width */}
        <div className="mb-6 sm:mb-8">
          <FinancialSummary 
            subscriptions={subscriptions} 
            expenses={expenses}
          />
        </div>

        {/* Quick Stats Cards - Responsive Grid */}
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{quickStats.activeSubscriptions}</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Active Subscriptions</p>
              </div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {CURRENCY_SYMBOL}{quickStats.monthlySubscriptionCost.toFixed(0)}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Monthly Cost</p>
              </div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-purple-600">{quickStats.thisMonthExpenses}</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">This Month</p>
              </div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-orange-600">
                  {CURRENCY_SYMBOL}{quickStats.thisMonthExpenseTotal.toFixed(0)}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Total Spent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid - Responsive Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Upcoming Bills - Takes 1 column on XL, full width on smaller screens */}
          <div className="xl:col-span-1">
            <Card className="p-4 sm:p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Upcoming Bills</h2>
                <span className="text-xs sm:text-sm text-gray-500">Next 30 days</span>
              </div>
              
              {upcomingBills.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {upcomingBills.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{bill.name}</p>
                        <p className="text-sm text-gray-600">
                          Due: {DateUtils.formatDate(bill.nextBilling)}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-gray-900">
                          {CURRENCY_SYMBOL}{bill.cost.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {bill.billingCycle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 mb-4">
                  <p className="text-sm">No upcoming bills in the next 30 days</p>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full text-sm"
                  onClick={() => window.location.href = '/subscriptions'}
                >
                  View All Subscriptions
                </Button>
              </div>
            </Card>
          </div>

          {/* Recent Expenses - Takes 2 columns on XL, full width on smaller screens */}
          <div className="xl:col-span-2">
            <Card className="p-4 sm:p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Expenses</h2>
                <span className="text-xs sm:text-sm text-gray-500">Last 7 days</span>
              </div>
              
              {recentExpenses.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {recentExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{expense.description}</p>
                        <p className="text-sm text-gray-600">
                          {DateUtils.formatDate(new Date(expense.date))} • {expense.category}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-gray-900">
                          {CURRENCY_SYMBOL}{expense.amount.toFixed(2)}
                        </p>
                        {expense.isRecurring && (
                          <p className="text-xs text-blue-600">Recurring</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 mb-4">
                  <p className="text-sm">No expenses in the last 7 days</p>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full text-sm"
                  onClick={() => window.location.href = '/expenses'}
                >
                  View All Expenses
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Actions - Responsive Grid */}
        <div className="mb-6 sm:mb-8">
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Button 
                variant="primary" 
                className="w-full text-sm sm:text-base py-2 sm:py-3"
                onClick={() => window.location.href = '/subscriptions'}
              >
                Add Subscription
              </Button>
              <Button 
                variant="primary" 
                className="w-full text-sm sm:text-base py-2 sm:py-3"
                onClick={() => window.location.href = '/expenses'}
              >
                Add Expense
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-sm sm:text-base py-2 sm:py-3"
                onClick={() => window.location.href = '/subscriptions'}
              >
                Manage Subscriptions
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-sm sm:text-base py-2 sm:py-3"
                onClick={() => window.location.href = '/expenses'}
              >
                View Expenses
              </Button>
            </div>
          </Card>
        </div>

        {/* Additional Dashboard Widgets - Future Expansion Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Placeholder for future widgets like charts, trends, etc. */}
          <div className="md:col-span-2 xl:col-span-3">
            <Card className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="text-center py-6 sm:py-8">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  More insights coming soon!
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  We're working on advanced analytics, spending trends, and budget tracking features.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button 
                    variant="primary" 
                    className="text-sm"
                    onClick={() => window.location.href = '/subscriptions'}
                  >
                    Explore Subscriptions
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-sm"
                    onClick={() => window.location.href = '/expenses'}
                  >
                    Track Expenses
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}