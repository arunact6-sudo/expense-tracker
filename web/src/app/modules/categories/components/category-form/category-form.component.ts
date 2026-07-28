import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

const MATERIAL_ICONS = [
  'shopping_cart', 'restaurant', 'directions_car', 'home', 'flight',
  'movie', 'health_and_safety', 'school', 'pets', 'fitness_center',
  'checkroom', 'phone', 'computer', 'wifi', 'local_grocery_store',
  'local_hospital', 'local_gas_station', 'local_atm', 'card_giftcard',
  'work', 'payments', 'savings', 'trending_up', 'trending_down',
  'account_balance', 'monetization_on', 'attach_money', 'money',
  'receipt_long', 'category', 'bookmark', 'star', 'favorite'
];

const COLORS = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
  '#2196f3', '#00bcd4', '#009688', '#4caf50', '#8bc34a',
  '#ff9800', '#ff5722', '#795548', '#607d8b', '#000000'
];

@Component({
  selector: 'app-category-form',
  template: `
    <h2 mat-dialog-title class="premium-dialog-title">{{ data ? 'Edit Category' : 'New Category' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-1">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Category name">
          <mat-error>Name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-2">
          <mat-label>Type</mat-label>
          <mat-select formControlName="type">
            <mat-option value="expense">Expense</mat-option>
            <mat-option value="income">Income</mat-option>
            <mat-option value="both">Both</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="animate-fade-in-up stagger-3">
          <label class="form-label">Icon</label>
          <div class="icon-grid">
            <button *ngFor="let icon of icons" type="button"
              class="icon-btn" [class.selected]="form.get('icon')?.value === icon"
              (click)="form.get('icon')?.setValue(icon)">
              <mat-icon>{{ icon }}</mat-icon>
            </button>
          </div>
        </div>

        <div class="animate-fade-in-up stagger-4">
          <label class="form-label">Color</label>
          <div class="color-grid">
            <button *ngFor="let color of colors" type="button"
              class="color-btn" [style.background]="color"
              [class.selected]="form.get('color')?.value === color"
              (click)="form.get('color')?.setValue(color)">
            </button>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="animate-fade-in-up stagger-5">
      <button mat-button mat-dialog-close class="btn-cancel">Cancel</button>
      <button mat-raised-button color="primary" class="btn-premium-submit" [disabled]="form.invalid || loading" (click)="onSubmit()">
        {{ data ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .w-full { width: 100%; }

    .premium-dialog-title {
      font-size: 22px;
      font-weight: 700;
      margin: 0;
      padding-bottom: 8px;
      color: var(--text, #1A2138);
      letter-spacing: -0.3px;
    }

    .form-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary, #6B7A99);
      margin-bottom: 8px;
      display: block;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .icon-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
      margin-bottom: 20px;
    }

    .icon-btn {
      width: 36px;
      height: 36px;
      border: 1px solid var(--border, #E4E9F2);
      border-radius: var(--radius, 10px);
      background: var(--surface, #fff);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color var(--transition-fast), background var(--transition-fast), box-shadow var(--transition-fast);
    }

    .icon-btn:hover {
      border-color: var(--primary, #4F46E5);
      box-shadow: 0 0 0 3px var(--primary-50, rgba(79,70,229,0.08));
    }

    .icon-btn.selected {
      border-color: var(--primary, #4F46E5);
      background: var(--primary-50, rgba(79,70,229,0.08));
      box-shadow: 0 0 0 3px var(--primary-100, rgba(79,70,229,0.15));
    }

    .icon-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--text-secondary, #6B7A99);
    }

    .icon-btn.selected mat-icon {
      color: var(--primary, #4F46E5);
    }

    .color-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }

    .color-btn {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-full, 9999px);
      border: 2px solid transparent;
      cursor: pointer;
      transition: box-shadow var(--transition-fast), transform var(--transition-fast);
    }

    .color-btn:hover {
      box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
    }

    .color-btn.selected {
      border-color: var(--text, #1A2138);
      box-shadow: 0 0 0 2px var(--surface, #fff), 0 0 0 4px var(--text, #1A2138);
    }

    .btn-cancel {
      border-radius: var(--radius, 10px) !important;
      font-weight: 500 !important;
      transition: background var(--transition-fast) !important;
    }

    .btn-premium-submit {
      border-radius: var(--radius, 10px) !important;
      font-weight: 600 !important;
      padding: 0 28px !important;
      box-shadow: var(--shadow-sm) !important;
      transition: box-shadow var(--transition-fast), transform var(--transition-fast) !important;
    }

    .btn-premium-submit:hover:not(:disabled) {
      box-shadow: var(--shadow-md) !important;
      transform: translateY(-1px) !important;
    }
  `]
})
export class CategoryFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  icons = MATERIAL_ICONS;
  colors = COLORS;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CategoryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Category | null
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['expense', Validators.required],
      icon: ['category', Validators.required],
      color: ['#3f51b5', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        name: this.data.name,
        type: this.data.type,
        icon: this.data.icon,
        color: this.data.color
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const request = this.data
      ? this.categoryService.updateCategory(this.data._id, this.form.value)
      : this.categoryService.createCategory(this.form.value);

    request.subscribe({
      next: () => {
        this.snackBar.open(`Category ${this.data ? 'updated' : 'created'}`, 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Error saving category', 'Close', { duration: 5000 });
      }
    });
  }
}
