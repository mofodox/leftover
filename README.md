This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Leftover Income Calculator

## Getting Started

First, set up your environment variables:

```bash
# Create a .env.local file with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase Setup

This project uses [Supabase](https://supabase.com) for authentication and database storage. Follow these steps to set up your Supabase project:

1. Create a new project in [Supabase](https://app.supabase.com)
2. Get your project URL and anon key from the project settings
3. Run the SQL query in `supabase_setup.sql` in the SQL editor of your Supabase project
4. Add the URL and anon key to your `.env.local` file

### Database Schema

The application uses the following tables:

- `incomes`: Stores user's income information
  - `id`: UUID primary key
  - `user_id`: References auth.users.id
  - `amount`: Numeric field for the income amount
  - `name`: Text field for income name (default: "Monthly Income")
  - `description`: Optional text field for additional information
  - `created_at`: Timestamp of record creation
  - `updated_at`: Timestamp of last update

- `expenses`: Stores individual expenses
  - `id`: UUID primary key
  - `user_id`: References auth.users.id
  - `name`: Text field for expense name
  - `amount`: Numeric field for the expense amount
  - `date`: Optional text field for backward compatibility
  - `payment_frequency`: Payment type - one-time, monthly, or yearly (default: "one-time")
  - `payment_day`: Day of month (1-31) for monthly and yearly payments
  - `payment_month`: Month (1-12) for yearly payments only
  - `created_at`: Timestamp of record creation
  - `updated_at`: Timestamp of last update

- `user_budgets`: Join table that automatically calculates leftover income
  - `id`: UUID primary key
  - `user_id`: References auth.users.id
  - `name`: Text field for budget name (default: "Monthly Budget")
  - `description`: Optional text field for additional information
  - `disposable_income`: Automatically calculated field (total income - total expenses)
  - `created_at`: Timestamp of record creation
  - `updated_at`: Timestamp of last update

This normalized database schema provides better organization and scalability for future features.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
