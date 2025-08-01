'use client';

import React, { useState, useMemo } from 'react';
import { Subscription, BillingCycle, Category } from '@/lib/types';
import { CATEGORIES, BILLING_CYCLES } from '@/lib/constants';
import { FinancialUtils, DateUtils } from '@/lib/utils';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { SubscriptionList } from './SubscriptionCard';

// Filter and sort options
type SortOption = 'name' | 'cost' | 'nextBilling' | 'category' | 'status' | 'created';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'paused';

interface FilterOptions {
  search: string;
  category: Category | 'all';
  billingCycle: BillingCycle | 'all';
  status: StatusFilter;
  costMin: string;
  costMax: string;
}

interface SortOptions {
  field: SortOption;
  direction: SortDirection;
}

interface SubscriptionManagerProps {
  subscriptions: Subscription[];
  onEdit?: (subscription: Subscription) => void;
  onDelete?: (subscriptionId: string) => void;
  onToggleActive?: (subscriptionId: string) => void;
  className?: string;
}

export function SubscriptionManager({
  subscriptions,
  onEdit,
  onDelete,
  onToggleActive,
  className,
}: SubscriptionManagerProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: 'all',
    billingCycle: 'all',
    status: 'all',
    costMin: '',
    costMax: '',
  });

  const [sort, setSort] = useState<SortOptions>({
    field: 'nextBilling',
    direction: 'asc',
  });

  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort subscriptions
  const filteredAndSortedSubscriptions = useMemo(() => {
    let filtered = subscriptions.filter((subscription) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          subscription.name.toLowerCase().includes(searchLower) ||
          subscription.description?.toLowerCase().includes(searchLower) ||
          subscription.category.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category !== 'all' && subscription.category !== filters.category) {
        return false;
      }

      // Billing cycle filter
      if (filters.billingCycle !== 'all' && subscription.billingCycle !== filters.billingCycle) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all') {
        if (filters.status === 'active' && !subscription.isActive) return false;
        if (filters.status === 'paused' && subscription.isActive) return false;
      }

      // Cost range filter
      const monthlyCost = FinancialUtils.getMonthlySubscriptionCost(subscription);
      if (filters.costMin && monthlyCost < parseFloat(filters.costMin)) return false;
      if (filters.costMax && monthlyCost > parseFloat(filters.costMax)) return false;

      return true;
    });

    // Sort subscriptions
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'cost':
          const aMonthlyCost = FinancialUtils.getMonthlySubscriptionCost(a);
          const bMonthlyCost = FinancialUtils.getMonthlySubscriptionCost(b);
          comparison = aMonthlyCost - bMonthlyCost;
          break;
        case 'nextBilling':
          comparison = new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime();
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'status':
          comparison = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0);
          break;
        case 'created':
          comparison = new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
          break;
        default:
          comparison = 0;
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [subscriptions, filters, sort]);

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle sort changes
  const handleSortChange = (field: SortOption) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      billingCycle: 'all',
      status: 'all',
      costMin: '',
      costMax: '',
    });
  };

  // Get active filter count
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return value.trim() !== '';
    if (key === 'costMin' || key === 'costMax') return value.trim() !== '';
    return value !== 'all';
  }).length;

  // Category options for filter
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...CATEGORIES.map(cat => ({ value: cat.value, label: cat.label })),
  ];

  // Billing cycle options for filter
  const billingCycleOptions = [
    { value: 'all', label: 'All Billing Cycles' },
    ...BILLING_CYCLES.map(cycle => ({ value: cycle.value, label: cycle.label })),
  ];

  // Status options for filter
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active Only' },
    { value: 'paused', label: 'Paused Only' },
  ];

  // Sort options for dropdown
  const sortOptions = [
    { value: 'nextBilling', label: 'Next Billing Date' },
    { value: 'name', label: 'Name' },
    { value: 'cost', label: 'Monthly Cost' },
    { value: 'category', label: 'Category' },
    { value: 'status', label: 'Status' },
    { value: 'created', label: 'Date Added' },
  ];

  return (
    <div className={className}>
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search subscriptions..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            <Select
              value={sort.field}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              options={sortOptions}
              className="min-w-[180px]"
            />

            <Button
              variant="outline"
              onClick={() => handleSortChange(sort.field)}
              className="px-3"
              title={`Sort ${sort.direction === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sort.direction === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  options={categoryOptions}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Cycle
                </label>
                <Select
                  value={filters.billingCycle}
                  onChange={(e) => handleFilterChange('billingCycle', e.target.value)}
                  options={billingCycleOptions}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value as StatusFilter)}
                  options={statusOptions}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Cost Range
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.costMin}
                    onChange={(e) => handleFilterChange('costMin', e.target.value)}
                    className="w-full"
                    min="0"
                    step="0.01"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.costMax}
                    onChange={(e) => handleFilterChange('costMax', e.target.value)}
                    className="w-full"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {filteredAndSortedSubscriptions.length} of {subscriptions.length} subscriptions
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Summary */}
      {(activeFilterCount > 0 || filters.search) && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredAndSortedSubscriptions.length} of {subscriptions.length} subscriptions
          {filters.search && ` matching "${filters.search}"`}
        </div>
      )}

      {/* Subscription List */}
      <SubscriptionList
        subscriptions={filteredAndSortedSubscriptions}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
        emptyMessage={
          activeFilterCount > 0 || filters.search
            ? 'No subscriptions match your current filters.'
            : 'No subscriptions found.'
        }
      />
    </div>
  );
}