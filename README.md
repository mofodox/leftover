# Subscription and Expense Tracker

A personal web application designed to help individuals manage and monitor their recurring subscriptions and monthly expenses. This application provides a clear, centralized view of all financial commitments and spending patterns to enable better financial decision-making.

## Features

### Core Functionality
- **Subscription Management**: Add, edit, and delete recurring subscriptions with billing cycles
- **Expense Tracking**: Track one-time and recurring expenses with categories
- **Financial Overview**: View total monthly and yearly spending summaries
- **Category Analysis**: Organize and analyze spending by categories
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Key Benefits
- 📊 **Visibility**: Comprehensive overview of all active subscriptions and expenses
- 💰 **Financial Awareness**: Understand total monthly and yearly spending commitments
- 📱 **Simplicity**: Clean, intuitive interface for effortless expense tracking
- 🎯 **Budget Management**: Track and categorize expenses for better budgeting

## Getting Started

First, run the development server:

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

The application will redirect you to the dashboard where you can start managing your subscriptions and expenses.

## Project Structure

```
├── app/
│   ├── dashboard/          # Main dashboard page
│   ├── expenses/           # Expense management page
│   ├── subscriptions/      # Subscription management page
│   └── layout.tsx          # Root layout with navigation
├── components/ui/          # Reusable UI components
│   ├── AddExpenseForm.tsx
│   ├── AddSubscriptionForm.tsx
│   ├── FinancialSummary.tsx
│   ├── Navigation.tsx
│   └── ...
├── lib/                    # Utility functions and types
│   ├── storage.ts          # Data persistence
│   ├── types.ts            # TypeScript definitions
│   └── utils.ts            # Helper functions
└── tasks/                  # Project documentation
```

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org) with App Router
- **Language**: TypeScript
- **Styling**: CSS Modules
- **State Management**: React State
- **Data Storage**: Local Storage (browser-based)

## Usage

1. **Dashboard**: Get an overview of your financial commitments
2. **Subscriptions**: Add and manage recurring subscription services
3. **Expenses**: Track one-time and recurring expenses
4. **Categories**: Organize spending by custom categories

## Development

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

You can start editing the pages by modifying files in the `app/` directory. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
