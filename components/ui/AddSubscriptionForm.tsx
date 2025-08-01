'use client';

import React, { useState, useEffect } from 'react';
import { Subscription, BillingCycle, Category } from '@/lib/types';
import { CATEGORIES, BILLING_CYCLES } from '@/lib/constants';
import { SubscriptionValidation, FormValidationHelpers } from '@/lib/validation';
import { DateUtils, Utils } from '@/lib/utils';
import { Button } from './Button';
import { Input, Textarea } from './Input';
import { Select } from './Select';
import { Modal } from './Modal';

interface AddSubscriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingSubscription?: Subscription | null;
  title?: string;
}

interface FormData {
  name: string;
  cost: string;
  billingCycle: BillingCycle;
  category: Category;
  nextBillingDate: string;
  description: string;
  website: string;
  isActive: boolean;
}

const initialFormData: FormData = {
  name: '',
  cost: '',
  billingCycle: 'monthly',
  category: 'other',
  nextBillingDate: '',
  description: '',
  website: '',
  isActive: true,
};

export function AddSubscriptionForm({
  isOpen,
  onClose,
  onSubmit,
  editingSubscription,
  title,
}: AddSubscriptionFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!editingSubscription;
  const modalTitle = title || (isEditing ? 'Edit Subscription' : 'Add New Subscription');

  // Reset form when modal opens/closes or editing subscription changes
  useEffect(() => {
    if (isOpen) {
      if (editingSubscription) {
        setFormData({
          name: editingSubscription.name,
          cost: editingSubscription.cost.toString(),
          billingCycle: editingSubscription.billingCycle,
          category: editingSubscription.category as Category,
          nextBillingDate: DateUtils.formatDateForInput(editingSubscription.nextBillingDate),
          description: editingSubscription.description || '',
          website: editingSubscription.website || '',
          isActive: editingSubscription.isActive,
        });
      } else {
        setFormData({
          ...initialFormData,
          nextBillingDate: DateUtils.formatDateForInput(new Date()),
        });
      }
      setErrors({});
    }
  }, [isOpen, editingSubscription]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const validationErrors: Record<string, string> = {};

    // Validate name
    const nameValidation = SubscriptionValidation.validateName(formData.name);
    if (!nameValidation.isValid) {
      validationErrors.name = nameValidation.errors[0];
    }

    // Validate cost
    const cost = parseFloat(formData.cost);
    const costValidation = SubscriptionValidation.validateCost(cost);
    if (!costValidation.isValid) {
      validationErrors.cost = costValidation.errors[0];
    }

    // Validate billing cycle
    const billingCycleValidation = SubscriptionValidation.validateBillingCycle(formData.billingCycle);
    if (!billingCycleValidation.isValid) {
      validationErrors.billingCycle = billingCycleValidation.errors[0];
    }

    // Validate category
    const categoryValidation = SubscriptionValidation.validateCategory(formData.category);
    if (!categoryValidation.isValid) {
      validationErrors.category = categoryValidation.errors[0];
    }

    // Validate next billing date
    const nextBillingDateValidation = SubscriptionValidation.validateNextBillingDate(formData.nextBillingDate);
    if (!nextBillingDateValidation.isValid) {
      validationErrors.nextBillingDate = nextBillingDateValidation.errors[0];
    }

    // Validate website if provided
    if (formData.website.trim()) {
      try {
        new URL(formData.website);
      } catch {
        validationErrors.website = 'Please enter a valid URL (e.g., https://example.com)';
      }
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
      const subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name.trim(),
        cost: parseFloat(formData.cost),
        billingCycle: formData.billingCycle,
        category: formData.category,
        nextBillingDate: new Date(formData.nextBillingDate).toISOString(),
        description: formData.description.trim() || undefined,
        website: formData.website.trim() || undefined,
        isActive: formData.isActive,
      };

      await onSubmit(subscriptionData);
      onClose();
    } catch (error) {
      console.error('Error submitting subscription:', error);
      setErrors({ submit: 'Failed to save subscription. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const billingCycleOptions = BILLING_CYCLES.map(cycle => ({
    value: cycle.value,
    label: cycle.label,
  }));

  const categoryOptions = CATEGORIES.map(category => ({
    value: category.value,
    label: category.label,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <Input
          label="Subscription Name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={errors.name}
          placeholder="e.g., Netflix, Spotify, Adobe Creative Cloud"
          required
          disabled={isSubmitting}
        />

        {/* Cost and Billing Cycle Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Cost"
            type="number"
            value={formData.cost}
            onChange={(e) => handleInputChange('cost', e.target.value)}
            error={errors.cost}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
            disabled={isSubmitting}
          />

          <Select
            label="Billing Cycle"
            value={formData.billingCycle}
            onChange={(e) => handleInputChange('billingCycle', e.target.value as BillingCycle)}
            options={billingCycleOptions}
            error={errors.billingCycle}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Category and Next Billing Date Row */}
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

          <Input
            label="Next Billing Date"
            type="date"
            value={formData.nextBillingDate}
            onChange={(e) => handleInputChange('nextBillingDate', e.target.value)}
            error={errors.nextBillingDate}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Description Field */}
        <Textarea
          label="Description (Optional)"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          error={errors.description}
          placeholder="Brief description of the subscription"
          disabled={isSubmitting}
          rows={3}
        />

        {/* Website Field */}
        <Input
          label="Website (Optional)"
          type="url"
          value={formData.website}
          onChange={(e) => handleInputChange('website', e.target.value)}
          error={errors.website}
          placeholder="https://example.com"
          disabled={isSubmitting}
        />

        {/* Active Status */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
            disabled={isSubmitting}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Subscription is active
          </label>
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
            {isEditing ? 'Update Subscription' : 'Add Subscription'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Export a simplified version for quick usage
export interface QuickAddSubscriptionProps {
  onSubmit: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => void;
  trigger?: React.ReactNode;
}

export function QuickAddSubscription({ onSubmit, trigger }: QuickAddSubscriptionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultTrigger = (
    <Button onClick={() => setIsOpen(true)}>
      Add Subscription
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
      
      <AddSubscriptionForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={onSubmit}
      />
    </>
  );
}