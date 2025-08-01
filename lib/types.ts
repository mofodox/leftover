// Data models for the Subscription and Expense Tracker application

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'quarterly';
  category: string;
  nextBillingDate: string; // ISO date string
  description?: string; // Optional description
  website?: string; // Optional website URL
  isActive: boolean; // Whether subscription is active or paused
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface Expense {
  id: string;
  amount: number;
  date: string; // ISO date string
  description: string;
  category: string;
  paymentMethod: string;
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly'; // Only if isRecurring is true
  nextExpectedDate?: string; // ISO date string, calculated for recurring expenses
  recurringGroupId?: string; // Groups related recurring expenses together
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface FinancialSummary {
  totalMonthlySubscriptions: number;
  totalYearlySubscriptions: number;
  monthlyExpenseTotal: number;
  expensesByCategory: Record<string, number>;
  subscriptionsByCategory: Record<string, number>;
}

export interface FormData {
  subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>;
  expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;
}

export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'quarterly';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'other';
export type Category = 'entertainment' | 'productivity' | 'utilities' | 'food' | 'transportation' | 'health' | 'shopping' | 'other';
export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// Recurring expense detection and management
export interface RecurringExpensePattern {
  id: string;
  description: string;
  category: string;
  averageAmount: number;
  frequency: RecurringFrequency;
  confidence: number; // 0-1, how confident we are this is recurring
  expenseIds: string[]; // IDs of expenses that match this pattern
  lastOccurrence: string; // ISO date string
  nextExpectedDate: string; // ISO date string
  isConfirmed: boolean; // Whether user has confirmed this as recurring
}

export interface RecurringExpenseGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: RecurringFrequency;
  averageAmount: number;
  expenses: Expense[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}