import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SavingsGoalService } from '../../../../core/services/savings-goal.service';
import { SavingsGoal } from '../../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

const ICONS = ['flag', 'home', 'car', 'flight', 'school', 'laptop', 'phone', 'watch', 'diamond', 'fitness_center', 'pets', 'beach_access'];
const COLORS = ['#3f51b5', '#4caf50', '#f44336', '#ff9800', '#9c27b0', '#00bcd4', '#e91e63', '#795548'];

@Component({
  selector: 'app-savings-goal-form',
  template: `
    <h2 mat-dialog-title class="premium-dialog-title">
      <mat-icon class="dialog-title-icon">{{ data ? 'edit' : 'add_circle' }}</mat-icon>
      {{ data ? 'Edit Goal' : 'New Savings Goal' }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-1">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="e.g. Vacation Fund">
          <mat-error>Name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-2">
          <mat-label>Target Amount</mat-label>
          <input matInput type="number" formControlName="targetAmount">
          <mat-error>Target amount is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-3" *ngIf="!data">
          <mat-label>Current Amount</mat-label>
          <input matInput type="number" formControlName="currentAmount">
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-4">
          <mat-label>Category</mat-label>
          <input matInput formControlName="category" placeholder="e.g. Travel">
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-5">
          <mat-label>Deadline</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="deadline">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <label class="form-label animate-fade-in-up stagger-6">Icon</label>
        <div class="icon-grid animate-fade-in-up stagger-6">
          <button *ngFor="let icon of icons" type="button" class="icon-btn"
            [class.selected]="form.get('icon')?.value === icon" (click)="form.get('icon')?.setValue(icon)">
            <mat-icon>{{ icon }}</mat-icon>
          </button>
        </div>

        <label class="form-label animate-fade-in-up stagger-7">Color</label>
        <div class="color-grid animate-fade-in-up stagger-7">
          <button *ngFor="let c of colors" type="button" class="color-btn" [style.background]="c"
            [class.selected]="form.get('color')?.value === c" (click)="form.get('color')?.setValue(c)"></button>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="animate-fade-in-up stagger-8">
      <button mat-button mat-dialog-close class="cancel-btn">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid || loading" (click)="onSubmit()" class="premium-btn submit-btn">
        <mat-icon>{{ data ? 'save' : 'add' }}</mat-icon>
        {{ data ? 'Update' : 'Create' }}
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
      background: var(--primary-gradient, linear-gradient(135deg, #5C6BC0, #7E57C2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .dialog-title-icon {
      -webkit-text-fill-color: var(--primary, #5C6BC0);
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .form-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary, #6B7A99);
      margin-bottom: 8px;
      display: block;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0;
    }

    .icon-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 6px;
      margin-bottom: 20px;
      opacity: 0;
    }

    .icon-btn {
      width: 38px;
      height: 38px;
      border: 2px solid var(--border, #E4E9F2);
      border-radius: 10px;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color var(--transition, 0.25s),
                  background var(--transition, 0.25s),
                  transform var(--transition-spring, 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275));
    }

    .icon-btn:hover {
      border-color: var(--primary-light, #9FA8DA);
      background: rgba(92, 107, 192, 0.06);
      transform: scale(1.08);
    }

    .icon-btn.selected {
      border-color: var(--primary, #3f51b5);
      background: rgba(63, 81, 181, 0.12);
      transform: scale(1.05);
    }

    .color-grid {
      display: flex;
      gap: 10px;
      margin-bottom: 16px;
      opacity: 0;
    }

    .color-btn {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 3px solid transparent;
      cursor: pointer;
      transition: transform var(--transition-spring, 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)),
                  border-color var(--transition, 0.25s),
                  box-shadow var(--transition, 0.25s);
    }

    .color-btn:hover {
      transform: scale(1.15);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .color-btn.selected {
      border-color: var(--text, #1A2138);
      transform: scale(1.1);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    .cancel-btn {
      border-radius: var(--radius, 10px) !important;
      font-weight: 500 !important;
      transition: background var(--transition, 0.25s) !important;
    }

    .submit-btn {
      border-radius: var(--radius, 10px) !important;
      font-weight: 600 !important;
      display: inline-flex !important;
      align-items: center;
      gap: 6px;
      letter-spacing: 0.3px;
    }

    .submit-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class SavingsGoalFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  icons = ICONS;
  colors = COLORS;

  constructor(
    private fb: FormBuilder,
    private savingsGoalService: SavingsGoalService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<SavingsGoalFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SavingsGoal | null
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      targetAmount: [0, [Validators.required, Validators.min(1)]],
      currentAmount: [0],
      category: [''],
      deadline: [''],
      icon: ['flag'],
      color: ['#3f51b5']
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        name: this.data.name, targetAmount: this.data.targetAmount,
        currentAmount: this.data.currentAmount, category: this.data.category,
        deadline: this.data.deadline ? new Date(this.data.deadline) : '',
        icon: this.data.icon, color: this.data.color
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const request = this.data
      ? this.savingsGoalService.updateSavingsGoal(this.data._id, this.form.value)
      : this.savingsGoalService.createSavingsGoal(this.form.value);
    request.subscribe({
      next: () => { this.snackBar.open(`Goal ${this.data ? 'updated' : 'created'}`, 'Close', { duration: 3000 }); this.dialogRef.close(true); },
      error: (err) => { this.loading = false; this.snackBar.open(err.error?.message || 'Error', 'Close', { duration: 5000 }); }
    });
  }
}
