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

  // Advanced subscription cost calculations
  
  // Calculate subscription costs for active subscriptions only
  getActiveSubscriptionCosts(subscriptions: Subscription[]): {
    monthly: number;
    yearly: number;
    activeCount: number;
  } {
    const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
    return {
      monthly: this.getTotalMonthlySubscriptionCosts(activeSubscriptions),
      yearly: this.getTotalYearlySubscriptionCosts(activeSubscriptions),
      activeCount: activeSubscriptions.length,
    };
  },

  // Calculate subscription costs by billing cycle
  getSubscriptionCostsByBillingCycle(subscriptions: Subscription[]): Record<string, {
    count: number;
    totalCost: number;
    monthlyEquivalent: number;
  }> {
    const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
    const result: Record<string, { count: number; totalCost: number; monthlyEquivalent: number }> = {};

    activeSubscriptions.forEach(sub => {
      if (!result[sub.billingCycle]) {
        result[sub.billingCycle] = { count: 0, totalCost: 0, monthlyEquivalent: 0 };
      }
      result[sub.billingCycle].count++;
      result[sub.billingCycle].totalCost += sub.cost;
      result[sub.billingCycle].monthlyEquivalent += this.getMonthlySubscriptionCost(sub);
    });

    return result;
  },

  // Calculate potential savings by switching billing cycles
  calculateBillingSavings(subscriptions: Subscription[]): {
    potentialYearlySavings: number;
    recommendations: Array<{
      subscriptionId: string;
      name: string;
      currentCycle: string;
      recommendedCycle: string;
      potentialSavings: number;
    }>;
  } {
    const recommendations: Array<{
      subscriptionId: string;
      name: string;
      currentCycle: string;
      recommendedCycle: string;
      potentialSavings: number;
    }> = [];

    let totalPotentialSavings = 0;

    subscriptions.filter(sub => sub.isActive).forEach(sub => {
      // Assume yearly billing typically offers 10-20% discount
      if (sub.billingCycle === 'monthly') {
        const currentYearlyCost = sub.cost * 12;
        const estimatedYearlyPrice = currentYearlyCost * 0.85; // 15% discount assumption
        const potentialSavings = currentYearlyCost - estimatedYearlyPrice;
        
        if (potentialSavings > 0) {
          recommendations.push({
            subscriptionId: sub.id,
            name: sub.name,
            currentCycle: 'monthly',
            recommendedCycle: 'yearly',
            potentialSavings,
          });
          totalPotentialSavings += potentialSavings;
        }
      }
    });

    return {
      potentialYearlySavings: totalPotentialSavings,
      recommendations,
    };
  },

  // Calculate subscription cost projections
  calculateSubscriptionProjections(subscriptions: Subscription[], months: number = 12): {
    monthlyProjection: number[];
    cumulativeProjection: number[];
    totalProjectedCost: number;
  } {
    const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
    const monthlyProjection: number[] = [];
    const cumulativeProjection: number[] = [];
    let cumulative = 0;

    for (let i = 0; i < months; i++) {
      const monthlyTotal = this.getTotalMonthlySubscriptionCosts(activeSubscriptions);
      monthlyProjection.push(monthlyTotal);
      cumulative += monthlyTotal;
      cumulativeProjection.push(cumulative);
    }

    return {
      monthlyProjection,
      cumulativeProjection,
      totalProjectedCost: cumulative,
    };
  },

  // Calculate subscription cost trends
  calculateSubscriptionTrends(subscriptions: Subscription[]): {
    averageMonthlyCost: number;
    mostExpensiveCategory: string;
    leastExpensiveCategory: string;
    categoryBreakdown: Record<string, {
      count: number;
      monthlyTotal: number;
      percentage: number;
    }>;
  } {
    const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
    const totalMonthlyCost = this.getTotalMonthlySubscriptionCosts(activeSubscriptions);
    const categoryBreakdown: Record<string, {
      count: number;
      monthlyTotal: number;
      percentage: number;
    }> = {};

    // Calculate category breakdown
    activeSubscriptions.forEach(sub => {
      const monthlyCost = this.getMonthlySubscriptionCost(sub);
      if (!categoryBreakdown[sub.category]) {
        categoryBreakdown[sub.category] = { count: 0, monthlyTotal: 0, percentage: 0 };
      }
      categoryBreakdown[sub.category].count++;
      categoryBreakdown[sub.category].monthlyTotal += monthlyCost;
    });

    // Calculate percentages
    Object.keys(categoryBreakdown).forEach(category => {
      categoryBreakdown[category].percentage = 
        totalMonthlyCost > 0 ? (categoryBreakdown[category].monthlyTotal / totalMonthlyCost) * 100 : 0;
    });

    // Find most and least expensive categories
    const categories = Object.keys(categoryBreakdown);
    const mostExpensiveCategory = categories.reduce((max, category) => 
      categoryBreakdown[category].monthlyTotal > categoryBreakdown[max].monthlyTotal ? category : max
    , categories[0] || '');

    const leastExpensiveCategory = categories.reduce((min, category) => 
      categoryBreakdown[category].monthlyTotal < categoryBreakdown[min].monthlyTotal ? category : min
    , categories[0] || '');

    return {
      averageMonthlyCost: activeSubscriptions.length > 0 ? totalMonthlyCost / activeSubscriptions.length : 0,
      mostExpensiveCategory,
      leastExpensiveCategory,
      categoryBreakdown,
    };
  },

  // Calculate upcoming subscription costs (next N months)
  calculateUpcomingCosts(subscriptions: Subscription[], months: number = 3): Array<{
    month: string;
    subscriptions: Array<{
      id: string;
      name: string;
      cost: number;
      billingDate: string;
    }>;
    totalCost: number;
  }> {
    const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
    const upcomingCosts: Array<{
      month: string;
      subscriptions: Array<{
        id: string;
        name: string;
        cost: number;
        billingDate: string;
      }>;
      totalCost: number;
    }> = [];

    for (let i = 0; i < months; i++) {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + i);
      const monthKey = targetDate.toISOString().slice(0, 7); // YYYY-MM format

      const monthSubscriptions: Array<{
        id: string;
        name: string;
        cost: number;
        billingDate: string;
      }> = [];

      activeSubscriptions.forEach(sub => {
        const billingDate = new Date(sub.nextBillingDate);
        
        // Check if this subscription bills in this month
        let shouldInclude = false;
        let currentBillingDate = new Date(billingDate);
        
        // Check multiple billing cycles within the month
        while (currentBillingDate.getMonth() === targetDate.getMonth() && 
               currentBillingDate.getFullYear() === targetDate.getFullYear()) {
          shouldInclude = true;
          
          // Move to next billing cycle
          if (sub.billingCycle === 'weekly') {
            currentBillingDate.setDate(currentBillingDate.getDate() + 7);
          } else if (sub.billingCycle === 'monthly') {
            currentBillingDate.setMonth(currentBillingDate.getMonth() + 1);
          } else if (sub.billingCycle === 'quarterly') {
            currentBillingDate.setMonth(currentBillingDate.getMonth() + 3);
          } else if (sub.billingCycle === 'yearly') {
            currentBillingDate.setFullYear(currentBillingDate.getFullYear() + 1);
          }
        }

        if (shouldInclude) {
          monthSubscriptions.push({
            id: sub.id,
            name: sub.name,
            cost: sub.cost,
            billingDate: billingDate.toISOString(),
          });
        }
      });

      const totalCost = monthSubscriptions.reduce((sum, sub) => sum + sub.cost, 0);

      upcomingCosts.push({
        month: monthKey,
        subscriptions: monthSubscriptions,
        totalCost,
      });
    }

    return upcomingCosts;
   },

   // Advanced expense analysis functions

   // Calculate expense summaries by category with detailed breakdown
   getExpenseSummaryByCategory(expenses: Expense[]): {
     categoryBreakdown: Record<string, {
       total: number;
       count: number;
       average: number;
       percentage: number;
       lastExpenseDate: string;
     }>;
     totalExpenses: number;
     mostExpensiveCategory: string;
     leastExpensiveCategory: string;
     averageExpenseAmount: number;
   } {
     const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
     const categoryBreakdown: Record<string, {
       total: number;
       count: number;
       average: number;
       percentage: number;
       lastExpenseDate: string;
     }> = {};

     // Calculate category breakdown
     expenses.forEach(expense => {
       if (!categoryBreakdown[expense.category]) {
         categoryBreakdown[expense.category] = {
           total: 0,
           count: 0,
           average: 0,
           percentage: 0,
           lastExpenseDate: expense.date,
         };
       }
       
       categoryBreakdown[expense.category].total += expense.amount;
       categoryBreakdown[expense.category].count++;
       
       // Update last expense date if this expense is more recent
       if (new Date(expense.date) > new Date(categoryBreakdown[expense.category].lastExpenseDate)) {
         categoryBreakdown[expense.category].lastExpenseDate = expense.date;
       }
     });

     // Calculate averages and percentages
     Object.keys(categoryBreakdown).forEach(category => {
       const categoryData = categoryBreakdown[category];
       categoryData.average = categoryData.total / categoryData.count;
       categoryData.percentage = totalExpenses > 0 ? (categoryData.total / totalExpenses) * 100 : 0;
     });

     // Find most and least expensive categories
     const categories = Object.keys(categoryBreakdown);
     const mostExpensiveCategory = categories.reduce((max, category) => 
       categoryBreakdown[category].total > categoryBreakdown[max].total ? category : max
     , categories[0] || '');

     const leastExpensiveCategory = categories.reduce((min, category) => 
       categoryBreakdown[category].total < categoryBreakdown[min].total ? category : min
     , categories[0] || '');

     return {
       categoryBreakdown,
       totalExpenses,
       mostExpensiveCategory,
       leastExpensiveCategory,
       averageExpenseAmount: expenses.length > 0 ? totalExpenses / expenses.length : 0,
     };
   },

   // Calculate expense summaries by time period
   getExpenseSummaryByTimePeriod(expenses: Expense[], period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Array<{
     period: string;
     total: number;
     count: number;
     average: number;
     categories: Record<string, number>;
     topCategory: string;
   }> {
     const periodMap = new Map<string, {
       total: number;
       count: number;
       expenses: Expense[];
     }>();

     // Group expenses by time period
     expenses.forEach(expense => {
       const date = new Date(expense.date);
       let periodKey: string;

       switch (period) {
         case 'daily':
           periodKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
           break;
         case 'weekly':
           const weekStart = new Date(date);
           weekStart.setDate(date.getDate() - date.getDay());
           periodKey = weekStart.toISOString().split('T')[0];
           break;
         case 'monthly':
           periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
           break;
         case 'yearly':
           periodKey = date.getFullYear().toString();
           break;
         default:
           periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
       }

       if (!periodMap.has(periodKey)) {
         periodMap.set(periodKey, { total: 0, count: 0, expenses: [] });
       }

       const periodData = periodMap.get(periodKey)!;
       periodData.total += expense.amount;
       periodData.count++;
       periodData.expenses.push(expense);
     });

     // Convert to array and calculate additional metrics
     return Array.from(periodMap.entries())
       .map(([periodKey, data]) => {
         const categories = this.getExpensesByCategory(data.expenses);
         const topCategory = Object.keys(categories).reduce((max, category) => 
           categories[category] > categories[max] ? category : max
         , Object.keys(categories)[0] || '');

         return {
           period: periodKey,
           total: data.total,
           count: data.count,
           average: data.count > 0 ? data.total / data.count : 0,
           categories,
           topCategory,
         };
       })
       .sort((a, b) => a.period.localeCompare(b.period));
   },

   // Calculate expense trends and patterns
   calculateExpenseTrends(expenses: Expense[], months: number = 6): {
     monthlyTrends: Array<{
       month: string;
       total: number;
       change: number;
       changePercentage: number;
     }>;
     categoryTrends: Record<string, {
       trend: 'increasing' | 'decreasing' | 'stable';
       changePercentage: number;
       monthlyData: Array<{ month: string; amount: number }>;
     }>;
     overallTrend: 'increasing' | 'decreasing' | 'stable';
     averageMonthlySpending: number;
   } {
     const now = new Date();
     const monthlyTrends: Array<{
       month: string;
       total: number;
       change: number;
       changePercentage: number;
     }> = [];

     // Calculate monthly totals for the specified period
     for (let i = months - 1; i >= 0; i--) {
       const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
       const monthKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
       
       const monthExpenses = expenses.filter(expense => {
         const expenseDate = new Date(expense.date);
         return expenseDate.getFullYear() === targetDate.getFullYear() && 
                expenseDate.getMonth() === targetDate.getMonth();
       });

       const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
       const previousTotal = monthlyTrends.length > 0 ? monthlyTrends[monthlyTrends.length - 1].total : 0;
       const change = total - previousTotal;
       const changePercentage = previousTotal > 0 ? (change / previousTotal) * 100 : 0;

       monthlyTrends.push({
         month: monthKey,
         total,
         change,
         changePercentage,
       });
     }

     // Calculate category trends
     const categoryTrends: Record<string, {
       trend: 'increasing' | 'decreasing' | 'stable';
       changePercentage: number;
       monthlyData: Array<{ month: string; amount: number }>;
     }> = {};

     const allCategories = [...new Set(expenses.map(e => e.category))];
     
     allCategories.forEach(category => {
       const monthlyData: Array<{ month: string; amount: number }> = [];
       
       monthlyTrends.forEach(({ month }) => {
         const monthExpenses = expenses.filter(expense => {
           const expenseDate = new Date(expense.date);
           const [year, monthNum] = month.split('-').map(Number);
           return expense.category === category &&
                  expenseDate.getFullYear() === year && 
                  expenseDate.getMonth() === monthNum - 1;
         });
         
         const amount = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
         monthlyData.push({ month, amount });
       });

       // Calculate trend
       const firstHalf = monthlyData.slice(0, Math.floor(monthlyData.length / 2));
       const secondHalf = monthlyData.slice(Math.floor(monthlyData.length / 2));
       
       const firstHalfAvg = firstHalf.reduce((sum, data) => sum + data.amount, 0) / firstHalf.length;
       const secondHalfAvg = secondHalf.reduce((sum, data) => sum + data.amount, 0) / secondHalf.length;
       
       const changePercentage = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
       
       let trend: 'increasing' | 'decreasing' | 'stable';
       if (Math.abs(changePercentage) < 5) {
         trend = 'stable';
       } else if (changePercentage > 0) {
         trend = 'increasing';
       } else {
         trend = 'decreasing';
       }

       categoryTrends[category] = {
         trend,
         changePercentage,
         monthlyData,
       };
     });

     // Calculate overall trend
     const totalChangePercentage = monthlyTrends.length > 1 ? 
       monthlyTrends[monthlyTrends.length - 1].changePercentage : 0;
     
     let overallTrend: 'increasing' | 'decreasing' | 'stable';
     if (Math.abs(totalChangePercentage) < 5) {
       overallTrend = 'stable';
     } else if (totalChangePercentage > 0) {
       overallTrend = 'increasing';
     } else {
       overallTrend = 'decreasing';
     }

     const averageMonthlySpending = monthlyTrends.length > 0 ? 
       monthlyTrends.reduce((sum, trend) => sum + trend.total, 0) / monthlyTrends.length : 0;

     return {
       monthlyTrends,
       categoryTrends,
       overallTrend,
       averageMonthlySpending,
     };
   },

   // Compare expenses between different time periods
   compareExpensePeriods(expenses: Expense[], currentPeriodStart: string, currentPeriodEnd: string, 
                        previousPeriodStart: string, previousPeriodEnd: string): {
     currentPeriod: {
       total: number;
       count: number;
       average: number;
       categories: Record<string, number>;
     };
     previousPeriod: {
       total: number;
       count: number;
       average: number;
       categories: Record<string, number>;
     };
     comparison: {
       totalChange: number;
       totalChangePercentage: number;
       countChange: number;
       averageChange: number;
       categoryChanges: Record<string, {
         change: number;
         changePercentage: number;
       }>;
     };
   } {
     // Filter expenses for current period
     const currentExpenses = expenses.filter(expense => {
       const expenseDate = new Date(expense.date);
       const start = new Date(currentPeriodStart);
       const end = new Date(currentPeriodEnd);
       return expenseDate >= start && expenseDate <= end;
     });

     // Filter expenses for previous period
     const previousExpenses = expenses.filter(expense => {
       const expenseDate = new Date(expense.date);
       const start = new Date(previousPeriodStart);
       const end = new Date(previousPeriodEnd);
       return expenseDate >= start && expenseDate <= end;
     });

     // Calculate metrics for both periods
     const currentTotal = currentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
     const previousTotal = previousExpenses.reduce((sum, expense) => sum + expense.amount, 0);
     
     const currentCategories = this.getExpensesByCategory(currentExpenses);
     const previousCategories = this.getExpensesByCategory(previousExpenses);

     // Calculate changes
     const totalChange = currentTotal - previousTotal;
     const totalChangePercentage = previousTotal > 0 ? (totalChange / previousTotal) * 100 : 0;
     const countChange = currentExpenses.length - previousExpenses.length;
     const averageChange = (currentExpenses.length > 0 ? currentTotal / currentExpenses.length : 0) - 
                          (previousExpenses.length > 0 ? previousTotal / previousExpenses.length : 0);

     // Calculate category changes
     const allCategories = [...new Set([...Object.keys(currentCategories), ...Object.keys(previousCategories)])];
     const categoryChanges: Record<string, { change: number; changePercentage: number }> = {};

     allCategories.forEach(category => {
       const currentAmount = currentCategories[category] || 0;
       const previousAmount = previousCategories[category] || 0;
       const change = currentAmount - previousAmount;
       const changePercentage = previousAmount > 0 ? (change / previousAmount) * 100 : 0;

       categoryChanges[category] = { change, changePercentage };
     });

     return {
       currentPeriod: {
         total: currentTotal,
         count: currentExpenses.length,
         average: currentExpenses.length > 0 ? currentTotal / currentExpenses.length : 0,
         categories: currentCategories,
       },
       previousPeriod: {
         total: previousTotal,
         count: previousExpenses.length,
         average: previousExpenses.length > 0 ? previousTotal / previousExpenses.length : 0,
         categories: previousCategories,
       },
       comparison: {
         totalChange,
         totalChangePercentage,
         countChange,
         averageChange,
         categoryChanges,
       },
     };
   },

   // Get top expenses by amount or frequency
   getTopExpenses(expenses: Expense[], criteria: 'amount' | 'frequency' = 'amount', limit: number = 10): Array<{
     category?: string;
     description?: string;
     amount?: number;
     count?: number;
     totalAmount?: number;
     averageAmount?: number;
     lastDate?: string;
   }> {
     if (criteria === 'amount') {
       return expenses
         .sort((a, b) => b.amount - a.amount)
         .slice(0, limit)
         .map(expense => ({
           category: expense.category,
           description: expense.description,
           amount: expense.amount,
           lastDate: expense.date,
         }));
     } else {
       // Group by description for frequency analysis
       const frequencyMap = new Map<string, {
         count: number;
         totalAmount: number;
         category: string;
         lastDate: string;
       }>();

       expenses.forEach(expense => {
         const key = expense.description;
         if (!frequencyMap.has(key)) {
           frequencyMap.set(key, {
             count: 0,
             totalAmount: 0,
             category: expense.category,
             lastDate: expense.date,
           });
         }

         const data = frequencyMap.get(key)!;
         data.count++;
         data.totalAmount += expense.amount;
         
         if (new Date(expense.date) > new Date(data.lastDate)) {
           data.lastDate = expense.date;
         }
       });

       return Array.from(frequencyMap.entries())
         .sort((a, b) => b[1].count - a[1].count)
         .slice(0, limit)
         .map(([description, data]) => ({
           description,
           category: data.category,
           count: data.count,
           totalAmount: data.totalAmount,
           averageAmount: data.totalAmount / data.count,
           lastDate: data.lastDate,
         }));
     }
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