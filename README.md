# Expense Tracker - Full Stack MEAN + Ionic Application

A complete expense tracking application with Web (Angular + Material) and Mobile (Ionic Angular) frontends, powered by MongoDB, Express.js, Node.js, and Angular.

## Project Structure

```
expense-tracker/
├── backend/          # Node.js + Express.js + MongoDB REST API
├── web/              # Angular 17 Web Application (Angular Material)
└── mobile/           # Ionic Angular Mobile Application
```

## Features

### Authentication & User Management
- JWT-based authentication with secure password hashing (bcrypt)
- Registration with security questions for password recovery
- Profile management with avatar upload
- Theme selection (Light/Dark), currency, language, date format preferences
- Role-based access control (User/Admin)

### Dashboard
- Total Balance, Income, Expenses, Monthly Savings, Budget Remaining
- Recent Transactions list
- Monthly Overview (bar chart)
- Expense by Category (doughnut chart)
- Income vs Expense (line chart)
- Budget Progress with color-coded progress bars
- Top Spending Categories

### Transaction Management
- Full CRUD for Income, Expenses, and Transfers
- Fields: Title, Amount, Category, Date, Time, Payment Method, Wallet, Notes, Tags, Receipt Upload, Merchant Name, Location
- Search, filter, sort, pagination
- Duplicate entries, bulk deletion
- Recurring transactions (daily, weekly, monthly, quarterly, yearly)

### Category Management
- 16 default categories (Food, Travel, Fuel, Shopping, Medical, Education, Rent, Utilities, Internet, Entertainment, Insurance, Salary, Investment, Taxes, Groceries, Others)
- Custom categories with icons and colors
- Filter by type (Income/Expense/Both)

### Wallet Management
- Support for Cash, Bank Account, Credit Card, Debit Card, UPI, Other
- Money transfers between wallets with automatic balance updates
- Transaction history per wallet

### Budget Management
- Monthly, Weekly, Yearly, and Custom period budgets
- Category-wise and wallet-wise budgets
- Progress bars with 80% and 90% threshold alerts
- Color-coded usage indicators

### Bills Management
- Track recurring and one-time bills
- Due dates, payment status, reminders
- Mark as paid with wallet deduction
- Overdue and upcoming bill tracking

### Savings Goals
- Create goals (Vacation, Car, Emergency Fund, House, Education, Custom)
- Track progress with visual indicators
- Contribute amounts toward goals
- Deadline tracking

### Reports
- Daily, Weekly, Monthly, Yearly reports
- Category-wise, Wallet-wise breakdowns
- Income vs Expense comparison
- Cash Flow analysis
- Budget Summary
- CSV and Excel export

### Notifications
- In-app notification system
- Bill reminders
- Budget alerts
- Savings goal updates
- Recurring transaction notifications

### Admin Module
- User management (activate/deactivate)
- System statistics
- Category management
- System logs

### Settings
- Profile editing with photo upload
- Theme toggle (Light/Dark)
- Currency selection
- Date format preferences
- Notification preferences
- Database backup and restore
- Data import/export

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (v6 or higher, running locally on port 27017)
3. **npm** or **yarn**

## Getting Started

### 1. Start MongoDB

Make sure MongoDB is running locally:
```bash
# Windows
net start MongoDB

# macOS (if installed via Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 2. Setup Backend

```bash
cd backend
npm install
npm run seed    # Seeds 16 default categories
npm run dev     # Starts server on http://localhost:3000
```

### 3. Setup Web Application

```bash
cd web
npm install
npm start       # Starts Angular dev server on http://localhost:4200
```

### 4. Setup Mobile Application

```bash
cd mobile
npm install
npm start       # Starts Ionic dev server on http://localhost:4201
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/profile | Get profile |
| PUT | /api/auth/profile | Update profile |
| PUT | /api/auth/change-password | Change password |
| POST | /api/auth/forgot-password | Reset via security question |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/transactions | List (with filters, pagination) |
| POST | /api/transactions | Create transaction |
| GET | /api/transactions/:id | Get single |
| PUT | /api/transactions/:id | Update |
| DELETE | /api/transactions/:id | Delete |
| POST | /api/transactions/:id/duplicate | Duplicate |
| POST | /api/transactions/bulk-delete | Bulk delete |
| GET | /api/transactions/search | Search |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/categories | List categories |
| POST | /api/categories | Create category |
| PUT | /api/categories/:id | Update category |
| DELETE | /api/categories/:id | Delete category |

### Wallets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/wallets | List wallets |
| POST | /api/wallets | Create wallet |
| PUT | /api/wallets/:id | Update wallet |
| DELETE | /api/wallets/:id | Delete wallet |
| POST | /api/wallets/transfer | Transfer between wallets |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/budgets | List budgets |
| POST | /api/budgets | Create budget |
| PUT | /api/budgets/:id | Update budget |
| DELETE | /api/budgets/:id | Delete budget |

### Bills
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/bills | List bills |
| POST | /api/bills | Create bill |
| PUT | /api/bills/:id | Update bill |
| DELETE | /api/bills/:id | Delete bill |
| PUT | /api/bills/:id/pay | Mark as paid |

### Savings Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/savings-goals | List goals |
| POST | /api/savings-goals | Create goal |
| PUT | /api/savings-goals/:id | Update goal |
| DELETE | /api/savings-goals/:id | Delete goal |
| POST | /api/savings-goals/:id/contribute | Contribute amount |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/reports/dashboard | Dashboard stats |
| GET | /api/reports/daily | Daily report |
| GET | /api/reports/weekly | Weekly report |
| GET | /api/reports/monthly | Monthly report |
| GET | /api/reports/yearly | Yearly report |
| GET | /api/reports/category | Category report |
| GET | /api/reports/wallet | Wallet report |
| GET | /api/reports/income-vs-expense | Income vs Expense |
| GET | /api/reports/cash-flow | Cash flow report |
| GET | /api/reports/budget-summary | Budget summary |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | List notifications |
| PUT | /api/notifications/read/:id | Mark as read |
| PUT | /api/notifications/read-all | Mark all read |
| DELETE | /api/notifications/:id | Delete notification |

### Backup
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/backup/backup | Export user data as JSON |
| POST | /api/backup/restore | Import JSON data |
| GET | /api/backup/export/csv | Export transactions CSV |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/users | List all users |
| PUT | /api/admin/users/:id/status | Toggle user status |
| GET | /api/admin/stats | System statistics |

## Database Collections

| Collection | Description |
|------------|-------------|
| users | User accounts with preferences |
| categories | Income/Expense categories |
| transactions | All financial transactions |
| wallets | User wallets/accounts |
| budgets | Budget definitions |
| bills | Bill tracking |
| savingsgoals | Savings goal tracking |
| notifications | In-app notifications |
| settings | User application settings |

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt
- **Web**: Angular 17, Angular Material, Chart.js, ng2-charts
- **Mobile**: Ionic 7, Angular 17, Capacitor 5
- **Database**: MongoDB (local)

## License

MIT
