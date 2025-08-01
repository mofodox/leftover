// Data validation functions for form inputs and data integrity

import { Subscription, Expense, BillingCycle, Category, PaymentMethod } from './types';
import { VALIDATION, CATEGORIES, BILLING_CYCLES, PAYMENT_METHODS } from './constants';
import { ValidationUtils } from './utils';

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Subscription validation
export const SubscriptionValidation = {
  // Validate subscription name
  validateName(name: string): ValidationResult {
    const errors: string[] = [];
    
    if (!ValidationUtils.isValidString(name, 1, VALIDATION.MAX_NAME_LENGTH)) {
      if (!name || name.trim().length === 0) {
        errors.push('Subscription name is required');
      } else if (name.trim().length > VALIDATION.MAX_NAME_LENGTH) {
        errors.push(`Subscription name must be ${VALIDATION.MAX_NAME_LENGTH} characters or less`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate subscription cost
  validateCost(cost: number): ValidationResult {
    const errors: string[] = [];
    
    if (!ValidationUtils.isValidAmount(cost)) {
      if (cost <= 0) {
        errors.push('Subscription cost must be greater than 0');
      } else if (cost < VALIDATION.MIN_AMOUNT) {
        errors.push(`Subscription cost must be at least $${VALIDATION.MIN_AMOUNT}`);
      } else if (cost > VALIDATION.MAX_AMOUNT) {
        errors.push(`Subscription cost cannot exceed $${VALIDATION.MAX_AMOUNT}`);
      } else {
        errors.push('Invalid subscription cost format');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate billing cycle
  validateBillingCycle(billingCycle: string): ValidationResult {
    const errors: string[] = [];
    const validCycles = BILLING_CYCLES.map(cycle => cycle.value);
    
    if (!validCycles.includes(billingCycle as BillingCycle)) {
      errors.push('Please select a valid billing cycle');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate category
  validateCategory(category: string): ValidationResult {
    const errors: string[] = [];
    const validCategories = CATEGORIES.map(cat => cat.value);
    
    if (!validCategories.includes(category as Category)) {
      errors.push('Please select a valid category');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate next billing date
  validateNextBillingDate(date: string): ValidationResult {
    const errors: string[] = [];
    
    if (!ValidationUtils.isValidDate(date)) {
      errors.push('Please enter a valid billing date');
    } else {
      const billingDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (billingDate < today) {
        errors.push('Billing date cannot be in the past');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate complete subscription object
  validateSubscription(subscription: Partial<Subscription>): ValidationResult {
    const allErrors: string[] = [];
    
    // Validate each field
    const nameValidation = this.validateName(subscription.name || '');
    const costValidation = this.validateCost(subscription.cost || 0);
    const billingCycleValidation = this.validateBillingCycle(subscription.billingCycle || '');
    const categoryValidation = this.validateCategory(subscription.category || '');
    const dateValidation = this.validateNextBillingDate(subscription.nextBillingDate || '');
    
    // Collect all errors
    allErrors.push(...nameValidation.errors);
    allErrors.push(...costValidation.errors);
    allErrors.push(...billingCycleValidation.errors);
    allErrors.push(...categoryValidation.errors);
    allErrors.push(...dateValidation.errors);
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  },
};

// Expense validation
export const ExpenseValidation = {
  // Validate expense amount
  validateAmount(amount: number): ValidationResult {
    const errors: string[] = [];
    
    if (!ValidationUtils.isValidAmount(amount)) {
      if (amount <= 0) {
        errors.push('Expense amount must be greater than 0');
      } else if (amount < VALIDATION.MIN_AMOUNT) {
        errors.push(`Expense amount must be at least $${VALIDATION.MIN_AMOUNT}`);
      } else if (amount > VALIDATION.MAX_AMOUNT) {
        errors.push(`Expense amount cannot exceed $${VALIDATION.MAX_AMOUNT}`);
      } else {
        errors.push('Invalid expense amount format');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate expense date
  validateDate(date: string): ValidationResult {
    const errors: string[] = [];
    
    if (!ValidationUtils.isValidDate(date)) {
      errors.push('Please enter a valid expense date');
    } else {
      const expenseDate = new Date(date);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      if (expenseDate > today) {
        errors.push('Expense date cannot be in the future');
      } else if (expenseDate < oneYearAgo) {
        errors.push('Expense date cannot be more than one year ago');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate expense description
  validateDescription(description: string): ValidationResult {
    const errors: string[] = [];
    
    if (!ValidationUtils.isValidString(description, 1, VALIDATION.MAX_DESCRIPTION_LENGTH)) {
      if (!description || description.trim().length === 0) {
        errors.push('Expense description is required');
      } else if (description.trim().length > VALIDATION.MAX_DESCRIPTION_LENGTH) {
        errors.push(`Expense description must be ${VALIDATION.MAX_DESCRIPTION_LENGTH} characters or less`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate expense category
  validateCategory(category: string): ValidationResult {
    const errors: string[] = [];
    const validCategories = CATEGORIES.map(cat => cat.value);
    
    if (!validCategories.includes(category as Category)) {
      errors.push('Please select a valid category');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate payment method
  validatePaymentMethod(paymentMethod: string): ValidationResult {
    const errors: string[] = [];
    const validMethods = PAYMENT_METHODS.map(method => method.value);
    
    if (!validMethods.includes(paymentMethod as PaymentMethod)) {
      errors.push('Please select a valid payment method');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate complete expense object
  validateExpense(expense: Partial<Expense>): ValidationResult {
    const allErrors: string[] = [];
    
    // Validate each field
    const amountValidation = this.validateAmount(expense.amount || 0);
    const dateValidation = this.validateDate(expense.date || '');
    const descriptionValidation = this.validateDescription(expense.description || '');
    const categoryValidation = this.validateCategory(expense.category || '');
    const paymentMethodValidation = this.validatePaymentMethod(expense.paymentMethod || '');
    
    // Collect all errors
    allErrors.push(...amountValidation.errors);
    allErrors.push(...dateValidation.errors);
    allErrors.push(...descriptionValidation.errors);
    allErrors.push(...categoryValidation.errors);
    allErrors.push(...paymentMethodValidation.errors);
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  },
};

// Data integrity validation
export const DataIntegrityValidation = {
  // Validate subscription data integrity
  validateSubscriptionIntegrity(subscription: Subscription): ValidationResult {
    const errors: string[] = [];
    
    // Check required fields exist
    if (!subscription.id) {
      errors.push('Subscription ID is missing');
    }
    
    if (!subscription.createdAt || !ValidationUtils.isValidDate(subscription.createdAt)) {
      errors.push('Invalid or missing creation date');
    }
    
    if (!subscription.updatedAt || !ValidationUtils.isValidDate(subscription.updatedAt)) {
      errors.push('Invalid or missing update date');
    }
    
    // Check date consistency
    if (subscription.createdAt && subscription.updatedAt) {
      const created = new Date(subscription.createdAt);
      const updated = new Date(subscription.updatedAt);
      
      if (updated < created) {
        errors.push('Update date cannot be before creation date');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate expense data integrity
  validateExpenseIntegrity(expense: Expense): ValidationResult {
    const errors: string[] = [];
    
    // Check required fields exist
    if (!expense.id) {
      errors.push('Expense ID is missing');
    }
    
    if (!expense.createdAt || !ValidationUtils.isValidDate(expense.createdAt)) {
      errors.push('Invalid or missing creation date');
    }
    
    if (!expense.updatedAt || !ValidationUtils.isValidDate(expense.updatedAt)) {
      errors.push('Invalid or missing update date');
    }
    
    // Check date consistency
    if (expense.createdAt && expense.updatedAt) {
      const created = new Date(expense.createdAt);
      const updated = new Date(expense.updatedAt);
      
      if (updated < created) {
        errors.push('Update date cannot be before creation date');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate array of subscriptions for duplicates
  validateSubscriptionArray(subscriptions: Subscription[]): ValidationResult {
    const errors: string[] = [];
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    
    subscriptions.forEach((subscription, index) => {
      // Check for duplicate IDs
      if (seenIds.has(subscription.id)) {
        errors.push(`Duplicate subscription ID found at index ${index}: ${subscription.id}`);
      } else {
        seenIds.add(subscription.id);
      }
      
      // Check for duplicate names (case-insensitive)
      const normalizedName = subscription.name.toLowerCase().trim();
      if (seenNames.has(normalizedName)) {
        errors.push(`Duplicate subscription name found at index ${index}: ${subscription.name}`);
      } else {
        seenNames.add(normalizedName);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate array of expenses for duplicates
  validateExpenseArray(expenses: Expense[]): ValidationResult {
    const errors: string[] = [];
    const seenIds = new Set<string>();
    
    expenses.forEach((expense, index) => {
      // Check for duplicate IDs
      if (seenIds.has(expense.id)) {
        errors.push(`Duplicate expense ID found at index ${index}: ${expense.id}`);
      } else {
        seenIds.add(expense.id);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

// Form validation helpers
export const FormValidationHelpers = {
  // Get field-specific error message
  getFieldError(validationResult: ValidationResult, fieldName: string): string | null {
    if (validationResult.isValid) return null;
    
    const fieldErrors = validationResult.errors.filter(error => 
      error.toLowerCase().includes(fieldName.toLowerCase())
    );
    
    return fieldErrors.length > 0 ? fieldErrors[0] : validationResult.errors[0];
  },

  // Check if form has any errors
  hasErrors(validationResults: ValidationResult[]): boolean {
    return validationResults.some(result => !result.isValid);
  },

  // Get all error messages from multiple validation results
  getAllErrors(validationResults: ValidationResult[]): string[] {
    return validationResults.reduce((allErrors, result) => {
      return allErrors.concat(result.errors);
    }, [] as string[]);
  },

  // Format errors for display
  formatErrorsForDisplay(errors: string[]): string {
    if (errors.length === 0) return '';
    if (errors.length === 1) return errors[0];
    
    return errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
  },
};