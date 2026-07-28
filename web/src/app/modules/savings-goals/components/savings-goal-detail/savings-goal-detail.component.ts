import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SavingsGoalService } from '../../../../core/services/savings-goal.service';
import { SavingsGoal } from '../../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-savings-goal-detail',
  template: `
    <h2 mat-dialog-title class="premium-dialog-title">
      <mat-icon class="dialog-title-icon" [style.color]="data.color || '#3f51b5'">{{ data.icon || 'flag' }}</mat-icon>
      {{ data.name }}
    </h2>
    <mat-dialog-content>
      <div class="goal-visual animate-scale-in">
        <div class="progress-circle" [style.border-color]="data.color || '#3f51b5'">
          <span class="progress-text" [style.color]="data.color || '#3f51b5'">{{ getProgress() | number:'1.0-0' }}%</span>
        </div>
      </div>

      <div class="goal-stats animate-fade-in-up stagger-2">
        <div class="stat">
          <span class="label">Current</span>
          <span class="value text-info">{{ data.currentAmount | currencyFormat }}</span>
        </div>
        <div class="stat">
          <span class="label">Target</span>
          <span class="value">{{ data.targetAmount | currencyFormat }}</span>
        </div>
        <div class="stat">
          <span class="label">Remaining</span>
          <span class="value text-warn">{{ (data.targetAmount - data.currentAmount) | currencyFormat }}</span>
        </div>
      </div>

      <div *ngIf="!data.isCompleted" class="contribute-section animate-fade-in-up stagger-4">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Contribute Amount</mat-label>
          <input matInput type="number" [formControl]="contributeControl" placeholder="Enter amount">
        </mat-form-field>
      </div>

      <div class="goal-info animate-fade-in-up stagger-5">
        <div *ngIf="data.deadline"><strong>Deadline:</strong> {{ data.deadline | date:'fullDate' }}</div>
        <div *ngIf="data.category"><strong>Category:</strong> {{ data.category }}</div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="animate-fade-in-up stagger-6">
      <button mat-button mat-dialog-close class="cancel-btn">Close</button>
      <button mat-raised-button color="primary" *ngIf="!data.isCompleted"
        [disabled]="contributeControl.invalid || loading" (click)="contribute()" class="premium-btn submit-btn">
        <mat-icon>savings</mat-icon>
        Contribute
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .w-full { width: 100%; }

    .premium-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.3px;
      color: var(--text, #1A2138);
    }

    .dialog-title-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .goal-visual {
      text-align: center;
      margin: 20px 0;
    }

    .progress-circle {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      border: 8px solid var(--primary, #3f51b5);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: border-color var(--transition, 0.25s);
    }

    .progress-circle::after {
      content: '';
      position: absolute;
      inset: -12px;
      border-radius: 50%;
      border: 2px solid var(--border, #E4E9F2);
    }

    .progress-text {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .goal-stats {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
      opacity: 0;
    }

    .stat {
      text-align: center;
      padding: 14px 8px;
      background: var(--bg, #F5F7FA);
      border-radius: var(--radius, 10px);
      transition: background var(--transition, 0.25s);
    }

    .stat .label {
      display: block;
      font-size: 12px;
      color: var(--text-secondary, #6B7A99);
      margin-bottom: 6px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat .value {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.3px;
    }

    .contribute-section { margin-bottom: 16px; }

    .goal-info {
      font-size: 14px;
      color: var(--text-secondary, #6B7A99);
      opacity: 0;
    }

    .goal-info div {
      margin-bottom: 6px;
      padding: 8px 12px;
      background: var(--bg, #F5F7FA);
      border-radius: var(--radius, 10px);
      font-weight: 500;
    }

    .goal-info strong {
      color: var(--text, #1A2138);
    }

    .cancel-btn {
      border-radius: var(--radius, 10px) !important;
      font-weight: 500 !important;
    }

    .submit-btn {
      border-radius: var(--radius, 10px) !important;
      font-weight: 600 !important;
      display: inline-flex !important;
      align-items: center;
      gap: 6px;
    }

    .submit-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class SavingsGoalDetailComponent {
  contributeControl = new FormBuilder().control(0, [Validators.required, Validators.min(0.01)]);
  loading = false;

  constructor(
    private savingsGoalService: SavingsGoalService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<SavingsGoalDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SavingsGoal
  ) {}

  getProgress(): number {
    return Math.min((this.data.currentAmount / this.data.targetAmount) * 100, 100);
  }

  contribute(): void {
    if (this.contributeControl.invalid) return;
    this.loading = true;
    this.savingsGoalService.contributeToGoal(this.data._id, this.contributeControl.value!).subscribe({
      next: () => {
        this.snackBar.open('Contribution added!', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => { this.loading = false; this.snackBar.open(err.error?.message || 'Error', 'Close', { duration: 5000 }); }
    });
  }
}
