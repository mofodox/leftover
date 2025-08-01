'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '../../components/ui/Navigation';
import { Subscription } from '@/lib/types';
import { SubscriptionCard, SubscriptionManager, AddSubscriptionForm, Button, BillingAlerts } from '@/components/ui';
import { SubscriptionStorage } from '@/lib/storage';
import { Utils } from '@/lib/utils';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load subscriptions on component mount
  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedSubscriptions = SubscriptionStorage.getAll();
      
      // Update overdue billing dates automatically
      const updatedSubscriptions = Utils.updateOverdueSubscriptions(loadedSubscriptions);
      
      // Save updated subscriptions back to storage if any were updated
      const hasUpdates = updatedSubscriptions.some((sub, index) => 
        sub.nextBillingDate !== loadedSubscriptions[index]?.nextBillingDate
      );
      
      if (hasUpdates) {
        updatedSubscriptions.forEach(subscription => {
          if (subscription.nextBillingDate !== loadedSubscriptions.find(s => s.id === subscription.id)?.nextBillingDate) {
            SubscriptionStorage.update(subscription.id, subscription);
          }
        });
      }
      
      setSubscriptions(updatedSubscriptions);
    } catch (err) {
      console.error('Error loading subscriptions:', err);
      setError('Failed to load subscriptions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubscription = async (subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSubscription: Subscription = {
        ...subscriptionData,
        id: Utils.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      SubscriptionStorage.add(newSubscription);
      setSubscriptions(prev => [...prev, newSubscription]);
      setIsAddFormOpen(false);
    } catch (err) {
      console.error('Error adding subscription:', err);
      throw new Error('Failed to add subscription. Please try again.');
    }
  };

  const handleEditSubscription = async (subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingSubscription) return;

    try {
      const updatedSubscription: Subscription = {
        ...subscriptionData,
        id: editingSubscription.id,
        createdAt: editingSubscription.createdAt,
        updatedAt: new Date().toISOString(),
      };

      SubscriptionStorage.update(updatedSubscription.id, updatedSubscription);
      setSubscriptions(prev => 
        prev.map(sub => sub.id === updatedSubscription.id ? updatedSubscription : sub)
      );
      setEditingSubscription(null);
    } catch (err) {
      console.error('Error updating subscription:', err);
      throw new Error('Failed to update subscription. Please try again.');
    }
  };

  const handleDeleteSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    try {
      SubscriptionStorage.delete(subscriptionId);
      setSubscriptions(prev => prev.filter(sub => sub.id !== subscriptionId));
    } catch (err) {
      console.error('Error deleting subscription:', err);
      setError('Failed to delete subscription. Please try again.');
    }
  };

  const handleToggleActive = async (subscriptionId: string) => {
    try {
      const subscription = subscriptions.find(sub => sub.id === subscriptionId);
      if (!subscription) return;

      const updatedSubscription: Subscription = {
        ...subscription,
        isActive: !subscription.isActive,
        updatedAt: new Date().toISOString(),
      };

      SubscriptionStorage.update(subscriptionId, updatedSubscription);
      setSubscriptions(prev => 
        prev.map(sub => sub.id === subscriptionId ? updatedSubscription : sub)
      );
    } catch (err) {
      console.error('Error toggling subscription status:', err);
      setError('Failed to update subscription status. Please try again.');
    }
  };

  const handleOpenEditForm = (subscription: Subscription) => {
    setEditingSubscription(subscription);
  };

  const handleCloseEditForm = () => {
    setEditingSubscription(null);
  };

  const handleCloseAddForm = () => {
    setIsAddFormOpen(false);
  };

  // Calculate summary statistics
  const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
  const totalMonthlyCost = activeSubscriptions.reduce((total, sub) => {
    // Convert all costs to monthly for summary
    switch (sub.billingCycle) {
      case 'weekly':
        return total + (sub.cost * 4.33); // Average weeks per month
      case 'monthly':
        return total + sub.cost;
      case 'quarterly':
        return total + (sub.cost / 3);
      case 'yearly':
        return total + (sub.cost / 12);
      default:
        return total + sub.cost;
    }
  }, 0);

  const totalYearlyCost = totalMonthlyCost * 12;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation items={[]} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading subscriptions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation items={[]} />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
              <p className="mt-1 text-gray-600">
                Manage your recurring subscriptions and track your spending
              </p>
            </div>
            <Button
              onClick={() => setIsAddFormOpen(true)}
              size="lg"
            >
              Add Subscription
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Subscriptions</h3>
            <p className="text-3xl font-bold text-blue-600">{activeSubscriptions.length}</p>
            <p className="text-sm text-gray-500">
              {subscriptions.length - activeSubscriptions.length} paused
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Cost</h3>
            <p className="text-3xl font-bold text-green-600">
              ${totalMonthlyCost.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">Active subscriptions only</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Yearly Cost</h3>
            <p className="text-3xl font-bold text-purple-600">
              ${totalYearlyCost.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">Projected annual spending</p>
          </div>
        </div>

        {/* Billing Alerts */}
        <BillingAlerts
          subscriptions={subscriptions}
          onViewSubscription={handleOpenEditForm}
          className="mb-6"
        />

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

        {/* Subscriptions List */}
        {subscriptions.length === 0 ? (
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No subscriptions</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first subscription.
            </p>
            <div className="mt-6">
              <Button onClick={() => setIsAddFormOpen(true)}>
                Add Subscription
              </Button>
            </div>
          </div>
        ) : (
          <SubscriptionManager
            subscriptions={subscriptions}
            onEdit={handleOpenEditForm}
            onDelete={handleDeleteSubscription}
            onToggleActive={handleToggleActive}
          />
        )}
      </div>

      {/* Add Subscription Form */}
      <AddSubscriptionForm
        isOpen={isAddFormOpen}
        onClose={handleCloseAddForm}
        onSubmit={handleAddSubscription}
        title="Add New Subscription"
      />

      {/* Edit Subscription Form */}
      <AddSubscriptionForm
        isOpen={!!editingSubscription}
        onClose={handleCloseEditForm}
        onSubmit={handleEditSubscription}
        editingSubscription={editingSubscription}
        title="Edit Subscription"
      />
    </div>
  );
}