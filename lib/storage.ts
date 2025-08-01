// Local storage utilities for data persistence

import { Subscription, Expense } from './types';
import { STORAGE_KEYS } from './constants';

// Generic storage utilities
export class Storage {
  private static isClient = typeof window !== 'undefined';

  static get<T>(key: string, defaultValue: T): T {
    if (!this.isClient) return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  }

  static set<T>(key: string, value: T): void {
    if (!this.isClient) return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  }

  static remove(key: string): void {
    if (!this.isClient) return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }

  static clear(): void {
    if (!this.isClient) return;
    
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}

// Subscription storage utilities
export class SubscriptionStorage {
  static getAll(): Subscription[] {
    return Storage.get<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
  }

  static save(subscriptions: Subscription[]): void {
    Storage.set(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
  }

  static add(subscription: Subscription): void {
    const subscriptions = this.getAll();
    subscriptions.push(subscription);
    this.save(subscriptions);
  }

  static update(id: string, updatedSubscription: Subscription): boolean {
    const subscriptions = this.getAll();
    const index = subscriptions.findIndex(sub => sub.id === id);
    
    if (index === -1) return false;
    
    subscriptions[index] = updatedSubscription;
    this.save(subscriptions);
    return true;
  }

  static delete(id: string): boolean {
    const subscriptions = this.getAll();
    const filteredSubscriptions = subscriptions.filter(sub => sub.id !== id);
    
    if (filteredSubscriptions.length === subscriptions.length) return false;
    
    this.save(filteredSubscriptions);
    return true;
  }

  static getById(id: string): Subscription | null {
    const subscriptions = this.getAll();
    return subscriptions.find(sub => sub.id === id) || null;
  }

  static clear(): void {
    Storage.remove(STORAGE_KEYS.SUBSCRIPTIONS);
  }
}

// Expense storage utilities
export class ExpenseStorage {
  static getAll(): Expense[] {
    return Storage.get<Expense[]>(STORAGE_KEYS.EXPENSES, []);
  }

  static save(expenses: Expense[]): void {
    Storage.set(STORAGE_KEYS.EXPENSES, expenses);
  }

  static add(expense: Expense): void {
    const expenses = this.getAll();
    expenses.push(expense);
    this.save(expenses);
  }

  static update(id: string, updatedExpense: Expense): boolean {
    const expenses = this.getAll();
    const index = expenses.findIndex(exp => exp.id === id);
    
    if (index === -1) return false;
    
    expenses[index] = updatedExpense;
    this.save(expenses);
    return true;
  }

  static delete(id: string): boolean {
    const expenses = this.getAll();
    const filteredExpenses = expenses.filter(exp => exp.id !== id);
    
    if (filteredExpenses.length === expenses.length) return false;
    
    this.save(filteredExpenses);
    return true;
  }

  static getById(id: string): Expense | null {
    const expenses = this.getAll();
    return expenses.find(exp => exp.id === id) || null;
  }

  static getByDateRange(startDate: string, endDate: string): Expense[] {
    const expenses = this.getAll();
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return expenseDate >= start && expenseDate <= end;
    });
  }

  static getByCategory(category: string): Expense[] {
    const expenses = this.getAll();
    return expenses.filter(expense => expense.category === category);
  }

  static clear(): void {
    Storage.remove(STORAGE_KEYS.EXPENSES);
  }
}

// Utility functions for data management
export const DataManager = {
  // Export all data for backup
  exportData(): { subscriptions: Subscription[]; expenses: Expense[] } {
    return {
      subscriptions: SubscriptionStorage.getAll(),
      expenses: ExpenseStorage.getAll(),
    };
  },

  // Import data from backup
  importData(data: { subscriptions: Subscription[]; expenses: Expense[] }): void {
    if (data.subscriptions) {
      SubscriptionStorage.save(data.subscriptions);
    }
    if (data.expenses) {
      ExpenseStorage.save(data.expenses);
    }
  },

  // Clear all application data
  clearAllData(): void {
    SubscriptionStorage.clear();
    ExpenseStorage.clear();
  },

  // Get storage usage info
  getStorageInfo(): { used: number; available: number } {
    if (!Storage['isClient']) return { used: 0, available: 0 };
    
    try {
      const testKey = 'storage-test';
      const testValue = 'x';
      let used = 0;
      let available = 0;

      // Calculate used space
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // Estimate available space
      try {
        let testSize = 1024; // Start with 1KB
        while (testSize < 10 * 1024 * 1024) { // Max 10MB test
          localStorage.setItem(testKey, testValue.repeat(testSize));
          localStorage.removeItem(testKey);
          testSize *= 2;
        }
        available = testSize / 2;
      } catch {
        available = 0;
      }

      return { used, available };
    } catch (error) {
      console.error('Error calculating storage info:', error);
      return { used: 0, available: 0 };
    }
  },
};