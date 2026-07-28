import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { SettingsService } from '../../../../core/services/settings.service';
import { BackupService } from '../../../../core/services/backup.service';
import { User } from '../../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Settings</h1>
      </div>

      <mat-card class="settings-section animate-fade-in-up stagger-1">
        <mat-card-header>
          <mat-card-title class="premium-gradient-text">Profile</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="profileForm">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name">
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" [attr.disabled]="true">
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone">
            </mat-form-field>
            <button mat-raised-button color="primary" class="premium-btn" (click)="updateProfile()" [disabled]="saving">
              Save Profile
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card class="settings-section animate-fade-in-up stagger-2">
        <mat-card-header>
          <mat-card-title class="premium-gradient-text">Appearance</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="setting-row">
            <span>Dark Mode</span>
            <mat-slide-toggle [checked]="isDarkMode" (change)="toggleTheme()"></mat-slide-toggle>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="settings-section animate-fade-in-up stagger-3">
        <mat-card-header>
          <mat-card-title class="premium-gradient-text">Preferences</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Currency</mat-label>
            <mat-select [(ngModel)]="selectedCurrency" (selectionChange)="updateCurrency()">
              <mat-option value="USD">USD - US Dollar</mat-option>
              <mat-option value="EUR">EUR - Euro</mat-option>
              <mat-option value="GBP">GBP - British Pound</mat-option>
              <mat-option value="INR">INR - Indian Rupee</mat-option>
              <mat-option value="JPY">JPY - Japanese Yen</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Date Format</mat-label>
            <mat-select [(ngModel)]="selectedDateFormat" (selectionChange)="updateDateFormat()">
              <mat-option value="MM/dd/yyyy">MM/DD/YYYY</mat-option>
              <mat-option value="dd/MM/yyyy">DD/MM/YYYY</mat-option>
              <mat-option value="yyyy-MM-dd">YYYY-MM-DD</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Language</mat-label>
            <mat-select [(ngModel)]="selectedLanguage" (selectionChange)="updateLanguage()">
              <mat-option value="en">English</mat-option>
              <mat-option value="es">Spanish</mat-option>
              <mat-option value="fr">French</mat-option>
              <mat-option value="de">German</mat-option>
              <mat-option value="hi">Hindi</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="setting-row">
            <span>Email Notifications</span>
            <mat-slide-toggle [checked]="notificationsEnabled" (change)="toggleNotifications()"></mat-slide-toggle>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="settings-section animate-fade-in-up stagger-4">
        <mat-card-header>
          <mat-card-title class="premium-gradient-text">Change Password</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="passwordForm">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Current Password</mat-label>
              <input matInput type="password" formControlName="currentPassword">
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>New Password</mat-label>
              <input matInput type="password" formControlName="newPassword">
            </mat-form-field>
            <button mat-raised-button color="primary" class="premium-btn" (click)="changePassword()" [disabled]="passwordForm.invalid">
              Change Password
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card class="settings-section animate-fade-in-up stagger-5">
        <mat-card-header>
          <mat-card-title class="premium-gradient-text">Data Management</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="data-actions">
            <button mat-stroked-button color="primary" class="data-action-btn backup-btn" (click)="backupData()">
              <mat-icon>cloud_download</mat-icon> Backup Data
            </button>
            <button mat-stroked-button color="accent" class="data-action-btn csv-btn" (click)="exportCSV()">
              <mat-icon>file_download</mat-icon> Export CSV
            </button>
            <button mat-stroked-button class="data-action-btn excel-btn" (click)="exportExcel()">
              <mat-icon>file_download</mat-icon> Export Excel
            </button>
            <button mat-stroked-button color="warn" class="data-action-btn restore-btn" (click)="fileInput.click()">
              <mat-icon>cloud_upload</mat-icon> Restore Data
            </button>
            <input #fileInput type="file" hidden (change)="restoreData($event)">
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .settings-section {
      border-radius: var(--radius-lg);
      margin-bottom: 20px;
      transition: transform var(--transition-spring), box-shadow var(--transition), border-color var(--transition);
    }
    .settings-section:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
      border-color: var(--primary-light);
    }
    .settings-section mat-card-title {
      font-size: 18px;
      font-weight: 700;
    }
    .w-full { width: 100%; }
    .setting-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 0;
      border-bottom: 1px solid var(--divider);
      transition: background var(--transition);
    }
    .setting-row:last-child {
      border-bottom: none;
    }
    .setting-row:hover {
      background: rgba(92, 107, 192, 0.03);
      border-radius: 8px;
    }
    .setting-row span {
      font-weight: 500;
    }
    .data-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .data-action-btn {
      border-radius: var(--radius) !important;
      font-weight: 500 !important;
      transition: transform var(--transition-spring), box-shadow var(--transition), background var(--transition) !important;
      padding: 0 20px !important;
    }
    .data-action-btn:hover {
      transform: translateY(-2px) !important;
      box-shadow: var(--shadow-md) !important;
    }
    .backup-btn:hover {
      background: rgba(92, 107, 192, 0.08) !important;
      border-color: var(--primary) !important;
    }
    .csv-btn:hover {
      background: rgba(255, 107, 157, 0.08) !important;
      border-color: var(--accent) !important;
    }
    .excel-btn:hover {
      background: rgba(76, 175, 80, 0.08) !important;
      border-color: var(--success) !important;
    }
    .restore-btn:hover {
      background: rgba(239, 83, 80, 0.08) !important;
      border-color: var(--warn) !important;
    }
  `]
})
export class SettingsComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isDarkMode = false;
  saving = false;
  selectedCurrency = 'USD';
  selectedDateFormat = 'MM/dd/yyyy';
  selectedLanguage = 'en';
  notificationsEnabled = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private themeService: ThemeService,
    private settingsService: SettingsService,
    private backupService: BackupService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({ name: [''], email: [''], phone: [''] });
    this.passwordForm = this.fb.group({ currentPassword: [''], newPassword: [''] });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.profileForm.patchValue({
        name: this.currentUser.name,
        email: this.currentUser.email,
        phone: this.currentUser.phone || ''
      });
      this.isDarkMode = this.currentUser.preferences?.theme === 'dark';
      this.selectedCurrency = this.currentUser.preferences?.currency || 'USD';
      this.selectedDateFormat = this.currentUser.preferences?.dateFormat || 'MM/dd/yyyy';
      this.selectedLanguage = this.currentUser.preferences?.language || 'en';
      this.notificationsEnabled = this.currentUser.preferences?.notifications ?? true;
    }
    this.themeService.currentTheme$.subscribe(theme => this.isDarkMode = theme === 'dark');
  }

  toggleTheme(): void { this.themeService.toggleTheme(); }

  updateProfile(): void {
    this.saving = true;
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => { this.saving = false; this.snackBar.open('Profile updated', 'Close', { duration: 3000 }); },
      error: () => { this.saving = false; }
    });
  }

  changePassword(): void {
    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: () => { this.snackBar.open('Password changed', 'Close', { duration: 3000 }); this.passwordForm.reset(); },
      error: (err) => { this.snackBar.open(err.error?.message || 'Error', 'Close', { duration: 5000 }); }
    });
  }

  updateCurrency(): void { this.settingsService.updateSettings({ currency: this.selectedCurrency }).subscribe(); }
  updateDateFormat(): void { this.settingsService.updateSettings({ dateFormat: this.selectedDateFormat }).subscribe(); }
  updateLanguage(): void { this.settingsService.updateSettings({ language: this.selectedLanguage }).subscribe(); }
  toggleNotifications(): void {
    this.notificationsEnabled = !this.notificationsEnabled;
    this.settingsService.updateSettings({ notifications: this.notificationsEnabled }).subscribe();
  }

  backupData(): void {
    this.backupService.backupData().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const blob = new Blob([JSON.stringify(res.data)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
          this.snackBar.open('Backup downloaded', 'Close', { duration: 3000 });
        }
      }
    });
  }

  restoreData(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        this.backupService.restoreData(data).subscribe({
          next: () => { this.snackBar.open('Data restored successfully', 'Close', { duration: 3000 }); },
          error: (err) => { this.snackBar.open(err.error?.message || 'Restore failed', 'Close', { duration: 5000 }); }
        });
      } catch { this.snackBar.open('Invalid backup file', 'Close', { duration: 3000 }); }
    };
    reader.readAsText(input.files[0]);
  }

  exportCSV(): void {
    this.backupService.exportToCSV().subscribe({
      next: (res) => {
        const blob = new Blob([res as any], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.csv';
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }

  exportExcel(): void {
    this.backupService.exportToExcel().subscribe({
      next: (res) => {
        const blob = new Blob([res as any], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.xlsx';
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }
}
