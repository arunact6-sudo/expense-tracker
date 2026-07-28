import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BillService } from '../../../../core/services/bill.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Bill, Category } from '../../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-bill-form',
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <span class="title-icon">receipt_long</span>
      <span class="premium-gradient-text">{{ data ? 'Edit Bill' : 'New Bill' }}</span>
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-1">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title">
          <mat-error>Title is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-2">
          <mat-label>Amount</mat-label>
          <input matInput type="number" formControlName="amount">
          <mat-error>Amount is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-3">
          <mat-label>Category</mat-label>
          <mat-select formControlName="category">
            <mat-option *ngFor="let c of categories" [value]="c._id">{{ c.name }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-4">
          <mat-label>Due Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="dueDate">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error>Due date is required</mat-error>
        </mat-form-field>

        <div class="toggle-row animate-fade-in-up stagger-5">
          <mat-slide-toggle formControlName="isRecurring">Recurring Bill</mat-slide-toggle>
        </div>

        <mat-form-field appearance="outline" class="w-full animate-fade-in-up" *ngIf="form.get('isRecurring')?.value">
          <mat-label>Frequency</mat-label>
          <mat-select formControlName="frequency">
            <mat-option value="weekly">Weekly</mat-option>
            <mat-option value="monthly">Monthly</mat-option>
            <mat-option value="quarterly">Quarterly</mat-option>
            <mat-option value="yearly">Yearly</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-6">
          <mat-label>Notes</mat-label>
          <textarea matInput formControlName="notes" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close class="cancel-btn">Cancel</button>
      <button mat-raised-button color="primary" class="premium-btn submit-btn" [disabled]="form.invalid || loading" (click)="onSubmit()">
        <mat-icon>{{ data ? 'save' : 'add_circle' }}</mat-icon>
        {{ data ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .w-full { width: 100%; }
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 22px;
      font-weight: 700;
    }
    .title-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--primary-gradient);
      color: #fff;
      font-size: 22px;
    }
    .toggle-row {
      padding: 8px 0 16px;
    }
    .cancel-btn {
      border-radius: var(--radius) !important;
      font-weight: 500 !important;
    }
    .submit-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-radius: var(--radius) !important;
      font-weight: 600 !important;
      padding: 0 24px !important;
    }
    .submit-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
  `]
})
export class BillFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private billService: BillService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<BillFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Bill | null
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      dueDate: [new Date(), Validators.required],
      isRecurring: [false],
      frequency: ['monthly'],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.categoryService.getCategories('expense').subscribe({
      next: (res) => { if (res.success && res.data) this.categories = res.data; }
    });
    if (this.data) {
      this.form.patchValue({
        title: this.data.title, amount: this.data.amount, category: this.data.category?._id,
        dueDate: new Date(this.data.dueDate), isRecurring: this.data.isRecurring,
        frequency: this.data.frequency, notes: this.data.notes
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const request = this.data
      ? this.billService.updateBill(this.data._id, this.form.value)
      : this.billService.createBill(this.form.value);
    request.subscribe({
      next: () => { this.snackBar.open(`Bill ${this.data ? 'updated' : 'created'}`, 'Close', { duration: 3000 }); this.dialogRef.close(true); },
      error: (err) => { this.loading = false; this.snackBar.open(err.error?.message || 'Error', 'Close', { duration: 5000 }); }
    });
  }
}
