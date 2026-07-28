import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TransactionService } from '../../../../core/services/transaction.service';
import { CategoryService } from '../../../../core/services/category.service';
import { WalletService } from '../../../../core/services/wallet.service';
import { Transaction, Category, Wallet } from '../../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-transaction-form',
  template: `
    <div class="dialog-header">
      <h2 class="dialog-title">
        <mat-icon class="title-icon">{{ data ? 'edit_note' : 'add_circle_outline' }}</mat-icon>
        {{ data ? 'Edit Transaction' : 'New Transaction' }}
      </h2>
      <button mat-icon-button mat-dialog-close class="close-btn" tabindex="-1">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content custom-scrollbar">
      <form [formGroup]="form" class="transaction-form">
        
        <!-- Full Width: Title -->
        <mat-form-field appearance="outline" class="form-field full-width field-animate stagger-1">
          <mat-label>Transaction Title</mat-label>
          <input matInput formControlName="title" placeholder="e.g. Morning Coffee, Monthly Rent">
          <mat-icon matPrefix>title</mat-icon>
          <mat-error>Title is required</mat-error>
        </mat-form-field>

        <!-- Full Width: Amount -->
        <mat-form-field appearance="outline" class="form-field full-width amount-field field-animate stagger-2">
          <mat-label>Amount</mat-label>
          <input matInput type="number" formControlName="amount" placeholder="0.00">
          <mat-icon matPrefix>attach_money</mat-icon>
          <mat-error>Valid amount is required</mat-error>
        </mat-form-field>

        <!-- Grid Row: Type & Category -->
        <div class="form-grid">
          <mat-form-field appearance="outline" class="form-field field-animate stagger-3">
            <mat-label>Type</mat-label>
            <mat-select formControlName="type">
              <mat-select-trigger>
                <div class="select-trigger">
                  <mat-icon [class]="'type-icon-' + form.get('type')?.value">
                    {{ form.get('type')?.value === 'income' ? 'arrow_upward' : (form.get('type')?.value === 'expense' ? 'arrow_downward' : 'swap_horiz') }}
                  </mat-icon>
                  {{ form.get('type')?.value | titlecase }}
                </div>
              </mat-select-trigger>
              <mat-option value="expense" class="expense-opt">Expense</mat-option>
              <mat-option value="income" class="income-opt">Income</mat-option>
              <mat-option value="transfer" class="transfer-opt">Transfer</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field field-animate stagger-3">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category">
              <mat-option *ngFor="let c of filteredCategories" [value]="c._id">
                <div class="category-option">
                  <span class="cat-dot" [style.background]="c.color || '#CBD5E1'"></span>
                  {{ c.name }}
                </div>
              </mat-option>
              <mat-option *ngIf="filteredCategories.length === 0" disabled>No categories available</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Grid Row: Date & Time -->
        <div class="form-grid">
          <mat-form-field appearance="outline" class="form-field field-animate stagger-4">
            <mat-label>Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="date">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-error>Date is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field field-animate stagger-4">
            <mat-label>Time</mat-label>
            <input matInput type="time" formControlName="time">
            <mat-icon matPrefix>schedule</mat-icon>
          </mat-form-field>
        </div>

        <!-- Grid Row: Payment Method & Wallet -->
        <div class="form-grid">
          <mat-form-field appearance="outline" class="form-field field-animate stagger-5">
            <mat-label>Payment Method</mat-label>
            <mat-select formControlName="paymentMethod">
              <mat-option value="cash">Cash</mat-option>
              <mat-option value="bank_transfer">Bank Transfer</mat-option>
              <mat-option value="credit_card">Credit Card</mat-option>
              <mat-option value="debit_card">Debit Card</mat-option>
              <mat-option value="upi">UPI</mat-option>
              <mat-option value="other">Other</mat-option>
            </mat-select>
            <mat-icon matPrefix>credit_card</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field field-animate stagger-5">
            <mat-label>Wallet</mat-label>
            <mat-select formControlName="wallet">
              <mat-option *ngFor="let w of wallets" [value]="w._id">{{ w.name }}</mat-option>
            </mat-select>
            <mat-icon matPrefix>account_balance_wallet</mat-icon>
          </mat-form-field>
        </div>

        <!-- Conditional: To Wallet for Transfers -->
        <mat-form-field appearance="outline" class="form-field full-width field-animate stagger-5" *ngIf="form.get('type')?.value === 'transfer'">
          <mat-label>Transfer To Wallet</mat-label>
          <mat-select formControlName="toWallet">
            <mat-option *ngFor="let w of wallets" [value]="w._id">{{ w.name }}</mat-option>
          </mat-select>
          <mat-icon matPrefix>move_down</mat-icon>
        </mat-form-field>

        <!-- Grid Row: Merchant & Location -->
        <div class="form-grid">
          <mat-form-field appearance="outline" class="form-field field-animate stagger-6">
            <mat-label>Merchant Name</mat-label>
            <input matInput formControlName="merchantName" placeholder="e.g. Starbucks">
            <mat-icon matPrefix>store</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field field-animate stagger-6">
            <mat-label>Location</mat-label>
            <input matInput formControlName="location" placeholder="e.g. New York">
            <mat-icon matPrefix>location_on</mat-icon>
          </mat-form-field>
        </div>

        <!-- Full Width: Tags -->
        <mat-form-field appearance="outline" class="form-field full-width field-animate stagger-7 custom-chip-field">
          <mat-label>Tags</mat-label>
          <mat-chip-grid #chipGrid aria-label="Enter tags">
            <mat-chip-row *ngFor="let tag of tags" (removed)="removeTag(tag)" class="premium-chip">
              #{{ tag }}
              <button matChipRemove aria-label="'remove ' + tag">
                <mat-icon>cancel</mat-icon>
              </button>
            </mat-chip-row>
            <input matInput placeholder="Type a tag and press Enter..."
              [matChipInputFor]="chipGrid"
              [matChipInputSeparatorKeyCodes]="separatorKeyCodes"
              (matChipInputTokenEnd)="addTag($event)">
          </mat-chip-grid>
          <mat-icon matPrefix>label</mat-icon>
        </mat-form-field>

        <!-- Full Width: Notes -->
        <mat-form-field appearance="outline" class="form-field full-width field-animate stagger-7">
          <mat-label>Notes</mat-label>
          <textarea matInput formControlName="notes" rows="3" placeholder="Add any additional details here..."></textarea>
          <mat-icon matPrefix class="textarea-icon">notes</mat-icon>
        </mat-form-field>

        <!-- Recurring Toggle & Frequency -->
        <div class="recurring-container field-animate stagger-8">
          <mat-slide-toggle formControlName="isRecurring" color="primary" class="recurring-toggle">
            Make this a recurring transaction
          </mat-slide-toggle>

          <div class="frequency-wrapper" *ngIf="form.get('isRecurring')?.value" class="field-animate">
            <mat-form-field appearance="outline" class="form-field full-width">
              <mat-label>Frequency</mat-label>
              <mat-select formControlName="frequency">
                <mat-option value="daily">Daily</mat-option>
                <mat-option value="weekly">Weekly</mat-option>
                <mat-option value="monthly">Monthly</mat-option>
                <mat-option value="yearly">Yearly</mat-option>
              </mat-select>
              <mat-icon matPrefix>autorenew</mat-icon>
            </mat-form-field>
          </div>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button mat-dialog-close class="cancel-btn">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid || loading" (click)="onSubmit()" class="submit-btn" [class.is-loading]="loading">
        <mat-icon *ngIf="!loading">{{ data ? 'save' : 'add' }}</mat-icon>
        <span *ngIf="loading" class="spinner"></span>
        {{ loading ? 'Saving...' : (data ? 'Save Changes' : 'Create Transaction') }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    /* Variables & Animations */
    :host {
      --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
      display: block;
      background: var(--surface, #ffffff);
    }

    @keyframes fadeSlideUp {
      0% { opacity: 0; transform: translateY(12px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    .field-animate {
      opacity: 0;
      animation: fadeSlideUp 0.5s var(--ease-out) forwards;
    }

    .stagger-1 { animation-delay: 0.05s; }
    .stagger-2 { animation-delay: 0.1s; }
    .stagger-3 { animation-delay: 0.15s; }
    .stagger-4 { animation-delay: 0.2s; }
    .stagger-5 { animation-delay: 0.25s; }
    .stagger-6 { animation-delay: 0.3s; }
    .stagger-7 { animation-delay: 0.35s; }
    .stagger-8 { animation-delay: 0.4s; }

    /* Layout & Structure */
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 32px 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      background: #ffffff;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .dialog-title {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      letter-spacing: -0.01em;
    }

    .title-icon { color: #4F46E5; }
    .close-btn { color: #6B7280; transition: all 0.2s; }
    .close-btn:hover { color: #111827; background: #F3F4F6; }

    .dialog-content {
      padding: 24px 32px;
      max-height: 70vh;
      overflow-x: hidden;
    }

    /* Custom Scrollbar */
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }

    .transaction-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .full-width { grid-column: 1 / -1; width: 100%; }

    /* Custom Input Tweaks */
    .form-field { width: 100%; }
    
    ::ng-deep .mat-mdc-text-field-wrapper {
      border-radius: 8px !important;
    }
    
    .amount-field ::ng-deep input {
      font-size: 20px !important;
      font-weight: 600 !important;
      color: #111827;
    }

    mat-icon[matPrefix] {
      color: #9CA3AF;
      margin-right: 8px;
    }

    .textarea-icon { align-self: flex-start; margin-top: 4px; }

    /* Select Overrides */
    .select-trigger {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }
    .type-icon-income { color: #10B981; font-size: 20px; width: 20px; height: 20px; }
    .type-icon-expense { color: #EF4444; font-size: 20px; width: 20px; height: 20px; }
    .type-icon-transfer { color: #3B82F6; font-size: 20px; width: 20px; height: 20px; }

    .category-option { display: flex; align-items: center; gap: 12px; font-weight: 500; }
    .cat-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      display: inline-block;
      box-shadow: 0 0 0 2px rgba(255,255,255,0.8);
    }

    /* Chips Override */
    .premium-chip {
      background: #F3F4F6 !important;
      color: #4B5563 !important;
      font-weight: 600 !important;
      border: 1px solid #E5E7EB;
      transition: all 0.2s ease;
    }
    .premium-chip:hover { background: #E5E7EB !important; color: #111827 !important; }

    /* Recurring Section */
    .recurring-container {
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      padding: 20px;
      margin-top: 8px;
    }
    .recurring-toggle { margin-bottom: 16px; font-weight: 500; color: #374151; }
    
    .frequency-wrapper { animation: fadeSlideUp 0.3s var(--ease-out) forwards; margin-bottom: -16px; }

    /* Footer Actions */
    .dialog-actions {
      padding: 20px 32px;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      background: #ffffff;
      margin: 0;
      position: sticky;
      bottom: 0;
      z-index: 10;
    }
    
    .cancel-btn {
      color: #6B7280;
      font-weight: 500;
      letter-spacing: 0.02em;
      border-radius: 8px;
    }
    .cancel-btn:hover { background: #F3F4F6; }
    
    .submit-btn {
      border-radius: 8px;
      font-weight: 600;
      padding: 0 24px;
      height: 40px;
      letter-spacing: 0.02em;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .submit-btn mat-icon { font-size: 20px; width: 20px; height: 20px; margin-right: 4px; }
    .submit-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); }
    
    .is-loading { opacity: 0.8; pointer-events: none; }
    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-right: 8px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Responsive */
    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; gap: 0; }
      .dialog-header { padding: 20px; }
      .dialog-content { padding: 16px 20px; }
      .dialog-actions { padding: 16px 20px; }
      .submit-btn { flex: 1; justify-content: center; }
    }
  `]
})
export class TransactionFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  wallets: Wallet[] = [];
  tags: string[] = [];
  separatorKeyCodes = [13, 188] as number[]; // Enter and Comma

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private walletService: WalletService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<TransactionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Transaction | null
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      type: ['expense', Validators.required],
      category: [''],
      date: [new Date(), Validators.required],
      time: [''],
      paymentMethod: ['cash', Validators.required],
      wallet: ['', Validators.required],
      toWallet: [''],
      notes: [''],
      merchantName: [''],
      location: [''],
      isRecurring: [false],
      frequency: ['monthly']
    });
  }

  ngOnInit(): void {
    // Load Categories
    this.categoryService.getCategories().subscribe(res => {
      if (res.success && res.data) {
        this.categories = res.data;
        this.filterCategories();
      }
    });

    // Load Wallets
    this.walletService.getWallets().subscribe(res => {
      if (res.success && res.data) this.wallets = res.data;
    });

    // Watch Type Changes to Filter Categories
    this.form.get('type')?.valueChanges.subscribe(() => {
      this.filterCategories();
      this.form.get('category')?.setValue(''); // Reset category when type changes
    });

    // Populate data if editing
    if (this.data) {
      this.tags = [...(this.data.tags || [])];
      this.form.patchValue({
        title: this.data.title,
        amount: this.data.amount,
        type: this.data.type,
        category: this.data.category?._id,
        date: new Date(this.data.date),
        time: this.data.time,
        paymentMethod: this.data.paymentMethod,
        wallet: this.data.wallet?._id,
        toWallet: this.data.toWallet?._id,
        notes: this.data.notes,
        merchantName: this.data.merchantName,
        location: this.data.location,
        isRecurring: this.data.recurring?.isRecurring || false,
        frequency: this.data.recurring?.frequency || 'monthly'
      });
    }
  }

  filterCategories(): void {
    const type = this.form.get('type')?.value;
    this.filteredCategories = this.categories.filter(c =>
      c.type === 'both' || c.type === type
    );
  }

  addTag(event: any): void {
    const value = (event.value || '').trim();
    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
    }
    if (event.chipInput?.clear) {
      event.chipInput.clear();
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const formData = {
      ...this.form.value,
      tags: this.tags,
      recurring: {
        isRecurring: this.form.value.isRecurring,
        frequency: this.form.value.frequency
      }
    };
    
    // Cleanup unnecessary payload data
    delete formData.isRecurring;
    delete formData.frequency;

    // Remove toWallet if not a transfer
    if (formData.type !== 'transfer') {
      delete formData.toWallet;
    }

    const request = this.data
      ? this.transactionService.updateTransaction(this.data._id, formData)
      : this.transactionService.createTransaction(formData);

    request.subscribe({
      next: () => {
        this.snackBar.open(`Transaction successfully ${this.data ? 'updated' : 'created'}!`, 'Close', { 
          duration: 4000, 
          horizontalPosition: 'right', 
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Error saving transaction. Please try again.', 'Close', { 
          duration: 5000,
          horizontalPosition: 'right', 
          verticalPosition: 'top'
        });
      }
    });
  }
}