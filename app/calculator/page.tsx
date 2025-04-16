"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import RouteGuard from "../components/RouteGuard";
import Header from "../components/Header";
import Footer from "../components/Footer";

type ExpenseItem = {
  id: string;
  name: string;
  amount: number;
};

function CalculatorContent() {
  const [income, setIncome] = useState<number>(0);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: crypto.randomUUID(), name: "Rent/Mortgage", amount: 0 },
    { id: crypto.randomUUID(), name: "Utilities", amount: 0 },
    { id: crypto.randomUUID(), name: "Groceries", amount: 0 },
  ]);
  const [newExpenseName, setNewExpenseName] = useState<string>("");
  const [disposableIncome, setDisposableIncome] = useState<number>(0);
  const { user } = useAuth();

  useEffect(() => {
    calculateDisposableIncome();
  }, [income, expenses]);

  const calculateDisposableIncome = () => {
    const totalExpenses = expenses.reduce(
      (total, expense) => total + (expense.amount || 0),
      0
    );
    setDisposableIncome(income - totalExpenses);
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setIncome(value);
  };

  const handleExpenseChange = (
    id: string,
    field: "name" | "amount",
    value: string | number
  ) => {
    setExpenses(
      expenses.map((expense) => {
        if (expense.id === id) {
          return {
            ...expense,
            [field]: field === "amount" ? parseFloat(value as string) || 0 : value,
          };
        }
        return expense;
      })
    );
  };

  const handleAddExpense = () => {
    if (newExpenseName.trim()) {
      setExpenses([
        ...expenses,
        { id: crypto.randomUUID(), name: newExpenseName, amount: 0 },
      ]);
      setNewExpenseName("");
    }
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main>
        <div className="py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-8">Disposable Income Calculator</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Expenses Section */}
              <div className="bg-background rounded-lg border border-black/10 dark:border-white/10 p-6">
                <h2 className="text-xl font-semibold mb-4">Your Expenses</h2>
                
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex gap-3 items-start">
                      <div className="flex-grow">
                        <input
                          type="text"
                          value={expense.name}
                          onChange={(e) => handleExpenseChange(expense.id, "name", e.target.value)}
                          className="block w-full rounded-md bg-transparent border border-black/20 dark:border-white/20 py-2 px-3 mb-2 focus:outline-none focus:ring-2 focus:ring-black/50 dark:focus:ring-white/50"
                          placeholder="Expense name"
                        />
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-black/50 dark:text-white/50">$</span>
                          </div>
                          <input
                            type="number"
                            value={expense.amount || ""}
                            onChange={(e) => handleExpenseChange(expense.id, "amount", e.target.value)}
                            className="block w-full rounded-md bg-transparent border border-black/20 dark:border-white/20 py-2 pl-8 pr-3 focus:outline-none focus:ring-2 focus:ring-black/50 dark:focus:ring-white/50"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExpense(expense.id)}
                        className="mt-2 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                        aria-label="Remove expense"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="h-5 w-5 text-black/70 dark:text-white/70"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newExpenseName}
                      onChange={(e) => setNewExpenseName(e.target.value)}
                      className="flex-grow rounded-md bg-transparent border border-black/20 dark:border-white/20 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black/50 dark:focus:ring-white/50"
                      placeholder="Add a new expense"
                    />
                    <button
                      type="button"
                      onClick={handleAddExpense}
                      className="rounded-md bg-black/10 dark:bg-white/10 px-3 py-2 hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Income Section */}
                <div className="bg-background rounded-lg border border-black/10 dark:border-white/10 p-6">
                  <h2 className="text-xl font-semibold mb-4">Your Income</h2>
                  <div>
                    <label 
                      htmlFor="income" 
                      className="block text-sm font-medium mb-2"
                    >
                      Monthly Income
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-black/50 dark:text-white/50">$</span>
                      </div>
                      <input
                        type="number"
                        id="income"
                        value={income || ""}
                        onChange={handleIncomeChange}
                        className="block w-full rounded-md bg-transparent border border-black/20 dark:border-white/20 py-2 pl-8 pr-3 focus:outline-none focus:ring-2 focus:ring-black/50 dark:focus:ring-white/50"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-background rounded-lg border border-black/10 dark:border-white/10 p-6 h-fit sticky top-4">
                  <h2 className="text-xl font-semibold mb-6">Your Results</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-black/70 dark:text-white/70 mb-1">Total Income</p>
                      <p className="text-2xl font-semibold font-mono">{formatCurrency(income)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-black/70 dark:text-white/70 mb-1">Total Expenses</p>
                      <p className="text-2xl font-semibold font-mono">
                        {formatCurrency(
                          expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
                        )}
                      </p>
                    </div>
                    
                    <div className="h-px bg-black/10 dark:bg-white/10"></div>
                    
                    <div>
                      <p className="text-sm text-black/70 dark:text-white/70 mb-1">Disposable Income</p>
                      <p className={`text-3xl font-bold font-mono ${
                          disposableIncome >= 0 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-red-600 dark:text-red-400"
                        }`}>
                        {formatCurrency(disposableIncome)}
                      </p>
                    </div>
                    
                    {disposableIncome < 0 && (
                      <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-md p-3 text-sm text-red-700 dark:text-red-300">
                        Your expenses exceed your income. Consider reducing some expenses or finding additional income sources.
                      </div>
                    )}
                    
                    {disposableIncome > 0 && disposableIncome < income * 0.2 && (
                      <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-md p-3 text-sm text-yellow-700 dark:text-yellow-300">
                        Your disposable income is less than 20% of your total income. Consider reviewing your budget to increase savings.
                      </div>
                    )}
                    
                    {disposableIncome >= income * 0.2 && (
                      <div className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-md p-3 text-sm text-green-700 dark:text-green-300">
                        You have a healthy amount of disposable income!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function Calculator() {
  return (
    <RouteGuard>
      <CalculatorContent />
    </RouteGuard>
  );
} 