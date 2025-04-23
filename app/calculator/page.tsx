"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import RouteGuard from "../components/RouteGuard";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { 
  Expense, 
  Income, 
  Budget,
  getUserExpenses, 
  addExpense, 
  updateExpense, 
  deleteExpense, 
  getUserIncome, 
  saveIncome, 
  getUserBudget 
} from "../lib/database";
import { v4 as uuidv4 } from "uuid";

function CalculatorContent() {
  const [income, setIncome] = useState<number>(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpenseName, setNewExpenseName] = useState<string>("");
  const [disposableIncome, setDisposableIncome] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const { user } = useAuth();

  // Load data from Supabase when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Load expenses
        const expensesData = await getUserExpenses(user.id);
        if (expensesData && expensesData.length > 0) {
          setExpenses(expensesData);
        } else {
          // Set default expenses if none exist
          const defaultExpenses = [
            { id: uuidv4(), name: "Rent/Mortgage", amount: 0 },
            { id: uuidv4(), name: "Utilities", amount: 0 },
            { id: uuidv4(), name: "Groceries", amount: 0 },
          ];
          
          // Add default expenses to database
          for (const expense of defaultExpenses) {
            await addExpense(user.id, expense.name, expense.amount);
          }
          
          // Fetch expenses again to get the ones with proper IDs from the database
          const newExpenses = await getUserExpenses(user.id);
          setExpenses(newExpenses);
        }
        
        // Load income
        const incomeData = await getUserIncome(user.id);
        if (incomeData) {
          setIncome(incomeData.amount);
        }
        
        // Load budget to get disposable income
        const budgetData = await getUserBudget(user.id);
        if (budgetData) {
          setDisposableIncome(budgetData.disposable_income);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  // Save income when it changes
  useEffect(() => {
    const saveIncomeData = async () => {
      if (!user || isLoading) return;
      
      setSaveStatus("saving");
      
      try {
        await saveIncome(user.id, income);
        setSaveStatus("success");
        
        // Get updated budget
        const budgetData = await getUserBudget(user.id);
        if (budgetData) {
          setDisposableIncome(budgetData.disposable_income);
        }
        
        // Reset success status after 3 seconds
        setTimeout(() => {
          if (setSaveStatus) setSaveStatus("idle");
        }, 3000);
      } catch (error) {
        console.error("Error saving income:", error);
        setSaveStatus("error");
      }
    };
    
    const debounceTimer = setTimeout(() => {
      saveIncomeData();
    }, 1000);
    
    return () => clearTimeout(debounceTimer);
  }, [income, user]);

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setIncome(value);
  };

  const handleExpenseChange = async (
    id: string,
    field: "name" | "amount",
    value: string | number
  ) => {
    const updatedExpenses = expenses.map((expense) => {
      if (expense.id === id) {
        return {
          ...expense,
          [field]: field === "amount" ? parseFloat(value as string) || 0 : value,
        };
      }
      return expense;
    });
    
    setExpenses(updatedExpenses);
    
    // Save the updated expense to Supabase
    setSaveStatus("saving");
    try {
      const updatedExpense = updatedExpenses.find(e => e.id === id);
      if (updatedExpense) {
        await updateExpense(id, { 
          name: updatedExpense.name, 
          amount: updatedExpense.amount 
        });
      }
      
      // Get updated budget
      if (user) {
        const budgetData = await getUserBudget(user.id);
        if (budgetData) {
          setDisposableIncome(budgetData.disposable_income);
        }
      }
      
      setSaveStatus("success");
      
      // Reset success status after 3 seconds
      setTimeout(() => {
        if (setSaveStatus) setSaveStatus("idle");
      }, 3000);
    } catch (error) {
      console.error("Error updating expense:", error);
      setSaveStatus("error");
    }
  };

  const handleAddExpense = async () => {
    if (newExpenseName.trim() && user) {
      setSaveStatus("saving");
      
      try {
        const newExpense = await addExpense(user.id, newExpenseName, 0);
        
        if (newExpense) {
          setExpenses([...expenses, newExpense]);
        }
        
        setNewExpenseName("");
        
        // Get updated budget
        const budgetData = await getUserBudget(user.id);
        if (budgetData) {
          setDisposableIncome(budgetData.disposable_income);
        }
        
        setSaveStatus("success");
        
        // Reset success status after 3 seconds
        setTimeout(() => {
          if (setSaveStatus) setSaveStatus("idle");
        }, 3000);
      } catch (error) {
        console.error("Error adding expense:", error);
        setSaveStatus("error");
      }
    }
  };

  const handleRemoveExpense = async (id: string) => {
    setSaveStatus("saving");
    
    try {
      // First update the UI immediately for better user experience
      // Find the expense to be removed
      const expenseToRemove = expenses.find((expense) => expense.id === id);
      // Update local expenses state
      const updatedExpenses = expenses.filter((expense) => expense.id !== id);
      setExpenses(updatedExpenses);
      
      // Calculate and update disposable income locally
      if (expenseToRemove) {
        const newDisposableIncome = income - updatedExpenses.reduce((total, expense) => total + expense.amount, 0);
        setDisposableIncome(newDisposableIncome);
      }
      
      // Then handle the server-side deletion (but don't update UI again)
      const success = await deleteExpense(id);
      if (!success) {
        // If server deletion failed, revert our optimistic UI update
        setExpenses(expenses);
        
        // Recalculate the original disposable income
        const originalTotalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
        setDisposableIncome(income - originalTotalExpenses);
        
        throw new Error("Server failed to delete expense");
      }
      
      setSaveStatus("success");
      
      // Reset success status after 3 seconds
      setTimeout(() => {
        if (setSaveStatus) setSaveStatus("idle");
      }, 3000);
    } catch (error) {
      console.error("Error removing expense:", error);
      setSaveStatus("error");
    }
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
            
            {/* Save status indicator */}
            <div className="mb-6">
              {saveStatus === "saving" && (
                <div className="text-sm text-black/70 dark:text-white/70 flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black/70 dark:text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving changes...
                </div>
              )}
              {saveStatus === "success" && (
                <div className="text-sm text-green-600 dark:text-green-400 flex items-center">
                  <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Changes saved successfully
                </div>
              )}
              {saveStatus === "error" && (
                <div className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Error saving changes
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
              </div>
            ) : (
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
            )}
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