'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Expense, Category, RecurringExpensePattern } from '@/lib/types';
import { ExpenseCard, ExpenseList, AddExpenseForm, Button, Select, Input } from '@/components/ui';
import { RecurringExpensePatterns, UpcomingRecurringExpenses } from '@/components/ui/RecurringExpensePatterns';
import { ExpenseStorage } from '@/lib/storage';
import { Utils, FinancialUtils, DateUtils } from '@/lib/utils';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import { RecurringExpenseManager } from '@/lib/recurring-expenses';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recurringPatterns, setRecurringPatterns] = useState<RecurringExpensePattern[]>([]);
  const [viewMode, setViewMode] = useState<'expenses' | 'recurring'>('expenses');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'this_month' | 'this_year' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load expenses on component mount
  useEffect(() => {
    loadExpenses();
    loadRecurringPatterns();
  }, []);

  useEffect(() => {
    // Reload patterns when expenses change
    loadRecurringPatterns();
  }, [expenses]);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedExpenses = ExpenseStorage.getAll();
      
      // Sort expenses by date (newest first)
      const sortedExpenses = loadedExpenses.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setExpenses(sortedExpenses);
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError('Failed to load expenses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecurringPatterns = () => {
    try {
      const patterns = RecurringExpenseManager.loadPatterns();
      setRecurringPatterns(patterns);
    } catch (err) {
      console.error('Error loading recurring patterns:', err);
    }
  };

  const handleAddExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newExpense: Expense = {
        ...expenseData,
        id: Utils.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistic update
      setExpenses(prev => [newExpense, ...prev]);
      setIsAddFormOpen(false);

      // Persist to storage
      ExpenseStorage.add(newExpense);
    } catch (err) {
      console.error('Error adding expense:', err);
      // Revert optimistic update on error
      loadExpenses();
      throw new Error('Failed to add expense. Please try again.');
    }
  };

  const handleEditExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingExpense) return;

    try {
      const updatedExpense: Expense = {
        ...expenseData,
        id: editingExpense.id,
        createdAt: editingExpense.createdAt,
        updatedAt: new Date().toISOString(),
      };

      // Optimistic update
      setExpenses(prev => 
        prev.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp)
      );
      setEditingExpense(null);

      // Persist to storage
      const success = ExpenseStorage.update(updatedExpense.id, updatedExpense);
      if (!success) {
        throw new Error('Expense not found');
      }
    } catch (err) {
      console.error('Error updating expense:', err);
      // Revert optimistic update on error
      loadExpenses();
      setEditingExpense(editingExpense); // Restore editing state
      throw new Error('Failed to update expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      // Store original state for potential rollback
      const originalExpenses = [...expenses];
      
      // Optimistic update
      setExpenses(prev => prev.filter(exp => exp.id !== expenseId));

      // Persist to storage
      const success = ExpenseStorage.delete(expenseId);
      if (!success) {
        // Rollback on failure
        setExpenses(originalExpenses);
        throw new Error('Expense not found');
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense. Please try again.');
    }
  };

  const handleBulkDelete = async (expenseIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${expenseIds.length} expenses?`)) {
      return;
    }

    try {
      // Store original state for potential rollback
      const originalExpenses = [...expenses];
      
      // Optimistic update
      setExpenses(prev => prev.filter(exp => !expenseIds.includes(exp.id)));

      // Persist to storage
      let failedDeletes = 0;
      expenseIds.forEach(id => {
        const success = ExpenseStorage.delete(id);
        if (!success) failedDeletes++;
      });

      if (failedDeletes > 0) {
        // Rollback on partial failure
        setExpenses(originalExpenses);
        throw new Error(`Failed to delete ${failedDeletes} expenses`);
      }
    } catch (err) {
      console.error('Error bulk deleting expenses:', err);
      setError('Failed to delete some expenses. Please try again.');
    }
  };

  const handleDuplicateExpense = async (expense: Expense) => {
    try {
      const duplicatedExpense: Expense = {
        ...expense,
        id: Utils.generateId(),
        description: `${expense.description} (Copy)`,
        date: DateUtils.formatDateForInput(new Date()), // Set to today
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistic update
      setExpenses(prev => [duplicatedExpense, ...prev]);

      // Persist to storage
      ExpenseStorage.add(duplicatedExpense);
    } catch (err) {
      console.error('Error duplicating expense:', err);
      // Revert optimistic update on error
      loadExpenses();
      setError('Failed to duplicate expense. Please try again.');
    }
  };

  const handleOpenEditForm = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleCloseEditForm = () => {
    setEditingExpense(null);
  };

  const handleCloseAddForm = () => {
    setIsAddFormOpen(false);
  };

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = [...expenses];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(expense => 
        expense.description.toLowerCase().includes(search) ||
        expense.category.toLowerCase().includes(search) ||
        expense.amount.toString().includes(search)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const currentMonth = DateUtils.getCurrentMonthRange();
      const currentYear = DateUtils.getCurrentYearRange();

      switch (dateFilter) {
        case 'this_month':
          filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date);
            const monthStart = new Date(currentMonth.start);
            const monthEnd = new Date(currentMonth.end);
            return expenseDate >= monthStart && expenseDate <= monthEnd;
          });
          break;
        case 'this_year':
          filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date);
            const yearStart = new Date(currentYear.start);
            const yearEnd = new Date(currentYear.end);
            return expenseDate >= yearStart && expenseDate <= yearEnd;
          });
          break;
        case 'custom':
          if (customStartDate && customEndDate) {
            filtered = filtered.filter(expense => {
              const expenseDate = new Date(expense.date);
              const startDate = new Date(customStartDate);
              const endDate = new Date(customEndDate);
              return expenseDate >= startDate && expenseDate <= endDate;
            });
          }
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [expenses, searchTerm, selectedCategory, dateFilter, customStartDate, customEndDate, sortBy, sortOrder]);

  // Reset filters function
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setSortBy('date');
    setSortOrder('desc');
  };

  const handlePatternConfirmed = (pattern: RecurringExpensePattern) => {
    loadRecurringPatterns();
  };

  const handlePatternDismissed = (patternId: string) => {
    loadRecurringPatterns();
  };

  const handleQuickAddFromPattern = (pattern: RecurringExpensePattern) => {
    // Pre-fill the form with pattern data
    setIsAddFormOpen(true);
    // Note: We'll need to modify AddExpenseForm to accept initial data
  };

  // Calculate summary statistics
  const currentMonth = DateUtils.getCurrentMonthRange();
  const currentYear = DateUtils.getCurrentYearRange();
  
  const thisMonthExpenses = expenses.filter(exp => {
    const expenseDate = new Date(exp.date);
    const monthStart = new Date(currentMonth.start);
    const monthEnd = new Date(currentMonth.end);
    return expenseDate >= monthStart && expenseDate <= monthEnd;
  });

  const thisYearExpenses = expenses.filter(exp => {
    const expenseDate = new Date(exp.date);
    const yearStart = new Date(currentYear.start);
    const yearEnd = new Date(currentYear.end);
    return expenseDate >= yearStart && expenseDate <= yearEnd;
  });

  const recurringExpenses = expenses.filter(exp => exp.isRecurring);

  const totalThisMonth = thisMonthExpenses.reduce((total, exp) => total + exp.amount, 0);
  const totalThisYear = thisYearExpenses.reduce((total, exp) => total + exp.amount, 0);
  const averageMonthly = thisYearExpenses.length > 0 ? totalThisYear / 12 : 0;

  // Calculate filtered summary statistics
  const filteredTotal = filteredAndSortedExpenses.reduce((total, exp) => total + exp.amount, 0);
  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || dateFilter !== 'all';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
              <p className="mt-1 text-gray-600">
                Track and manage your daily expenses and spending patterns
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('expenses')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'expenses'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Expenses
                </button>
                <button
                  onClick={() => setViewMode('recurring')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'recurring'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Recurring
                </button>
              </div>
              <Button
                onClick={() => setIsAddFormOpen(true)}
                size="lg"
              >
                Add Expense
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filters & Search</h2>
            {hasActiveFilters && (
              <Button
                onClick={resetFilters}
                variant="outline"
                size="sm"
              >
                Reset Filters
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Category
               </label>
               <Select
                 value={selectedCategory}
                 onChange={(e) => setSelectedCategory(e.target.value as Category | 'all')}
                 options={[
                   { value: 'all', label: 'All Categories' },
                   ...EXPENSE_CATEGORIES.map(cat => ({
                     value: cat.value,
                     label: `${cat.icon} ${cat.label}`
                   }))
                 ]}
               />
             </div>

             {/* Date Filter */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Date Range
               </label>
               <Select
                 value={dateFilter}
                 onChange={(e) => setDateFilter(e.target.value as 'all' | 'this_month' | 'this_year' | 'custom')}
                 options={[
                   { value: 'all', label: 'All Time' },
                   { value: 'this_month', label: 'This Month' },
                   { value: 'this_year', label: 'This Year' },
                   { value: 'custom', label: 'Custom Range' }
                 ]}
               />
             </div>

             {/* Sort Options */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Sort By
               </label>
               <div className="flex gap-2">
                 <Select
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'category')}
                   options={[
                     { value: 'date', label: 'Date' },
                     { value: 'amount', label: 'Amount' },
                     { value: 'category', label: 'Category' }
                   ]}
                 />
                 <Button
                   onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                   variant="outline"
                   size="sm"
                   className="px-3"
                 >
                   {sortOrder === 'asc' ? '↑' : '↓'}
                 </Button>
               </div>
             </div>
          </div>

          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Filter Results Summary */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Showing {filteredAndSortedExpenses.length} of {expenses.length} expenses
                {filteredTotal > 0 && (
                  <span className="ml-2 font-medium">
                    • Total: {FinancialUtils.formatCurrency(filteredTotal)}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Expenses</h3>
            <p className="text-3xl font-bold text-blue-600">{expenses.length}</p>
            <p className="text-sm text-gray-500">
              {recurringExpenses.length} recurring
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">This Month</h3>
            <p className="text-3xl font-bold text-green-600">
              {FinancialUtils.formatCurrency(totalThisMonth)}
            </p>
            <p className="text-sm text-gray-500">{thisMonthExpenses.length} expenses</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">This Year</h3>
            <p className="text-3xl font-bold text-purple-600">
              {FinancialUtils.formatCurrency(totalThisYear)}
            </p>
            <p className="text-sm text-gray-500">{thisYearExpenses.length} expenses</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Average</h3>
            <p className="text-3xl font-bold text-orange-600">
              {FinancialUtils.formatCurrency(averageMonthly)}
            </p>
            <p className="text-sm text-gray-500">Based on this year</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content based on view mode */}
        {viewMode === 'expenses' ? (
          /* Expenses List */
          filteredAndSortedExpenses.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {hasActiveFilters ? 'No expenses match your filters' : 'No expenses'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {hasActiveFilters 
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by adding your first expense.'
                }
              </p>
              <div className="mt-6">
                {hasActiveFilters ? (
                  <Button onClick={resetFilters} variant="outline">
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={() => setIsAddFormOpen(true)}>
                    Add Expense
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <ExpenseList
              expenses={filteredAndSortedExpenses}
              onEdit={handleOpenEditForm}
              onDelete={handleDeleteExpense}
              onDuplicate={handleDuplicateExpense}
            />
          )
        ) : (
          /* Recurring Expenses View */
           <div className="space-y-6">
             <RecurringExpensePatterns
               expenses={expenses}
               onPatternConfirmed={handlePatternConfirmed}
               onPatternDismissed={handlePatternDismissed}
             />
             <UpcomingRecurringExpenses
               patterns={recurringPatterns}
               onAddExpense={handleQuickAddFromPattern}
             />
           </div>
        )}
      </div>

      {/* Add Expense Form */}
      <AddExpenseForm
        isOpen={isAddFormOpen}
        onClose={handleCloseAddForm}
        onSubmit={handleAddExpense}
        title="Add New Expense"
      />

      {/* Edit Expense Form */}
      <AddExpenseForm
        isOpen={!!editingExpense}
        onClose={handleCloseEditForm}
        onSubmit={handleEditExpense}
        editingExpense={editingExpense}
        title="Edit Expense"
      />
    </div>
  );
}