import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ReportService } from '../../../../core/services/report.service';
import { TransactionService } from '../../../../core/services/transaction.service';
import { BudgetService } from '../../../../core/services/budget.service';
import { SettingsService } from '../../../../core/services/settings.service';
import { DashboardStats, Transaction, Budget } from '../../../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="page-container">
      <div class="page-header animate-fade-in-up">
        <div>
          <h1>Welcome back, {{ userName }}</h1>
          <p class="subtitle">Here's your financial overview for today.</p>
        </div>
      </div>

      <div class="stats-grid" *ngIf="stats">
        <div class="stat-card animate-fade-in-up stagger-1">
          <div class="stat-icon-wrap balance-icon">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <div class="stat-content">
            <span class="label">Total Balance</span>
            <span class="value">{{ animatedBalance | currencyFormat }}</span>
          </div>
        </div>
        <div class="stat-card animate-fade-in-up stagger-2">
          <div class="stat-icon-wrap income-icon">
            <mat-icon>trending_up</mat-icon>
          </div>
          <div class="stat-content">
            <span class="label">Total Income</span>
            <span class="value text-success">{{ animatedIncome | currencyFormat }}</span>
          </div>
        </div>
        <div class="stat-card animate-fade-in-up stagger-3">
          <div class="stat-icon-wrap expense-icon">
            <mat-icon>trending_down</mat-icon>
          </div>
          <div class="stat-content">
            <span class="label">Total Expenses</span>
            <span class="value text-danger">{{ animatedExpenses | currencyFormat }}</span>
          </div>
        </div>
        <div class="stat-card animate-fade-in-up stagger-4">
          <div class="stat-icon-wrap savings-icon">
            <mat-icon>savings</mat-icon>
          </div>
          <div class="stat-content">
            <span class="label">Monthly Savings</span>
            <span class="value text-info">{{ animatedSavings | currencyFormat }}</span>
          </div>
        </div>
        <div class="stat-card animate-fade-in-up stagger-5">
          <div class="stat-icon-wrap budget-icon">
            <mat-icon>pie_chart</mat-icon>
          </div>
          <div class="stat-content">
            <span class="label">Budget Remaining</span>
            <span class="value text-warn">{{ animatedBudget | currencyFormat }}</span>
          </div>
        </div>
      </div>

      <div class="charts-row">
        <mat-card class="chart-card animate-fade-in-up stagger-3">
          <div class="card-header-row">
            <h3 class="section-title">Monthly Overview</h3>
          </div>
          <div class="chart-body">
            <canvas baseChart
              *ngIf="monthlyChartData"
              [data]="monthlyChartData"
              [type]="'bar'"
              [options]="barChartOptions">
            </canvas>
          </div>
        </mat-card>

        <mat-card class="chart-card animate-fade-in-up stagger-4">
          <div class="card-header-row">
            <h3 class="section-title">Expenses by Category</h3>
          </div>
          <div class="chart-body">
            <canvas baseChart
              *ngIf="categoryChartData"
              [data]="categoryChartData"
              [type]="'doughnut'"
              [options]="doughnutChartOptions">
            </canvas>
          </div>
        </mat-card>
      </div>

      <div class="full-width-row animate-fade-in-up stagger-5">
        <mat-card class="chart-card-full">
          <div class="card-header-row">
            <h3 class="section-title">Income vs Expense</h3>
          </div>
          <div class="chart-body chart-body-wide">
            <canvas baseChart
              *ngIf="incomeVsExpenseChartData"
              [data]="incomeVsExpenseChartData"
              [type]="'line'"
              [options]="lineChartOptions">
            </canvas>
          </div>
        </mat-card>
      </div>

      <div class="content-row">
        <mat-card class="content-card animate-fade-in-up stagger-5">
          <div class="card-header-row">
            <h3 class="section-title">Recent Transactions</h3>
            <a routerLink="/transactions" class="view-all-link">View all</a>
          </div>
          <div class="card-body">
            <div *ngFor="let t of recentTransactions; let i = index"
              class="tx-row animate-fade-in-up" [style.animation-delay]="(i * 0.05 + 0.2) + 's'">
              <div class="tx-left">
                <div class="tx-icon-wrap" [ngClass]="t.type === 'income' ? 'tx-icon-income' : 'tx-icon-expense'">
                  <mat-icon>{{ t.type === 'income' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                </div>
                <div class="tx-info">
                  <span class="tx-title">{{ t.title }}</span>
                  <span class="tx-date">{{ t.date | date:'mediumDate' }}</span>
                </div>
              </div>
              <span class="tx-amount" [class]="t.type === 'income' ? 'text-success' : 'text-danger'">
                {{ t.type === 'income' ? '+' : '-' }}{{ t.amount | currencyFormat }}
              </span>
            </div>
            <div class="empty-state" *ngIf="recentTransactions?.length === 0">
              <mat-icon>receipt_long</mat-icon>
              <p>No recent transactions</p>
            </div>
          </div>
        </mat-card>

        <mat-card class="content-card animate-fade-in-up stagger-6">
          <div class="card-header-row">
            <h3 class="section-title">Budget Progress</h3>
            <a routerLink="/budgets" class="view-all-link">View all</a>
          </div>
          <div class="card-body">
            <div *ngFor="let b of budgets; let i = index"
              class="budget-row animate-fade-in-up" [style.animation-delay]="(i * 0.08 + 0.2) + 's'">
              <div class="budget-header">
                <span class="budget-name">{{ b.name }}</span>
                <span class="budget-pct">{{ ((b.spent / b.amount) * 100) | number:'1.0-0' }}%</span>
              </div>
              <div class="budget-track">
                <mat-progress-bar
                  [color]="getBudgetColor(b)"
                  [value]="(b.spent / b.amount) * 100"
                  class="budget-bar">
                </mat-progress-bar>
              </div>
              <div class="budget-footer">
                <span class="budget-spent">{{ b.spent | currencyFormat }} spent</span>
                <span class="budget-total">of {{ b.amount | currencyFormat }}</span>
              </div>
            </div>
            <div class="empty-state" *ngIf="budgets?.length === 0">
              <mat-icon>savings</mat-icon>
              <p>No active budgets</p>
            </div>
          </div>
        </mat-card>
      </div>

      <mat-card class="content-card animate-fade-in-up stagger-7" *ngIf="stats?.topSpendingCategories?.length">
        <div class="card-header-row">
          <h3 class="section-title">Top Spending Categories</h3>
        </div>
        <div class="card-body">
          <div class="categories-grid">
            <div *ngFor="let cat of stats!.topSpendingCategories; let i = index"
              class="cat-row animate-fade-in-up" [style.animation-delay]="(i * 0.06 + 0.2) + 's'">
              <div class="cat-info">
                <span class="cat-name">{{ cat.name }}</span>
                <span class="cat-amount">{{ cat.amount | currencyFormat }}</span>
              </div>
              <div class="cat-track">
                <mat-progress-bar color="primary" [value]="cat.percentage" class="cat-bar"></mat-progress-bar>
              </div>
            </div>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .subtitle {
      color: var(--text-secondary);
      font-size: 14px;
      margin-top: 4px;
      font-weight: 400;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      padding: 20px;
      border-radius: var(--radius-lg);
      background: var(--surface);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 14px;
      transition: all 0.3s var(--ease-out);
      opacity: 0;
    }

    .stat-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
    }

    .stat-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon-wrap mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: white;
    }

    .balance-icon { background: var(--primary); box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2); }
    .income-icon { background: var(--success); box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2); }
    .expense-icon { background: var(--warn); box-shadow: 0 4px 10px rgba(239, 68, 68, 0.2); }
    .savings-icon { background: var(--info); box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2); }
    .budget-icon { background: var(--warning); box-shadow: 0 4px 10px rgba(245, 158, 11, 0.2); }

    .stat-content { display: flex; flex-direction: column; min-width: 0; }
    .stat-content .label {
      font-size: 11px;
      color: var(--text-secondary);
      margin-bottom: 4px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .stat-content .value {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.03em;
      white-space: nowrap;
    }

    /* Charts */
    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .chart-card, .chart-card-full {
      border-radius: var(--radius-lg);
      overflow: hidden;
      opacity: 0;
    }

    .chart-body {
      padding: 0 20px 20px;
      height: 280px;
    }

    .chart-body-wide {
      height: 300px;
    }

    .full-width-row {
      margin-bottom: 20px;
      opacity: 0;
    }

    /* Card headers */
    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 20px 12px;
    }

    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text);
    }

    .view-all-link {
      font-size: 13px;
      font-weight: 500;
      color: var(--primary);
      text-decoration: none;
    }

    .view-all-link:hover {
      color: var(--primary-dark);
    }

    /* Content row */
    .content-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .content-card {
      border-radius: var(--radius-lg);
      overflow: hidden;
      opacity: 0;
    }

    .card-body {
      padding: 0 20px 20px;
    }

    /* Transaction rows */
    .tx-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      transition: background 0.2s ease;
      cursor: pointer;
      opacity: 0;
    }

    .tx-row:hover {
      background: var(--bg-secondary);
    }

    .tx-left {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .tx-icon-wrap {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .tx-icon-wrap mat-icon {
      font-size: 17px;
      width: 17px;
      height: 17px;
      color: white;
    }

    .tx-icon-income { background: var(--success); }
    .tx-icon-expense { background: var(--warn); }

    .tx-info { display: flex; flex-direction: column; min-width: 0; }
    .tx-title { font-size: 14px; font-weight: 500; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tx-date { font-size: 12px; color: var(--text-secondary); }
    .tx-amount { font-size: 14px; font-weight: 600; white-space: nowrap; }

    /* Budget rows */
    .budget-row {
      margin-bottom: 18px;
      opacity: 0;
    }

    .budget-row:last-child { margin-bottom: 0; }

    .budget-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .budget-name { font-size: 14px; font-weight: 500; color: var(--text); }
    .budget-pct { font-size: 13px; font-weight: 600; color: var(--text-secondary); }

    .budget-track, .cat-track {
      border-radius: var(--radius-full);
      overflow: hidden;
      margin-bottom: 4px;
    }

    .budget-bar, .cat-bar {
      border-radius: var(--radius-full) !important;
      height: 5px !important;
    }

    .budget-footer {
      display: flex;
      gap: 4px;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .budget-spent { font-weight: 500; }

    /* Categories */
    .categories-grid { display: grid; gap: 16px; }

    .cat-row { opacity: 0; }

    .cat-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .cat-name { font-size: 14px; font-weight: 500; color: var(--text); }
    .cat-amount { font-size: 13px; font-weight: 600; color: var(--text-secondary); }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 36px 16px;
      color: var(--text-secondary);
    }

    .empty-state mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      opacity: 0.35;
      margin-bottom: 8px;
      display: block;
      margin-left: auto;
      margin-right: auto;
    }

    .empty-state p {
      font-size: 14px;
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .stats-grid { grid-template-columns: repeat(3, 1fr); }
    }

    @media (max-width: 768px) {
      .charts-row, .content-row { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 480px) {
      .stats-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats | null = null;
  recentTransactions: Transaction[] = [];
  budgets: Budget[] = [];
  userName = '';

  animatedBalance = 0;
  animatedIncome = 0;
  animatedExpenses = 0;
  animatedSavings = 0;
  animatedBudget = 0;

  monthlyChartData: ChartData<'bar'> | null = null;
  categoryChartData: ChartData<'doughnut'> | null = null;
  incomeVsExpenseChartData: ChartData<'line'> | null = null;

  private animationFrame: any;

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } },
      x: { grid: { display: false } }
    }
  };

  doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    // cutout: '65%',
    plugins: { legend: { position: 'right', labels: { padding: 14, usePointStyle: true, font: { size: 12 } } } }
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 14, font: { size: 12 } } } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } },
      x: { grid: { display: false } }
    },
    elements: { line: { tension: 0.4, borderWidth: 2 }, point: { radius: 3, hoverRadius: 5 } }
  };

  constructor(
    private reportService: ReportService,
    private transactionService: TransactionService,
    private budgetService: BudgetService,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
  }

  loadDashboard(): void {
    this.reportService.getDashboardStats().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.stats = res.data;
          this.recentTransactions = res.data.recentTransactions || [];
          this.userName = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).name : 'User';
          this.buildCharts();
          this.animateCounters();
        }
      }
    });

    this.budgetService.getBudgets().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.budgets = res.data;
        }
      }
    });
  }

  animateCounters(): void {
    if (!this.stats) return;
    const targets = {
      balance: this.stats.totalBalance || 0,
      income: this.stats.totalIncome || 0,
      expenses: this.stats.totalExpenses || 0,
      savings: this.stats.monthlySavings || 0,
      budget: this.stats.budgetRemaining || 0
    };
    const duration = 1000;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      this.animatedBalance = targets.balance * ease;
      this.animatedIncome = targets.income * ease;
      this.animatedExpenses = targets.expenses * ease;
      this.animatedSavings = targets.savings * ease;
      this.animatedBudget = targets.budget * ease;

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };
    this.animationFrame = requestAnimationFrame(animate);
  }

  buildCharts(): void {
    if (this.stats?.monthlyOverview) {
      const labels = this.stats.monthlyOverview.map((m: any) => m.month || m.label);
      const income = this.stats.monthlyOverview.map((m: any) => m.income || 0);
      const expenses = this.stats.monthlyOverview.map((m: any) => m.expenses || 0);
      this.monthlyChartData = {
        labels,
        datasets: [
          { data: income, label: 'Income', backgroundColor: 'rgba(16, 185, 129, 0.75)', borderRadius: 6, borderSkipped: false },
          { data: expenses, label: 'Expenses', backgroundColor: 'rgba(239, 68, 68, 0.75)', borderRadius: 6, borderSkipped: false }
        ]
      };
    }

    if (this.stats?.categoryBreakdown) {
      const labels = this.stats.categoryBreakdown.map((c: any) => c.name);
      const data = this.stats.categoryBreakdown.map((c: any) => c.amount);
      const colors = ['#4F46E5', '#7C3AED', '#A855F7', '#EC4899', '#F97316', '#EAB308', '#10B981', '#3B82F6'];
      this.categoryChartData = {
        labels,
        datasets: [{ data, backgroundColor: colors.slice(0, data.length), borderWidth: 0 }]
      };
    }

    if (this.stats?.incomeVsExpense) {
      const labels = this.stats.incomeVsExpense.map((m: any) => m.month || m.label);
      const income = this.stats.incomeVsExpense.map((m: any) => m.income || 0);
      const expenses = this.stats.incomeVsExpense.map((m: any) => m.expenses || 0);
      this.incomeVsExpenseChartData = {
        labels,
        datasets: [
          { data: income, label: 'Income', borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.06)', fill: true, tension: 0.4 },
          { data: expenses, label: 'Expenses', borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.06)', fill: true, tension: 0.4 }
        ]
      };
    }
  }

  getBudgetColor(budget: Budget): string {
    const pct = (budget.spent / budget.amount) * 100;
    if (pct >= (budget.alertThresholds?.danger || 90)) return 'warn';
    if (pct >= (budget.alertThresholds?.warn || 70)) return 'accent';
    return 'primary';
  }
}
