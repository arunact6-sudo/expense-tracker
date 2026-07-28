import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <div class="confirm-dialog">
      <div class="confirm-icon-wrap" [ngClass]="'icon-' + (data.confirmColor || 'primary')">
        <mat-icon>{{ getIcon() }}</mat-icon>
      </div>
      <h2 mat-dialog-title class="confirm-title">{{ data.title }}</h2>
      <mat-dialog-content class="confirm-content">
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end" class="confirm-actions">
        <button mat-button [mat-dialog-close]="false" class="cancel-btn">Cancel</button>
        <button mat-raised-button [color]="data.confirmColor || 'primary'" [mat-dialog-close]="true" class="confirm-btn">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      padding: 8px;
      animation: scaleIn 0.3s var(--ease-spring);
    }

    .confirm-icon-wrap {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      animation: bounce-in 0.5s var(--ease-spring) 0.1s forwards;
      opacity: 0;
    }

    .confirm-icon-wrap mat-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
      color: white;
    }

    .icon-warn { background: var(--warn); box-shadow: 0 4px 14px rgba(239, 68, 68, 0.25); }
    .icon-primary { background: var(--primary); box-shadow: 0 4px 14px rgba(79, 70, 229, 0.25); }
    .icon-accent { background: var(--accent); box-shadow: 0 4px 14px rgba(236, 72, 153, 0.25); }

    .confirm-title {
      text-align: center;
      font-size: 18px !important;
      font-weight: 600 !important;
      margin-bottom: 8px !important;
      color: var(--text) !important;
    }

    .confirm-content {
      text-align: center;
      color: var(--text-secondary);
      font-size: 14px;
      line-height: 1.6;
    }

    .confirm-actions {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
      gap: 8px;
    }

    .cancel-btn {
      border-radius: var(--radius-md) !important;
      font-weight: 500 !important;
      transition: all 0.2s ease !important;
    }

    .confirm-btn {
      border-radius: var(--radius-md) !important;
      font-weight: 600 !important;
      transition: all 0.2s var(--ease-out) !important;
    }

    .confirm-btn:hover {
      transform: translateY(-1px);
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      message: string;
      confirmText?: string;
      confirmColor?: string;
    }
  ) {}

  getIcon(): string {
    const icons: Record<string, string> = {
      warn: 'warning',
      primary: 'help_outline',
      accent: 'help_outline'
    };
    return icons[this.data.confirmColor || 'primary'] || 'help_outline';
  }
}
