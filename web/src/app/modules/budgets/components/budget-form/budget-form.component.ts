import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BudgetService } from '../../../../core/services/budget.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Budget, Category } from '../../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-budget-form',
  template: `
    <h2 mat-dialog-title class="premium-dialog-title">
      <mat-icon class="dialog-title-icon">{{ data ? 'edit' : 'add_circle' }}</mat-icon>
      {{ data ? 'Edit Budget' : 'New Budget' }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-1">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="e.g. Monthly Food Budget">
          <mat-error>Name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-2">
          <mat-label>Amount</mat-label>
          <input matInput type="number" formControlName="amount">
          <mat-error>Amount is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-3">
          <mat-label>Period</mat-label>
          <mat-select formControlName="period">
            <mat-option value="weekly">Weekly</mat-option>
            <mat-option value="monthly">Monthly</mat-option>
            <mat-option value="yearly">Yearly</mat-option>
            <mat-option value="custom">Custom</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-4">
          <mat-label>Category (Optional)</mat-label>
          <mat-select formControlName="category">
            <mat-option value="">All Categories</mat-option>
            <mat-option *ngFor="let c of categories" [value]="c._id">{{ c.name }}</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="form-row animate-fade-in-up stagger-5">
          <mat-form-field appearance="outline" class="half">
            <mat-label>Start Date</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="startDate">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline" class="half">
            <mat-label>End Date</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="endDate">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>
        </div>

        <div class="form-row animate-fade-in-up stagger-6">
          <mat-form-field appearance="outline" class="half">
            <mat-label>Warn Threshold (%)</mat-label>
            <input matInput type="number" formControlName="warnThreshold">
          </mat-form-field>
          <mat-form-field appearance="outline" class="half">
            <mat-label>Danger Threshold (%)</mat-label>
            <input matInput type="number" formControlName="dangerThreshold">
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="animate-fade-in-up stagger-7">
      <button mat-button mat-dialog-close class="cancel-btn">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid || loading" (click)="onSubmit()" class="submit-btn">
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
      color: var(--text, #1A2138);
    }

    .dialog-title-icon {
      color: var(--primary, #4F46E5);
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .form-row {
      display: flex;
      gap: 12px;
    }

    .half {
      flex: 1;
    }

    .cancel-btn {
      border-radius: var(--radius, 10px) !important;
      font-weight: 500 !important;
      transition: background var(--transition-fast) !important;
    }

    .submit-btn {
      border-radius: var(--radius, 10px) !important;
      font-weight: 600 !important;
      display: inline-flex !important;
      align-items: center;
      gap: 6px;
      letter-spacing: 0.3px;
      box-shadow: var(--shadow-sm) !important;
      transition: box-shadow var(--transition-fast), transform var(--transition-fast) !important;
    }

    .submit-btn:hover:not(:disabled) {
      box-shadow: var(--shadow-md) !important;
      transform: translateY(-1px) !important;
    }

    .submit-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class BudgetFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<BudgetFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Budget | null
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      period: ['monthly', Validators.required],
      category: [''],
      startDate: [new Date(), Validators.required],
      endDate: [new Date(), Validators.required],
      warnThreshold: [70],
      dangerThreshold: [90]
    });
  }

  ngOnInit(): void {
    this.categoryService.getCategories('expense').subscribe({
      next: (res) => { if (res.success && res.data) this.categories = res.data; }
    });
    if (this.data) {
      this.form.patchValue({
        name: this.data.name,
        amount: this.data.amount,
        period: this.data.period,
        category: this.data.category?._id || '',
        startDate: new Date(this.data.startDate),
        endDate: new Date(this.data.endDate),
        warnThreshold: this.data.alertThresholds?.warn || 70,
        dangerThreshold: this.data.alertThresholds?.danger || 90
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const formData = {
      ...this.form.value,
      alertThresholds: { warn: this.form.value.warnThreshold, danger: this.form.value.dangerThreshold }
    };
    delete formData.warnThreshold;
    delete formData.dangerThreshold;

    const request = this.data
      ? this.budgetService.updateBudget(this.data._id, formData)
      : this.budgetService.createBudget(formData);
    request.subscribe({
      next: () => { this.snackBar.open(`Budget ${this.data ? 'updated' : 'created'}`, 'Close', { duration: 3000 }); this.dialogRef.close(true); },
      error: (err) => { this.loading = false; this.snackBar.open(err.error?.message || 'Error', 'Close', { duration: 5000 }); }
    });
  }
}
