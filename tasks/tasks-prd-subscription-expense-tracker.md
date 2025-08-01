# Task List: Subscription and Expense Tracker

## Relevant Files

- `app/dashboard/page.tsx` - Main dashboard component displaying overview and navigation
- `app/subscriptions/page.tsx` - Subscriptions management page with list and CRUD operations
- `app/expenses/page.tsx` - Expenses management page with list and CRUD operations
- `components/ui/SubscriptionCard.tsx` - Card component for displaying individual subscriptions
- `components/ui/ExpenseCard.tsx` - Card component for displaying individual expenses
- `components/ui/AddSubscriptionForm.tsx` - Form component for adding/editing subscriptions
- `components/ui/AddExpenseForm.tsx` - Form component for adding/editing expenses
- `components/ui/FinancialSummary.tsx` - Component for displaying financial totals and summaries
- `components/ui/Button.tsx` - Reusable button component
- `components/ui/Modal.tsx` - Modal component for forms and confirmations
- `lib/types.ts` - TypeScript interfaces for Subscription and Expense data models
- `lib/storage.ts` - Local storage utilities for data persistence
- `lib/utils.ts` - Utility functions for calculations and formatting
- `lib/constants.ts` - Constants for categories, billing cycles, and payment methods

### Notes

- Components will be organized in a `components/ui/` directory for reusability
- Data persistence will use browser localStorage for this personal application
- Tailwind CSS will be used for styling, maintaining the existing design system
- TypeScript interfaces will ensure type safety across the application

## Tasks

- [x] 1.0 Set up data models and storage infrastructure
  - [x] 1.1 Create TypeScript interfaces for Subscription and Expense data models in `lib/types.ts`
  - [x] 1.2 Define category constants and billing cycle enums in `lib/constants.ts`
  - [x] 1.3 Implement localStorage utilities for data persistence in `lib/storage.ts`
  - [x] 1.4 Create utility functions for date calculations and currency formatting in `lib/utils.ts`
  - [x] 1.5 Add data validation functions for form inputs and data integrity

- [x] 2.0 Create core UI components and design system
  - [x] 2.1 Create reusable Button component with variants (primary, secondary, danger) in `components/ui/Button.tsx`
  - [x] 2.2 Build Modal component for forms and confirmations in `components/ui/Modal.tsx`
  - [x] 2.3 Create Input component with validation states in `components/ui/Input.tsx`
  - [x] 2.4 Build Select component for dropdowns (categories, billing cycles) in `components/ui/Select.tsx`
  - [x] 2.5 Create Card component base for subscription and expense displays in `components/ui/Card.tsx`
  - [x] 2.6 Implement responsive navigation component in `components/ui/Navigation.tsx`

- [x] 3.0 Implement subscription management functionality
  - [x] 3.1 Create SubscriptionCard component for displaying individual subscriptions in `components/ui/SubscriptionCard.tsx`
  - [x] 3.2 Build AddSubscriptionForm component with validation in `components/ui/AddSubscriptionForm.tsx`
  - [x] 3.3 Create subscriptions page with list view and add/edit functionality in `app/subscriptions/page.tsx`
  - [x] 3.4 Implement subscription CRUD operations (create, read, update, delete)
  - [x] 3.5 Add subscription filtering and sorting capabilities
  - [x] 3.6 Implement next billing date calculations and display

- [x] 4.0 Implement expense management functionality
  - [x] 4.1 Create ExpenseCard component for displaying individual expenses in `components/ui/ExpenseCard.tsx`
  - [x] 4.2 Build AddExpenseForm component with validation in `components/ui/AddExpenseForm.tsx`
  - [x] 4.3 Create expenses page with list view and add/edit functionality in `app/expenses/page.tsx`
  - [x] 4.4 Implement expense CRUD operations (create, read, update, delete)
  - [x] 4.5 Add expense filtering by date range and category
  - [x] 4.6. Implement recurring expense detection and management

- [ ] 5.0 Build financial overview dashboard
  - [ ] 5.1 Create FinancialSummary component for totals and calculations in `components/ui/FinancialSummary.tsx`
  - [ ] 5.2 Build main dashboard page with overview cards in `app/dashboard/page.tsx`
  - [ ] 5.3 Implement monthly and yearly subscription cost calculations
  - [ ] 5.4 Add expense summaries by category and time period
  - [ ] 5.5 Create responsive grid layout for dashboard cards
  - [ ] 5.6 Update main page to redirect to dashboard and add proper navigation