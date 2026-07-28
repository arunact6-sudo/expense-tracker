import { Component } from '@angular/core';

@Component({
  selector: 'app-report-dashboard',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Reports</h1>
      </div>

      <mat-tab-group animationDuration="300ms" class="report-tabs animate-fade-in-up stagger-1">
        <mat-tab label="Daily">
          <app-daily-report></app-daily-report>
        </mat-tab>
        <mat-tab label="Monthly">
          <app-monthly-report></app-monthly-report>
        </mat-tab>
        <mat-tab label="By Category">
          <app-category-report></app-category-report>
        </mat-tab>
        <mat-tab label="Income vs Expense">
          <app-income-vs-expense></app-income-vs-expense>
        </mat-tab>
        <mat-tab label="Cash Flow">
          <app-cash-flow></app-cash-flow>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .report-tabs {
      margin-top: 16px;
      border-radius: var(--radius-lg);
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 4px;
    }
    :host ::ng-deep .mat-mdc-tab-body-wrapper {
      padding: 20px 0;
    }
    :host ::ng-deep .mat-mdc-tab-group {
      border-radius: var(--radius-lg) !important;
    }
    :host ::ng-deep .mat-mdc-tab {
      font-weight: 600 !important;
      font-size: 14px !important;
      letter-spacing: 0.2px;
      transition: color var(--transition) !important;
    }
    :host ::ng-deep .mat-mdc-tab.mdc-tab--active {
      color: var(--primary) !important;
    }
    :host ::ng-deep .mdc-tab-indicator__content--underline {
      border-color: var(--primary) !important;
      border-width: 3px !important;
    }
  `]
})
export class ReportDashboardComponent {}
