-- Create income table
CREATE TABLE IF NOT EXISTS incomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  name TEXT NOT NULL DEFAULT 'Monthly Income',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create expense categories table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  date TEXT,
  payment_frequency TEXT CHECK (payment_frequency IN ('one-time', 'monthly', 'yearly')) DEFAULT 'one-time',
  payment_day INTEGER CHECK (payment_day IS NULL OR (payment_day >= 1 AND payment_day <= 31)), -- Day of month for monthly and yearly payments
  payment_month INTEGER CHECK (payment_month IS NULL OR (payment_month >= 1 AND payment_month <= 12)), -- Month only for yearly payments
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user_budget table to join income and expenses
CREATE TABLE IF NOT EXISTS user_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Monthly Budget',
  description TEXT,
  disposable_income NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_budgets ENABLE ROW LEVEL SECURITY;

-- Create policies for incomes table
CREATE POLICY incomes_user_policy ON incomes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for expenses table
CREATE POLICY expenses_user_policy ON expenses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_budgets table
CREATE POLICY user_budgets_user_policy ON user_budgets
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS incomes_user_id_idx ON incomes (user_id);
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses (user_id);
CREATE INDEX IF NOT EXISTS user_budgets_user_id_idx ON user_budgets (user_id);

-- Create function to update disposable income
CREATE OR REPLACE FUNCTION update_disposable_income()
RETURNS TRIGGER AS $$
DECLARE
  total_income NUMERIC;
  total_expenses NUMERIC;
BEGIN
  -- Calculate total income
  SELECT COALESCE(SUM(amount), 0) INTO total_income
  FROM incomes
  WHERE user_id = NEW.user_id;
  
  -- Calculate total expenses
  SELECT COALESCE(SUM(amount), 0) INTO total_expenses
  FROM expenses
  WHERE user_id = NEW.user_id;
  
  -- Update the disposable income in user_budgets
  UPDATE user_budgets
  SET disposable_income = total_income - total_expenses,
      updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update disposable income when income or expenses change
CREATE TRIGGER update_budget_on_income_change
AFTER INSERT OR UPDATE OR DELETE ON incomes
FOR EACH ROW EXECUTE FUNCTION update_disposable_income();

CREATE TRIGGER update_budget_on_expense_change
AFTER INSERT OR UPDATE OR DELETE ON expenses
FOR EACH ROW EXECUTE FUNCTION update_disposable_income();

-- Migration script for existing expense tables
-- Run this if you already have the expenses table and need to add the new columns
-- This script is NON-DESTRUCTIVE and will preserve all existing data

DO $$ 
BEGIN
  -- Check if the table exists and columns don't exist yet before adding them
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'expenses'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'expenses' 
    AND column_name = 'payment_frequency'
  ) THEN
    RAISE NOTICE 'Adding new columns to expenses table. All existing data will be preserved.';
    
    -- Add date column if it doesn't exist (preserves existing data)
    ALTER TABLE expenses ADD COLUMN IF NOT EXISTS date TEXT;
    
    -- Add payment_frequency column with default and check constraint
    -- This preserves all existing data and just adds a new column
    ALTER TABLE expenses ADD COLUMN payment_frequency TEXT DEFAULT 'one-time';
    ALTER TABLE expenses ADD CONSTRAINT payment_frequency_check 
      CHECK (payment_frequency IN ('one-time', 'monthly', 'yearly'));
    
    -- Add payment_day column with check constraint
    -- This preserves all existing data and just adds a new column
    ALTER TABLE expenses ADD COLUMN payment_day INTEGER;
    ALTER TABLE expenses ADD CONSTRAINT payment_day_check 
      CHECK (payment_day IS NULL OR (payment_day >= 1 AND payment_day <= 31));
    COMMENT ON COLUMN expenses.payment_day IS 'Day of month for monthly and yearly payments';
    
    -- Add payment_month column with check constraint
    -- This preserves all existing data and just adds a new column
    -- Only used for yearly payments, should remain NULL for monthly payments
    ALTER TABLE expenses ADD COLUMN payment_month INTEGER;
    ALTER TABLE expenses ADD CONSTRAINT payment_month_check 
      CHECK (payment_month IS NULL OR (payment_month >= 1 AND payment_month <= 12));
    COMMENT ON COLUMN expenses.payment_month IS 'Month only for yearly payments, should be NULL for monthly payments';
    
    -- Set default payment_frequency for existing records
    -- This only affects the new column - all original data remains untouched
    UPDATE expenses SET payment_frequency = 'one-time' WHERE payment_frequency IS NULL;
    
    RAISE NOTICE 'Migration completed successfully. All existing data has been preserved.';
  ELSE
    RAISE NOTICE 'No migration needed or table doesn''t exist.';
  END IF;
END $$; 