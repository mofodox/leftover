'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Home() {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Expense Tracker
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Take control of your finances with our comprehensive subscription and expense tracking solution
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Subscriptions</h3>
            <p className="text-gray-600 text-sm">
              Monitor all your recurring subscriptions and never miss a payment
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Expenses</h3>
            <p className="text-gray-600 text-sm">
              Categorize and analyze your spending patterns with detailed insights
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Insights</h3>
            <p className="text-gray-600 text-sm">
              Get comprehensive reports and analytics to optimize your budget
            </p>
          </Card>
        </div>

        {/* Navigation buttons */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="primary" 
              className="w-full sm:w-auto px-8 py-3 text-lg"
              onClick={() => handleNavigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto px-8 py-3 text-lg"
              onClick={() => handleNavigate('/subscriptions')}
            >
              Manage Subscriptions
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto px-8 py-3 text-lg"
              onClick={() => handleNavigate('/expenses')}
            >
              Track Expenses
            </Button>
          </div>
        </div>

        {/* Quick stats preview */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            Start managing your finances today
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-3xl font-bold text-blue-600 mb-2">∞</p>
              <p className="text-gray-600">Unlimited Subscriptions</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-3xl font-bold text-green-600 mb-2">📱</p>
              <p className="text-gray-600">Mobile Responsive</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-3xl font-bold text-purple-600 mb-2">🔒</p>
              <p className="text-gray-600">Secure & Private</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
