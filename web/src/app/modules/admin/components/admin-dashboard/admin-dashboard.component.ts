import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div class="admin-nav animate-fade-in-up stagger-1">
        <button mat-stroked-button routerLink="/admin" routerLinkActive="active-nav">Dashboard</button>
        <button mat-stroked-button routerLink="/admin/users" routerLinkActive="active-nav">Users</button>
        <button mat-stroked-button routerLink="/admin/categories" routerLinkActive="active-nav">Categories</button>
      </div>

      <div class="stats-grid" *ngIf="stats">
        <mat-card class="admin-stat-card animate-fade-in-up stagger-1">
          <div class="stat-icon-wrapper users">
            <mat-icon>people</mat-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-label">Total Users</div>
          </div>
        </mat-card>
        <mat-card class="admin-stat-card animate-fade-in-up stagger-2">
          <div class="stat-icon-wrapper transactions">
            <mat-icon>receipt_long</mat-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalTransactions }}</div>
            <div class="stat-label">Transactions</div>
          </div>
        </mat-card>
        <mat-card class="admin-stat-card animate-fade-in-up stagger-3">
          <div class="stat-icon-wrapper categories">
            <mat-icon>category</mat-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalCategories }}</div>
            <div class="stat-label">Categories</div>
          </div>
        </mat-card>
        <mat-card class="admin-stat-card animate-fade-in-up stagger-4">
          <div class="stat-icon-wrapper active">
            <mat-icon>trending_up</mat-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.activeUsers }}</div>
            <div class="stat-label">Active Users</div>
          </div>
        </mat-card>
        <mat-card class="admin-stat-card animate-fade-in-up stagger-5">
          <div class="stat-icon-wrapper wallets">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalWallets }}</div>
            <div class="stat-label">Wallets</div>
          </div>
        </mat-card>
        <mat-card class="admin-stat-card animate-fade-in-up stagger-6">
          <div class="stat-icon-wrapper budgets">
            <mat-icon>savings</mat-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalBudgets }}</div>
            <div class="stat-label">Budgets</div>
          </div>
        </mat-card>
      </div>

      <div *ngIf="!stats" class="loading-container">
        <mat-spinner diameter="48"></mat-spinner>
      </div>
    </div>
  `,
  styles: [`
    .admin-nav {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
    }
    .admin-nav button {
      border-radius: var(--radius) !important;
      font-weight: 500 !important;
      transition: transform var(--transition-spring), box-shadow var(--transition), background var(--transition) !important;
    }
    .admin-nav button:hover {
      transform: translateY(-2px) !important;
      box-shadow: var(--shadow-sm) !important;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 18px;
    }
    .admin-stat-card {
      padding: 24px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      gap: 18px;
      transition: transform var(--transition-spring), box-shadow var(--transition), border-color var(--transition) !important;
      position: relative;
      overflow: hidden;
    }
    .admin-stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: var(--primary-gradient);
      border-radius: 4px 0 0 4px;
      transition: width var(--transition);
    }
    .admin-stat-card:hover {
      transform: translateY(-4px) scale(1.02) !important;
      box-shadow: var(--shadow-lg) !important;
      border-color: var(--primary-light) !important;
    }
    .admin-stat-card:hover::before {
      width: 5px;
    }
    .stat-icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform var(--transition-spring);
    }
    .admin-stat-card:hover .stat-icon-wrapper {
      transform: scale(1.1) rotate(-5deg);
    }
    .stat-icon-wrapper mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .stat-icon-wrapper.users {
      background: linear-gradient(135deg, rgba(63,81,181,0.12), rgba(63,81,181,0.04));
      color: #3f51b5;
    }
    .stat-icon-wrapper.transactions {
      background: linear-gradient(135deg, rgba(76,175,80,0.12), rgba(76,175,80,0.04));
      color: #4caf50;
    }
    .stat-icon-wrapper.categories {
      background: linear-gradient(135deg, rgba(255,152,0,0.12), rgba(255,152,0,0.04));
      color: #ff9800;
    }
    .stat-icon-wrapper.active {
      background: linear-gradient(135deg, rgba(0,188,212,0.12), rgba(0,188,212,0.04));
      color: #00bcd4;
    }
    .stat-icon-wrapper.wallets {
      background: linear-gradient(135deg, rgba(156,39,176,0.12), rgba(156,39,176,0.04));
      color: #9c27b0;
    }
    .stat-icon-wrapper.budgets {
      background: linear-gradient(135deg, rgba(244,67,54,0.12), rgba(244,67,54,0.04));
      color: #f44336;
    }
    .stat-info {
      display: flex;
      flex-direction: column;
    }
    .stat-value {
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.5px;
      line-height: 1.1;
    }
    .stat-label {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 4px;
      font-weight: 500;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: any = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getSystemStats().subscribe({
      next: (res) => { if (res.success && res.data) this.stats = res.data; }
    });
  }
}
