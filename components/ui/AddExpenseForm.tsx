'use client';

import React, { useState, useEffect } from 'react';
import { Expense, PaymentMethod, Category, RecurringFrequency } from '@/lib/types';
import { CATEGORIES, PAYMENT_METHODS } from '@/lib/constants';
import { ExpenseValidation, FormValidationHelpers } from '@/lib/validation';
import { DateUtils, Utils } from '@/lib/utils';
import { Button } from './Button';
import { Input, Textarea } from './Input';
import { Select } from './Select';
import { Modal } from './Modal';

interface AddExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingExpense?: Expense | null;
  title?: string;
}

interface FormData {
  amount: string;
  date: string;
  description: string;
  category: Category;
  paymentMethod: PaymentMethod;
  isRecurring: boolean;
  recurringFrequency: RecurringFrequency;
}

const initialFormData: FormData = {
  amount: '',
  date: '',
  description: '',
  category: 'other',
  paymentMethod: 'credit_card',
  isRecurring: false,
  recurringFrequency: 'monthly',
};

export function AddExpenseForm({
  isOpen,
  onClose,
  onSubmit,
  editingExpense,
  title,
}: AddExpenseFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!editingExpense;
  const modalTitle = title || (isEditing ? 'Edit Expense' : 'Add New Expense');

  // Reset form when modal opens/closes or editing expense changes
  useEffect(() => {
    if (isOpen) {
      if (editingExpense) {
        setFormData({
          amount: editingExpense.amount.toString(),
          date: DateUtils.formatDateForInput(editingExpense.date),
          description: editingExpense.description,
          category: editingExpense.category as Category,
          paymentMethod: editingExpense.paymentMethod as PaymentMethod,
          isRecurring: editingExpense.isRecurring,
          recurringFrequency: editingExpense.recurringFrequency as RecurringFrequency || 'monthly',
        });
      } else {
        setFormData({
          ...initialFormData,
          date: DateUtils.formatDateForInput(new Date()),
        });
      }
      setErrors({});
    }
  }, [isOpen, editingExpense]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const validationErrors: Record<string, string> = {};

    // Validate amount
    const amount = parseFloat(formData.amount);
    const amountValidation = ExpenseValidation.validateAmount(amount);
    if (!amountValidation.isValid) {
      validationErrors.amount = amountValidation.errors[0];
    }

    // Validate date
    const dateValidation = ExpenseValidation.validateDate(formData.date);
    if (!dateValidation.isValid) {
      validationErrors.date = dateValidation.errors[0];
    }

    // Validate description
    const descriptionValidation = ExpenseValidation.validateDescription(formData.description);
    if (!descriptionValidation.isValid) {
      validationErrors.description = descriptionValidation.errors[0];
    }

    // Validate category
    const categoryValidation = ExpenseValidation.validateCategory(formData.category);
    if (!categoryValidation.isValid) {
      validationErrors.category = categoryValidation.errors[0];
    }

    // Validate payment method
    const paymentMethodValidation = ExpenseValidation.validatePaymentMethod(formData.paymentMethod);
    if (!paymentMethodValidation.isValid) {
      validationErrors.paymentMethod = paymentMethodValidation.errors[0];
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> = {
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
        description: formData.description.trim(),
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        isRecurring: formData.isRecurring,
        ...(formData.isRecurring && {
          recurringFrequency: formData.recurringFrequency,
        }),
      };

      await onSubmit(expenseData);
      onClose();
    } catch (error) {
      console.error('Error submitting expense:', error);
      setErrors({ submit: 'Failed to save expense. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const categoryOptions = CATEGORIES.map(category => ({
    value: category.value,
    label: category.label,
  }));

  const paymentMethodOptions = PAYMENT_METHODS.map(method => ({
    value: method.value,
    label: method.label,
  }));

  const recurringFrequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Description Field */}
        <Input
          label="Description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          error={errors.description}
          placeholder="e.g., Grocery shopping, Gas station, Restaurant dinner"
          required
          disabled={isSubmitting}
        />

        {/* Amount and Date Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            error={errors.amount}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
            disabled={isSubmitting}
          />

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            error={errors.date}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Category and Payment Method Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value as Category)}
            options={categoryOptions}
            error={errors.category}
            required
            disabled={isSubmitting}
          />

          <Select
            label="Payment Method"
            value={formData.paymentMethod}
            onChange={(e) => handleInputChange('paymentMethod', e.target.value as PaymentMethod)}
            options={paymentMethodOptions}
            error={errors.paymentMethod}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Recurring Expense */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
              disabled={isSubmitting}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
              This is a recurring expense
            </label>
            <span className="text-xs text-gray-500 ml-2">
              (e.g., monthly bills, weekly groceries)
            </span>
          </div>

          {/* Recurring Frequency - shown only when isRecurring is checked */}
          {formData.isRecurring && (
            <div className="ml-6">
              <Select
                label="Frequency"
                value={formData.recurringFrequency}
                onChange={(e) => handleInputChange('recurringFrequency', e.target.value as RecurringFrequency)}
                options={recurringFrequencyOptions}
                disabled={isSubmitting}
                helperText="How often does this expense occur?"
              />
            </div>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {errors.submit}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditing ? 'Update Expense' : 'Add Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Export a simplified version for quick usage
export interface QuickAddExpenseProps {
  onSubmit: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  trigger?: React.ReactNode;
}

export function QuickAddExpense({ onSubmit, trigger }: QuickAddExpenseProps) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultTrigger = (
    <Button onClick={() => setIsOpen(true)}>
      Add Expense
    </Button>
  );

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>
          {trigger}
        </div>
      ) : (
        defaultTrigger
      )}
      
      <AddExpenseForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={onSubmit}
      />
    </>
  );
}