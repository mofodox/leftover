// Utility functions for date calculations and currency formatting

import { Subscription, Expense, BillingCycle } from './types';
import { CURRENCY_SYMBOL } from './constants';

// Date utility functions
export const DateUtils = {
  // Format date for display
  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  // Format date for input fields (YYYY-MM-DD)
  formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  },

  // Get current date as ISO string
  getCurrentDate(): string {
    return new Date().toISOString();
  },

  // Calculate next billing date based on current date and billing cycle
  calculateNextBillingDate(currentDate: string | Date, billingCycle: BillingCycle): string {
    const date = new Date(currentDate);
    
    if (billingCycle === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    } else if (billingCycle === 'yearly') {
      date.setFullYear(date.getFullYear() + 1);
    } else if (billingCycle === 'weekly') {
      date.setDate(date.getDate() + 7);
    } else if (billingCycle === 'quarterly') {
      date.setMonth(date.getMonth() + 3);
    }
    
    return date.toISOString();
  },

  // Update overdue billing date to next appropriate date
  updateOverdueBillingDate(subscription: Subscription): string {
    const today = new Date();
    let nextBillingDate = new Date(subscription.nextBillingDate);
    
    // Keep advancing the billing date until it's in the future
    while (nextBillingDate <= today) {
      if (subscription.billingCycle === 'monthly') {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      } else if (subscription.billingCycle === 'yearly') {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      } else if (subscription.billingCycle === 'weekly') {
        nextBillingDate.setDate(nextBillingDate.getDate() + 7);
      } else if (subscription.billingCycle === 'quarterly') {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
      }
    }
    
    return nextBillingDate.toISOString();
  },

  // Check if a date is in the past
  isPastDate(date: string | Date): boolean {
    const targetDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate < today;
  },

  // Check if a date is within the next N days
  isWithinDays(date: string | Date, days: number): boolean {
    const targetDate = new Date(date);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return targetDate <= futureDate;
  },

  // Get days until a specific date
  getDaysUntil(date: string | Date): number {
    const targetDate = new Date(date);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Get relative date string (e.g., "in 3 days", "2 days ago")
  formatRelativeDate(date: string | Date): string {
    const targetDate = new Date(date);
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays === -1) {
      return 'Yesterday';
    } else if (diffDays > 0) {
      return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else {
      return `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`;
    }
  },

  // Get start and end of current month
  getCurrentMonthRange(): { start: string; end: string } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  },

  // Get start and end of current year
  getCurrentYearRange(): { start: string; end: string } {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    
    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  },
};

// Currency utility functions
export const CurrencyUtils = {
  // Format amount as currency
  formatCurrency(amount: number): string {
    return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`;
  },

  // Parse currency string to number
  parseCurrency(currencyString: string): number {
    const cleaned = currencyString.replace(/[^0-9.-]+/g, '');
    return parseFloat(cleaned) || 0;
  },

  // Format large numbers with K, M suffixes
  formatLargeNumber(amount: number): string {
    if (amount >= 1000000) {
      return `${CURRENCY_SYMBOL}${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${CURRENCY_SYMBOL}${(amount / 1000).toFixed(1)}K`;
    }
    return this.formatCurrency(amount);
  },
};

// Calculation utility functions
export const CalculationUtils = {
  // Calculate monthly cost from subscription
  getMonthlySubscriptionCost(subscription: Subscription): number {
    if (subscription.billingCycle === 'monthly') {
      return subscription.cost;
    } else if (subscription.billingCycle === 'yearly') {
      return subscription.cost / 12;
    } else if (subscription.billingCycle === 'weekly') {
      return subscription.cost * 4.33; // Average weeks per month
    } else if (subscription.billingCycle === 'quarterly') {
      return subscription.cost / 3;
    }
    return 0;
  },

  // Calculate yearly cost from subscription
  getYearlySubscriptionCost(subscription: Subscription): number {
    if (subscription.billingCycle === 'monthly') {
      return subscription.cost * 12;
    } else if (subscription.billingCycle === 'yearly') {
      return subscription.cost;
    } else if (subscription.billingCycle === 'weekly') {
      return subscription.cost * 52;
    } else if (subscription.billingCycle === 'quarterly') {
      return subscription.cost * 4;
    }
    return 0;
  },

  // Calculate total monthly subscription costs
  getTotalMonthlySubscriptionCosts(subscriptions: Subscription[]): number {
    return subscriptions.reduce((total, subscription) => {
      return total + this.getMonthlySubscriptionCost(subscription);
    }, 0);
  },

  // Calculate total yearly subscription costs
  getTotalYearlySubscriptionCosts(subscriptions: Subscription[]): number {
    return subscriptions.reduce((total, subscription) => {
      return total + this.getYearlySubscriptionCost(subscription);
    }, 0);
  },

  // Calculate expenses by category
  getExpensesByCategory(expenses: Expense[]): Record<string, number> {
    return expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  },

  // Calculate subscriptions by category
  getSubscriptionsByCategory(subscriptions: Subscription[]): Record<string, number> {
    return subscriptions.reduce((acc, subscription) => {
      const monthlyCost = this.getMonthlySubscriptionCost(subscription);
      acc[subscription.category] = (acc[subscription.category] || 0) + monthlyCost;
      return acc;
    }, {} as Record<string, number>);
  },

  // Calculate total expenses for a date range
  getTotalExpensesForDateRange(expenses: Expense[], startDate: string, endDate: string): number {
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return expenseDate >= start && expenseDate <= end;
      })
      .reduce((total, expense) => total + expense.amount, 0);
  },
};

// Validation utility functions
export const ValidationUtils = {
  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate amount (positive number with max 2 decimal places)
  isValidAmount(amount: number): boolean {
    return amount > 0 && Number.isFinite(amount) && Number(amount.toFixed(2)) === amount;
  },

  // Validate date string
  isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  },

  // Validate required string field
  isValidString(value: string, minLength: number = 1, maxLength: number = 1000): boolean {
    return typeof value === 'string' && 
           value.trim().length >= minLength && 
           value.trim().length <= maxLength;
  },
};

// Utility for merging class names (similar to clsx/classnames)
export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// General utility functions
export const Utils = {
  // Generate unique ID
  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Debounce function
  debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    }) as T;
  },

  // Deep clone object
  deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  },

  // Capitalize first letter
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Sort array by property
  sortBy<T>(array: T[], property: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
      const aVal = a[property];
      const bVal = b[property];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },

  // Update overdue subscriptions with new billing dates
  updateOverdueSubscriptions(subscriptions: Subscription[]): Subscription[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return subscriptions.map(subscription => {
      const billingDate = new Date(subscription.nextBillingDate);
      billingDate.setHours(0, 0, 0, 0);
      
      // If billing date is in the past, update it
      if (billingDate < today && subscription.isActive) {
        const newBillingDate = DateUtils.updateOverdueBillingDate(subscription);
        return {
          ...subscription,
          nextBillingDate: newBillingDate,
          updatedAt: new Date().toISOString(),
        };
      }
      
      return subscription;
    });
  },
};

// Combined financial utilities for easy access
export const FinancialUtils = {
  ...CalculationUtils,
  ...CurrencyUtils,
};

// Export formatRelativeDate as a standalone function
export const formatRelativeDate = DateUtils.formatRelativeDate;