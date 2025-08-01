import React, { useState, useEffect } from 'react';
import { RecurringExpensePattern, Expense } from '@/lib/types';
import { RecurringExpenseDetector, RecurringExpenseManager } from '@/lib/recurring-expenses';
import { Button } from './Button';
import { Card } from './Card';
import { CURRENCY_SYMBOL } from '@/lib/constants';
import { DateUtils } from '@/lib/utils';

interface RecurringExpensePatternsProps {
  expenses: Expense[];
  onPatternConfirmed?: (pattern: RecurringExpensePattern) => void;
  onPatternDismissed?: (patternId: string) => void;
}

export function RecurringExpensePatterns({ 
  expenses, 
  onPatternConfirmed, 
  onPatternDismissed 
}: RecurringExpensePatternsProps) {
  const [patterns, setPatterns] = useState<RecurringExpensePattern[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showConfirmed, setShowConfirmed] = useState(false);

  useEffect(() => {
    detectPatterns();
  }, [expenses]);

  const detectPatterns = async () => {
    setIsDetecting(true);
    try {
      // Get existing patterns
      const existingPatterns = RecurringExpenseManager.loadPatterns();
      
      // Detect new patterns
      const detectedPatterns = RecurringExpenseDetector.detectPatterns(expenses);
      
      // Merge with existing patterns, avoiding duplicates
      const allPatterns = [...existingPatterns];
      
      detectedPatterns.forEach(newPattern => {
        const exists = existingPatterns.some(existing => 
          existing.description === newPattern.description &&
          existing.category === newPattern.category &&
          Math.abs(existing.averageAmount - newPattern.averageAmount) < 1
        );
        
        if (!exists) {
          allPatterns.push(newPattern);
        }
      });
      
      setPatterns(allPatterns);
      RecurringExpenseManager.savePatterns(allPatterns);
    } catch (error) {
      console.error('Error detecting patterns:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleConfirmPattern = (pattern: RecurringExpensePattern) => {
    RecurringExpenseManager.confirmPattern(pattern.id);
    setPatterns(prev => prev.map(p => 
      p.id === pattern.id ? { ...p, isConfirmed: true } : p
    ));
    onPatternConfirmed?.(pattern);
  };

  const handleDismissPattern = (patternId: string) => {
    RecurringExpenseManager.dismissPattern(patternId);
    setPatterns(prev => prev.filter(p => p.id !== patternId));
    onPatternDismissed?.(patternId);
  };

  const unconfirmedPatterns = patterns.filter(p => !p.isConfirmed);
  const confirmedPatterns = patterns.filter(p => p.isConfirmed);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const formatFrequency = (frequency: string) => {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  if (isDetecting) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Detecting recurring patterns...</span>
        </div>
      </Card>
    );
  }

  if (unconfirmedPatterns.length === 0 && confirmedPatterns.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No recurring patterns detected</p>
          <p className="text-sm mt-1">Add more expenses to help us identify recurring patterns</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Unconfirmed Patterns */}
      {unconfirmedPatterns.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Detected Recurring Patterns
            </h3>
            <span className="text-sm text-gray-500">
              {unconfirmedPatterns.length} pattern{unconfirmedPatterns.length !== 1 ? 's' : ''} found
            </span>
          </div>
          
          <div className="space-y-4">
            {unconfirmedPatterns.map((pattern) => (
              <Card key={pattern.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">{pattern.description}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(pattern.confidence)}`}>
                        {getConfidenceText(pattern.confidence)} confidence
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Amount:</span>
                        <p>{CURRENCY_SYMBOL}{pattern.averageAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Frequency:</span>
                        <p>{formatFrequency(pattern.frequency)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Category:</span>
                        <p className="capitalize">{pattern.category}</p>
                      </div>
                      <div>
                        <span className="font-medium">Occurrences:</span>
                        <p>{pattern.expenseIds.length} times</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Next expected:</span> {DateUtils.formatDate(pattern.nextExpectedDate)}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismissPattern(pattern.id)}
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleConfirmPattern(pattern)}
                    >
                      Confirm
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Confirmed Patterns */}
      {confirmedPatterns.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Confirmed Recurring Expenses
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmed(!showConfirmed)}
            >
              {showConfirmed ? 'Hide' : 'Show'} ({confirmedPatterns.length})
            </Button>
          </div>
          
          {showConfirmed && (
            <div className="space-y-4">
              {confirmedPatterns.map((pattern) => (
                <Card key={pattern.id} className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{pattern.description}</h4>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Confirmed
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Amount:</span>
                          <p>{CURRENCY_SYMBOL}{pattern.averageAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Frequency:</span>
                          <p>{formatFrequency(pattern.frequency)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>
                          <p className="capitalize">{pattern.category}</p>
                        </div>
                        <div>
                          <span className="font-medium">Next due:</span>
                          <p>{DateUtils.formatDate(pattern.nextExpectedDate)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismissPattern(pattern.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Component for showing upcoming recurring expenses
interface UpcomingRecurringExpensesProps {
  patterns: RecurringExpensePattern[];
  onAddExpense?: (pattern: RecurringExpensePattern) => void;
}

export function UpcomingRecurringExpenses({ patterns, onAddExpense }: UpcomingRecurringExpensesProps) {
  const upcomingExpenses = RecurringExpenseDetector.getUpcomingRecurringExpenses(patterns);
  
  const formatFrequency = (frequency: string) => {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };
  
  if (upcomingExpenses.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Upcoming Recurring Expenses
      </h3>
      
      <div className="space-y-3">
        {upcomingExpenses.slice(0, 5).map(({ pattern, daysUntilDue, isOverdue }) => (
          <div key={pattern.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{pattern.description}</h4>
                {isOverdue && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Overdue
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {CURRENCY_SYMBOL}{pattern.averageAmount.toFixed(2)} • {formatFrequency(pattern.frequency)}
              </div>
              <div className="text-xs text-gray-500">
                {isOverdue 
                  ? `${Math.abs(daysUntilDue)} days overdue`
                  : daysUntilDue === 0 
                    ? 'Due today'
                    : `Due in ${daysUntilDue} days`
                }
              </div>
            </div>
            
            {onAddExpense && (
              <Button
                size="sm"
                variant={isOverdue ? "primary" : "outline"}
                onClick={() => onAddExpense(pattern)}
              >
                Add Now
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}