import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BudgetService } from '../../../../core/services/budget.service';
import { Budget } from '../../../../core/models/user.model';
import { BudgetFormComponent } from '../budget-form/budget-form.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-budget-list',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Budgets</h1>
        <button mat-raised-button color="primary" (click)="openForm()" class="btn-premium-raised">
          <mat-icon>add</mat-icon> Add Budget
        </button>
      </div>

      <div class="budget-grid">
        <mat-card *ngFor="let budget of budgets; let i = index"
          class="budget-card animate-fade-in-up"
          [class.stagger-1]="i === 0" [class.stagger-2]="i === 1"
          [class.stagger-3]="i === 2" [class.stagger-4]="i === 3"
          [class.stagger-5]="i === 4" [class.stagger-6]="i === 5"
          [class.stagger-7]="i === 6" [class.stagger-8]="i === 7">
          <div class="budget-header">
            <div>
              <h3>{{ budget.name }}</h3>
              <span class="budget-period">{{ budget.period | titlecase }}</span>
            </div>
            <div class="budget-actions">
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="openForm(budget)"><mat-icon>edit</mat-icon> Edit</button>
                <button mat-menu-item (click)="deleteBudget(budget)"><mat-icon color="warn">delete</mat-icon> Delete</button>
              </mat-menu>
            </div>
          </div>

          <div class="budget-amounts">
            <span class="spent">{{ budget.spent | currencyFormat }}</span>
            <span class="of">of</span>
            <span class="total">{{ budget.amount | currencyFormat }}</span>
          </div>

          <div class="progress-wrapper">
            <mat-progress-bar
              [color]="getProgressColor(budget)"
              [value]="getProgressValue(budget)">
            </mat-progress-bar>
          </div>

          <div class="budget-footer">
            <span class="pct-text" [class.text-danger]="getProgressValue(budget) >= 90"
              [class.text-warn]="getProgressValue(budget) >= 70 && getProgressValue(budget) < 90"
              [class.text-success]="getProgressValue(budget) < 70">
              {{ getProgressValue(budget) | number:'1.0-0' }}% spent
            </span>
            <span class="remaining">{{ (budget.amount - budget.spent) | currencyFormat }} remaining</span>
          </div>

          <div class="budget-category" *ngIf="budget.category">
            <mat-icon [style.color]="budget.category.color">{{ budget.category.icon }}</mat-icon>
            {{ budget.category.name }}
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      color: var(--text, #1A2138);
      letter-spacing: -0.5px;
    }

    .btn-premium-raised {
      border-radius: var(--radius, 10px) !important;
      font-weight: 600 !important;
      padding: 0 24px !important;
      height: 42px !important;
      box-shadow: var(--shadow-sm) !important;
      transition: box-shadow var(--transition-fast), transform var(--transition-fast) !important;
    }

    .btn-premium-raised:hover {
      box-shadow: var(--shadow-md) !important;
      transform: translateY(-2px) !important;
    }

    .budget-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
    }

    .budget-card {
      border-radius: var(--radius-lg, 14px) !important;
      padding: 24px !important;
      border: 1px solid var(--border, #E4E9F2) !important;
      box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06)) !important;
      opacity: 0;
      background: var(--surface, #fff) !important;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast) !important;
    }

    .budget-card:hover {
      transform: translateY(-3px) !important;
      box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08)) !important;
      border-color: var(--primary-light, #9FA8DA) !important;
    }

    .budget-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .budget-header h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text, #1A2138);
      letter-spacing: -0.2px;
      margin: 0 0 2px 0;
    }

    .budget-period {
      font-size: 11px;
      color: var(--text-tertiary, #8E99B3);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }

    .budget-amounts {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-bottom: 14px;
    }

    .budget-amounts .spent {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: var(--primary, #4F46E5);
    }

    .budget-amounts .of {
      color: var(--text-tertiary, #8E99B3);
      font-size: 14px;
      font-weight: 400;
    }

    .budget-amounts .total {
      color: var(--text-secondary, #6B7A99);
      font-size: 16px;
      font-weight: 600;
    }

    .progress-wrapper {
      margin-bottom: 4px;
    }

    .progress-wrapper ::ng-deep .mat-mdc-progress-bar {
      height: 6px !important;
      border-radius: var(--radius-full, 9999px) !important;
    }

    .progress-wrapper ::ng-deep .mdc-linear-progress__bar-inner {
      border-width: 0 !important;
    }

    .budget-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      font-size: 13px;
      color: var(--text-secondary, #6B7A99);
    }

    .budget-footer .pct-text {
      font-weight: 600;
      transition: color var(--transition-fast);
    }

    .budget-footer .remaining {
      font-weight: 500;
    }

    .budget-category {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 12px;
      font-size: 13px;
      color: var(--text-secondary, #6B7A99);
      padding-top: 12px;
      border-top: 1px solid var(--border-light, #EFF1F6);
    }
  `]
})
export class BudgetListComponent implements OnInit {
  budgets: Budget[] = [];

  constructor(
    private budgetService: BudgetService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.loadBudgets(); }

  loadBudgets(): void {
    this.budgetService.getBudgets().subscribe({
      next: (res) => { if (res.success && res.data) this.budgets = res.data; }
    });
  }

  getProgressValue(budget: Budget): number {
    return Math.min((budget.spent / budget.amount) * 100, 100);
  }

  getProgressColor(budget: Budget): string {
    const pct = this.getProgressValue(budget);
    if (pct >= (budget.alertThresholds?.danger || 90)) return 'warn';
    if (pct >= (budget.alertThresholds?.warn || 70)) return 'accent';
    return 'primary';
  }

  openForm(budget?: Budget): void {
    const dialogRef = this.dialog.open(BudgetFormComponent, { width: '500px', data: budget || null });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadBudgets(); });
  }

  deleteBudget(budget: Budget): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { title: 'Delete Budget', message: `Delete "${budget.name}"?`, confirmText: 'Delete', confirmColor: 'warn' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.budgetService.deleteBudget(budget._id).subscribe({
          next: () => { this.snackBar.open('Budget deleted', 'Close', { duration: 3000 }); this.loadBudgets(); }
        });
      }
    });
  }
}
