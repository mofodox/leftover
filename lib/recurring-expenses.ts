import { Expense, RecurringExpensePattern, RecurringExpenseGroup, RecurringFrequency } from './types';
import { DateUtils } from './utils';

export class RecurringExpenseDetector {
  private static readonly SIMILARITY_THRESHOLD = 0.8;
  private static readonly MIN_OCCURRENCES = 2;
  private static readonly AMOUNT_TOLERANCE = 0.15; // 15% tolerance for amount variations

  /**
   * Detect potential recurring expense patterns from a list of expenses
   */
  static detectPatterns(expenses: Expense[]): RecurringExpensePattern[] {
    const patterns: RecurringExpensePattern[] = [];
    const processedExpenses = new Set<string>();

    // Sort expenses by date (oldest first)
    const sortedExpenses = [...expenses].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (const expense of sortedExpenses) {
      if (processedExpenses.has(expense.id)) continue;

      const similarExpenses = this.findSimilarExpenses(expense, sortedExpenses);
      
      if (similarExpenses.length >= this.MIN_OCCURRENCES) {
        const pattern = this.analyzePattern(expense, similarExpenses);
        if (pattern && pattern.confidence >= 0.6) {
          patterns.push(pattern);
          similarExpenses.forEach(e => processedExpenses.add(e.id));
        }
      }
    }

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Find expenses similar to the given expense
   */
  private static findSimilarExpenses(targetExpense: Expense, allExpenses: Expense[]): Expense[] {
    return allExpenses.filter(expense => {
      if (expense.id === targetExpense.id) return true;
      
      // Check description similarity
      const descriptionSimilarity = this.calculateStringSimilarity(
        targetExpense.description.toLowerCase(),
        expense.description.toLowerCase()
      );
      
      // Check amount similarity
      const amountSimilarity = this.calculateAmountSimilarity(
        targetExpense.amount,
        expense.amount
      );
      
      // Check category match
      const categoryMatch = targetExpense.category === expense.category;
      
      // Combined similarity score
      const overallSimilarity = (descriptionSimilarity * 0.5) + 
                               (amountSimilarity * 0.3) + 
                               (categoryMatch ? 0.2 : 0);
      
      return overallSimilarity >= this.SIMILARITY_THRESHOLD;
    });
  }

  /**
   * Analyze a group of similar expenses to determine recurring pattern
   */
  private static analyzePattern(baseExpense: Expense, similarExpenses: Expense[]): RecurringExpensePattern | null {
    if (similarExpenses.length < this.MIN_OCCURRENCES) return null;

    // Sort by date
    const sortedExpenses = similarExpenses.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate intervals between expenses
    const intervals: number[] = [];
    for (let i = 1; i < sortedExpenses.length; i++) {
      const prevDate = new Date(sortedExpenses[i - 1].date);
      const currDate = new Date(sortedExpenses[i].date);
      const daysDiff = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      intervals.push(daysDiff);
    }

    // Determine frequency and confidence
    const { frequency, confidence } = this.determineFrequency(intervals);
    if (!frequency || confidence < 0.6) return null;

    // Calculate average amount
    const averageAmount = similarExpenses.reduce((sum, exp) => sum + exp.amount, 0) / similarExpenses.length;

    // Calculate next expected date
    const lastExpense = sortedExpenses[sortedExpenses.length - 1];
    const nextExpectedDate = this.calculateNextExpectedDate(lastExpense.date, frequency);

    return {
      id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: baseExpense.description,
      category: baseExpense.category,
      averageAmount,
      frequency,
      confidence,
      expenseIds: similarExpenses.map(e => e.id),
      lastOccurrence: lastExpense.date,
      nextExpectedDate,
      isConfirmed: false
    };
  }

  /**
   * Determine frequency based on intervals between expenses
   */
  private static determineFrequency(intervals: number[]): { frequency: RecurringFrequency | null; confidence: number } {
    if (intervals.length === 0) return { frequency: null, confidence: 0 };

    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation means more consistent intervals
    const consistencyScore = Math.max(0, 1 - (standardDeviation / avgInterval));

    // Determine frequency based on average interval
    let frequency: RecurringFrequency | null = null;
    let frequencyConfidence = 0;

    if (avgInterval >= 6 && avgInterval <= 8) { // Weekly (7 days ± 1)
      frequency = 'weekly';
      frequencyConfidence = Math.max(0, 1 - Math.abs(avgInterval - 7) / 7);
    } else if (avgInterval >= 28 && avgInterval <= 35) { // Monthly (30 days ± 5)
      frequency = 'monthly';
      frequencyConfidence = Math.max(0, 1 - Math.abs(avgInterval - 30) / 30);
    } else if (avgInterval >= 85 && avgInterval <= 95) { // Quarterly (90 days ± 5)
      frequency = 'quarterly';
      frequencyConfidence = Math.max(0, 1 - Math.abs(avgInterval - 90) / 90);
    } else if (avgInterval >= 360 && avgInterval <= 370) { // Yearly (365 days ± 5)
      frequency = 'yearly';
      frequencyConfidence = Math.max(0, 1 - Math.abs(avgInterval - 365) / 365);
    }

    const overallConfidence = frequency ? (consistencyScore * 0.6 + frequencyConfidence * 0.4) : 0;

    return { frequency, confidence: overallConfidence };
  }

  /**
   * Calculate next expected date for a recurring expense
   */
  private static calculateNextExpectedDate(lastDate: string, frequency: RecurringFrequency): string {
    const date = new Date(lastDate);
    
    switch (frequency) {
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    
    return date.toISOString();
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private static calculateStringSimilarity(str1: string, str2: string): number {
    const matrix: number[][] = [];
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    return (maxLen - matrix[len1][len2]) / maxLen;
  }

  /**
   * Calculate amount similarity
   */
  private static calculateAmountSimilarity(amount1: number, amount2: number): number {
    const diff = Math.abs(amount1 - amount2);
    const avg = (amount1 + amount2) / 2;
    const tolerance = avg * this.AMOUNT_TOLERANCE;
    
    if (diff <= tolerance) {
      return 1 - (diff / tolerance);
    }
    
    return 0;
  }

  /**
   * Get upcoming recurring expenses based on patterns
   */
  static getUpcomingRecurringExpenses(patterns: RecurringExpensePattern[]): Array<{
    pattern: RecurringExpensePattern;
    daysUntilDue: number;
    isOverdue: boolean;
  }> {
    const today = new Date();
    
    return patterns
      .filter(pattern => pattern.isConfirmed)
      .map(pattern => {
        const nextDate = new Date(pattern.nextExpectedDate);
        const daysUntilDue = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          pattern,
          daysUntilDue,
          isOverdue: daysUntilDue < 0
        };
      })
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }

  /**
   * Create a recurring expense group from a pattern
   */
  static createRecurringGroup(pattern: RecurringExpensePattern, expenses: Expense[]): RecurringExpenseGroup {
    const groupExpenses = expenses.filter(exp => pattern.expenseIds.includes(exp.id));
    
    return {
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: pattern.description,
      description: `Recurring ${pattern.frequency} expense`,
      category: pattern.category,
      frequency: pattern.frequency,
      averageAmount: pattern.averageAmount,
      expenses: groupExpenses,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

export class RecurringExpenseManager {
  private static readonly STORAGE_KEY = 'recurring_patterns';
  private static readonly GROUPS_STORAGE_KEY = 'recurring_groups';

  /**
   * Save recurring patterns to localStorage
   */
  static savePatterns(patterns: RecurringExpensePattern[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(patterns));
    } catch (error) {
      console.error('Failed to save recurring patterns:', error);
    }
  }

  /**
   * Load recurring patterns from localStorage
   */
  static loadPatterns(): RecurringExpensePattern[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load recurring patterns:', error);
      return [];
    }
  }

  /**
   * Save recurring groups to localStorage
   */
  static saveGroups(groups: RecurringExpenseGroup[]): void {
    try {
      localStorage.setItem(this.GROUPS_STORAGE_KEY, JSON.stringify(groups));
    } catch (error) {
      console.error('Failed to save recurring groups:', error);
    }
  }

  /**
   * Load recurring groups from localStorage
   */
  static loadGroups(): RecurringExpenseGroup[] {
    try {
      const stored = localStorage.getItem(this.GROUPS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load recurring groups:', error);
      return [];
    }
  }

  /**
   * Confirm a pattern as recurring
   */
  static confirmPattern(patternId: string): void {
    const patterns = this.loadPatterns();
    const pattern = patterns.find(p => p.id === patternId);
    
    if (pattern) {
      pattern.isConfirmed = true;
      this.savePatterns(patterns);
    }
  }

  /**
   * Dismiss a pattern (mark as not recurring)
   */
  static dismissPattern(patternId: string): void {
    const patterns = this.loadPatterns();
    const updatedPatterns = patterns.filter(p => p.id !== patternId);
    this.savePatterns(updatedPatterns);
  }

  /**
   * Update next expected date for a pattern after expense is added
   */
  static updatePatternAfterExpense(patternId: string, newExpenseDate: string): void {
    const patterns = this.loadPatterns();
    const pattern = patterns.find(p => p.id === patternId);
    
    if (pattern) {
      pattern.lastOccurrence = newExpenseDate;
      pattern.nextExpectedDate = RecurringExpenseDetector['calculateNextExpectedDate'](
        newExpenseDate, 
        pattern.frequency
      );
      this.savePatterns(patterns);
    }
  }
}