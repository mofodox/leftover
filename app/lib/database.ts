import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export type Expense = {
  id: string;
  name: string;
  amount: number;
  created_at?: string;
  updated_at?: string;
};

export type Income = {
  id: string;
  name: string;
  amount: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

export type Budget = {
  id: string;
  name: string;
  description?: string;
  disposable_income: number;
  created_at?: string;
  updated_at?: string;
};

// Get expenses for a user
export const getUserExpenses = async (userId: string): Promise<Expense[]> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
};

// Add a new expense
export const addExpense = async (userId: string, name: string, amount: number): Promise<Expense | null> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        name,
        amount
      })
      .select()
      .single();

    if (error) throw error;
    
    // Create or update user budget after adding expense
    await createOrUpdateBudget(userId);
    
    return data;
  } catch (error) {
    console.error('Error adding expense:', error);
    return null;
  }
};

// Update an expense
export const updateExpense = async (expenseId: string, updates: { name?: string; amount?: number }): Promise<Expense | null> => {
  try {
    const { data: expense, error: fetchError } = await supabase
      .from('expenses')
      .select('user_id')
      .eq('id', expenseId)
      .single();
      
    if (fetchError) throw fetchError;
    
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', expenseId)
      .select()
      .single();

    if (error) throw error;
    
    // Update user budget after updating expense
    await createOrUpdateBudget(expense.user_id);
    
    return data;
  } catch (error) {
    console.error('Error updating expense:', error);
    return null;
  }
};

// Delete an expense
export const deleteExpense = async (expenseId: string): Promise<boolean> => {
  try {
    const { data: expense, error: fetchError } = await supabase
      .from('expenses')
      .select('user_id')
      .eq('id', expenseId)
      .single();
      
    if (fetchError) throw fetchError;
    
    const userId = expense.user_id;
    
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) throw error;
    
    // Update user budget after deleting expense
    await createOrUpdateBudget(userId);
    
    return true;
  } catch (error) {
    console.error('Error deleting expense:', error);
    return false;
  }
};

// Get income for a user
export const getUserIncome = async (userId: string): Promise<Income | null> => {
  try {
    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching income:', error);
    return null;
  }
};

// Save or update income
export const saveIncome = async (userId: string, amount: number, name: string = 'Monthly Income', description?: string): Promise<Income | null> => {
  try {
    // Check if there's an existing income record
    const { data: existingIncome, error: fetchError } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existingIncome) {
      // Update existing income
      const { data, error } = await supabase
        .from('incomes')
        .update({ 
          amount,
          name,
          description,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingIncome.id)
        .select()
        .single();

      if (error) throw error;
      
      // Update user budget after updating income
      await createOrUpdateBudget(userId);
      
      return data;
    } else {
      // Create new income
      const { data, error } = await supabase
        .from('incomes')
        .insert({ 
          user_id: userId,
          amount,
          name,
          description
        })
        .select()
        .single();

      if (error) throw error;
      
      // Create or update user budget after adding income
      await createOrUpdateBudget(userId);
      
      return data;
    }
  } catch (error) {
    console.error('Error saving income:', error);
    return null;
  }
};

// Create or update user budget
export const createOrUpdateBudget = async (userId: string, name: string = 'Monthly Budget', description?: string): Promise<Budget | null> => {
  try {
    // Check if there's an existing budget
    const { data: existingBudget, error: fetchError } = await supabase
      .from('user_budgets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existingBudget) {
      // Update existing budget
      const { data, error } = await supabase
        .from('user_budgets')
        .update({ 
          name,
          description,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingBudget.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new budget
      const { data, error } = await supabase
        .from('user_budgets')
        .insert({ 
          user_id: userId,
          name,
          description
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error creating/updating budget:', error);
    return null;
  }
};

// Get user budget with calculated disposable income
export const getUserBudget = async (userId: string): Promise<Budget | null> => {
  try {
    // Ensure budget exists
    await createOrUpdateBudget(userId);
    
    const { data, error } = await supabase
      .from('user_budgets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching user budget:', error);
    return null;
  }
}; 