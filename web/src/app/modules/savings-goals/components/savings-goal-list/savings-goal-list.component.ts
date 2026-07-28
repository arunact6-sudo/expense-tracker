import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SavingsGoalService } from '../../../../core/services/savings-goal.service';
import { SavingsGoal } from '../../../../core/models/user.model';
import { SavingsGoalFormComponent } from '../savings-goal-form/savings-goal-form.component';
import { SavingsGoalDetailComponent } from '../savings-goal-detail/savings-goal-detail.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-savings-goal-list',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Savings Goals</h1>
        <button mat-raised-button color="primary" (click)="openForm()" class="premium-btn">
          <mat-icon>add</mat-icon> Add Goal
        </button>
      </div>

      <div class="goals-grid">
        <mat-card *ngFor="let goal of goals; let i = index"
          class="goal-card animate-fade-in-up"
          [class.stagger-1]="i === 0" [class.stagger-2]="i === 1"
          [class.stagger-3]="i === 2" [class.stagger-4]="i === 3"
          [class.stagger-5]="i === 4" [class.stagger-6]="i === 5"
          [class.stagger-7]="i === 6" [class.stagger-8]="i === 7"
          [class.completed]="goal.isCompleted">
          <div class="goal-color" [style.background]="goal.color || '#3f51b5'"></div>
          <div class="goal-header">
            <div class="goal-icon" [style.background]="(goal.color || '#3f51b5') + '22'">
              <mat-icon [style.color]="goal.color || '#3f51b5'">{{ goal.icon || 'flag' }}</mat-icon>
            </div>
            <button mat-icon-button [matMenuTriggerFor]="menu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="openForm(goal)"><mat-icon>edit</mat-icon> Edit</button>
              <button mat-menu-item (click)="deleteGoal(goal)"><mat-icon color="warn">delete</mat-icon> Delete</button>
            </mat-menu>
          </div>

          <h3 class="goal-name">{{ goal.name }}</h3>

          <div class="goal-amounts">
            <span class="current">{{ goal.currentAmount | currencyFormat }}</span>
            <span class="target">of {{ goal.targetAmount | currencyFormat }}</span>
          </div>

          <div class="progress-wrapper">
            <mat-progress-bar [color]="goal.isCompleted ? 'primary' : 'accent'" [value]="getProgress(goal)"></mat-progress-bar>
          </div>

          <div class="goal-footer">
            <span>{{ getProgress(goal) | number:'1.0-0' }}% complete</span>
            <span *ngIf="goal.deadline">Due {{ goal.deadline | date:'mediumDate' }}</span>
          </div>

          <div class="goal-actions">
            <button mat-stroked-button color="primary" *ngIf="!goal.isCompleted" (click)="openDetail(goal)" class="contribute-btn">
              <mat-icon>savings</mat-icon> Contribute
            </button>
            <span *ngIf="goal.isCompleted" class="completed-badge animate-bounce-in">
              <mat-icon>check_circle</mat-icon> Completed
            </span>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .goals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .goal-card {
      border-radius: var(--radius-lg, 14px);
      padding: 0;
      overflow: hidden;
      opacity: 0;
      transition: transform var(--transition-spring, 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)),
                  box-shadow var(--transition, 0.25s),
                  border-color var(--transition, 0.25s);
    }

    .goal-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg, 0 12px 40px rgba(26,33,56,0.12));
      border-color: var(--primary-light, #9FA8DA);
    }

    .goal-card.completed { opacity: 0.8; }

    .goal-color {
      height: 4px;
      background-size: 200% 100%;
      animation: gradientShift 3s ease infinite;
    }

    .goal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 16px 0;
    }

    .goal-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform var(--transition-spring, 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275));
    }

    .goal-card:hover .goal-icon {
      transform: scale(1.08);
    }

    .goal-name {
      padding: 8px 16px;
      font-size: 16px;
      font-weight: 600;
      color: var(--text, #1A2138);
      letter-spacing: -0.2px;
    }

    .goal-amounts {
      padding: 0 16px 14px;
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .goal-amounts .current {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: var(--primary-gradient, linear-gradient(135deg, #5C6BC0, #7E57C2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .goal-amounts .target {
      color: var(--text-secondary, #6B7A99);
      font-size: 14px;
      font-weight: 500;
    }

    .progress-wrapper {
      padding: 0 16px 4px;
    }

    .progress-wrapper ::ng-deep .mat-mdc-progress-bar {
      height: 6px !important;
      border-radius: var(--radius-full, 9999px) !important;
    }

    .progress-wrapper ::ng-deep .mdc-linear-progress__bar-inner {
      border-width: 0 !important;
    }

    .goal-footer {
      display: flex;
      justify-content: space-between;
      padding: 8px 16px;
      font-size: 12px;
      color: var(--text-secondary, #6B7A99);
      font-weight: 500;
    }

    .goal-actions {
      padding: 8px 16px 16px;
    }

    .contribute-btn {
      border-radius: var(--radius, 10px) !important;
      font-weight: 600 !important;
      display: inline-flex !important;
      align-items: center;
      gap: 6px;
      transition: background var(--transition, 0.25s), transform var(--transition-fast, 0.15s) !important;
    }

    .contribute-btn:hover {
      background: rgba(92, 107, 192, 0.06) !important;
    }

    .completed-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--success, #43A047);
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }

    .completed-badge mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class SavingsGoalListComponent implements OnInit {
  goals: SavingsGoal[] = [];

  constructor(
    private savingsGoalService: SavingsGoalService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.loadGoals(); }

  loadGoals(): void {
    this.savingsGoalService.getSavingsGoals().subscribe({
      next: (res) => { if (res.success && res.data) this.goals = res.data; }
    });
  }

  getProgress(goal: SavingsGoal): number {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  }

  openForm(goal?: SavingsGoal): void {
    const dialogRef = this.dialog.open(SavingsGoalFormComponent, { width: '450px', data: goal || null });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadGoals(); });
  }

  openDetail(goal: SavingsGoal): void {
    const dialogRef = this.dialog.open(SavingsGoalDetailComponent, { width: '450px', data: goal });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadGoals(); });
  }

  deleteGoal(goal: SavingsGoal): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { title: 'Delete Goal', message: `Delete "${goal.name}"?`, confirmText: 'Delete', confirmColor: 'warn' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.savingsGoalService.deleteSavingsGoal(goal._id).subscribe({
          next: () => { this.snackBar.open('Goal deleted', 'Close', { duration: 3000 }); this.loadGoals(); }
        });
      }
    });
  }
}
