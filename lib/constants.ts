// Constants and enums for the Subscription and Expense Tracker application

import { BillingCycle, PaymentMethod, Category } from './types';

// Billing cycle options
export const BILLING_CYCLES: { value: BillingCycle; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

// Category options for both subscriptions and expenses
export const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'productivity', label: 'Productivity', icon: '💼' },
  { value: 'utilities', label: 'Utilities', icon: '⚡' },
  { value: 'food', label: 'Food & Dining', icon: '🍽️' },
  { value: 'transportation', label: 'Transportation', icon: '🚗' },
  { value: 'health', label: 'Health & Fitness', icon: '🏥' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'other', label: 'Other', icon: '📦' },
];

// Payment method options
export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
];

// Default currency symbol (can be made configurable later)
export const CURRENCY_SYMBOL = '$';

// Date format constants
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DISPLAY_DATE_FORMAT = 'MMM DD, YYYY';

// Local storage keys
export const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'leftover_subscriptions',
  EXPENSES: 'leftover_expenses',
  SETTINGS: 'leftover_settings',
} as const;

// Default categories for quick filtering
export const SUBSCRIPTION_CATEGORIES = CATEGORIES.filter(cat => 
  ['entertainment', 'productivity', 'utilities', 'health', 'other'].includes(cat.value)
);

export const EXPENSE_CATEGORIES = CATEGORIES;

// Validation constants
export const VALIDATION = {
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 999999.99,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
} as const;