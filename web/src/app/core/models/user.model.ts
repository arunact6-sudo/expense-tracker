export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  preferences: {
    theme: 'light' | 'dark';
    currency: string;
    language: string;
    dateFormat: string;
    notifications: boolean;
  };
  lastLogin?: Date;
  createdAt: Date;
}

export interface AuthResponse {
  success: boolean;
  data: { user: User; token: string };
}

export interface Category {
  _id: string;
  user?: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  icon: string;
  color: string;
  isDefault: boolean;
  isSystem: boolean;
}

export interface Transaction {
  _id: string;
  user: string;
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: Category;
  date: string;
  time?: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'upi' | 'other';
  wallet: Wallet;
  toWallet?: Wallet;
  notes?: string;
  tags?: string[];
  receiptUrl?: string;
  merchantName?: string;
  location?: string;
  recurring?: {
    isRecurring: boolean;
    frequency?: string;
    nextDate?: string;
    endDate?: string;
  };
  createdAt: Date;
}

export interface Wallet {
  _id: string;
  user: string;
  name: string;
  type: 'cash' | 'bank_account' | 'credit_card' | 'debit_card' | 'upi' | 'other';
  balance: number;
  currency: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Budget {
  _id: string;
  user: string;
  name: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'weekly' | 'yearly' | 'custom';
  category?: Category;
  wallet?: Wallet;
  startDate: string;
  endDate: string;
  alertThresholds: { warn: number; danger: number };
  isActive: boolean;
}

export interface Bill {
  _id: string;
  user: string;
  title: string;
  amount: number;
  category: Category;
  dueDate: string;
  isPaid: boolean;
  paidDate?: string;
  isRecurring: boolean;
  frequency?: string;
  wallet?: Wallet;
  notes?: string;
  reminderDate?: string;
  isActive: boolean;
}

export interface SavingsGoal {
  _id: string;
  user: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
  deadline?: string;
  category: string;
  isCompleted: boolean;
  completedDate?: string;
}

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  module: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface DashboardStats {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  monthlySavings: number;
  budgetRemaining: number;
  recentTransactions: Transaction[];
  monthlyOverview: any[];
  categoryBreakdown: any[];
  incomeVsExpense: any[];
  topSpendingCategories: any[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
