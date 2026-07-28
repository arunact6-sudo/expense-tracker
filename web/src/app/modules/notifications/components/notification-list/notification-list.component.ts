import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../../core/services/notification.service';
import { Notification } from '../../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-notification-list',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Notifications</h1>
        <button mat-raised-button color="primary" (click)="markAllRead()" [disabled]="unreadCount === 0" class="premium-btn mark-all-btn">
          <mat-icon>done_all</mat-icon> Mark All as Read
        </button>
      </div>

      <mat-card class="notifications-card animate-fade-in-up" *ngIf="notifications.length > 0">
        <mat-list>
          <mat-list-item *ngFor="let notification of notifications; let i = index"
            class="notification-item animate-fade-in-up"
            [class]="'stagger-' + (i + 1)"
            [class.unread]="!notification.isRead" appHighlight>
            <div class="notification-icon" [ngClass]="'icon-' + notification.type" matListItemIcon>
              <mat-icon>{{ getIcon(notification.type) }}</mat-icon>
            </div>
            <div matListItemTitle class="notification-title">{{ notification.title }}</div>
            <div matListItemLine class="notification-message">{{ notification.message }}</div>
            <div matListItemLine class="notification-time">{{ notification.createdAt | timeAgo }}</div>
            <div class="notification-actions">
              <button mat-icon-button *ngIf="!notification.isRead" (click)="markRead(notification)" matTooltip="Mark as read">
                <mat-icon>mark_email_read</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteNotification(notification)" matTooltip="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
            <mat-divider></mat-divider>
          </mat-list-item>
        </mat-list>
      </mat-card>

      <mat-card *ngIf="notifications.length === 0 && !loading" class="empty-card animate-fade-in-up">
        <div class="empty-state">
          <div class="empty-icon-wrapper">
            <mat-icon class="empty-icon animate-float">notifications_none</mat-icon>
          </div>
          <p class="empty-title">No notifications</p>
          <p class="empty-subtitle">You're all caught up!</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .notifications-card {
      border-radius: var(--radius-lg);
      border: 1px solid var(--glass-border);
      overflow: hidden;
    }
    .notification-item {
      padding: 14px 16px !important;
      transition: background var(--transition), border-color var(--transition), transform var(--transition-fast) !important;
      border-left: 3px solid transparent;
    }
    .notification-item:hover {
      background: rgba(92, 107, 192, 0.04);
      transform: translateX(2px);
    }
    .notification-item.unread {
      background: rgba(92, 107, 192, 0.06);
      border-left-color: var(--primary);
      box-shadow: inset 4px 0 12px -4px rgba(92, 107, 192, 0.1);
    }
    .notification-item.unread:hover {
      background: rgba(92, 107, 192, 0.09);
    }
    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform var(--transition-spring);
    }
    .notification-icon:hover {
      transform: scale(1.1) rotate(-5deg);
    }
    .notification-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .icon-info {
      background: linear-gradient(135deg, rgba(33,150,243,0.12), rgba(33,150,243,0.06));
      color: #2196f3;
    }
    .icon-warning {
      background: linear-gradient(135deg, rgba(255,152,0,0.12), rgba(255,152,0,0.06));
      color: #ff9800;
    }
    .icon-success {
      background: linear-gradient(135deg, rgba(76,175,80,0.12), rgba(76,175,80,0.06));
      color: #4caf50;
    }
    .icon-danger {
      background: linear-gradient(135deg, rgba(244,67,54,0.12), rgba(244,67,54,0.06));
      color: #f44336;
    }
    .notification-title {
      font-weight: 600 !important;
      font-size: 14px;
    }
    .notification-message {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    .notification-time {
      font-size: 11px;
      color: var(--text-secondary);
      opacity: 0.7;
    }
    .notification-actions {
      display: flex;
      gap: 4px;
    }
    .notification-actions button {
      transition: transform var(--transition-spring);
    }
    .notification-actions button:hover {
      transform: scale(1.15);
    }
    .mark-all-btn {
      gap: 6px;
    }
    .empty-card {
      border-radius: var(--radius-xl);
      border: 1px dashed var(--border);
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
    }
    .empty-state {
      text-align: center;
      padding: 64px 48px;
    }
    .empty-icon-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 88px;
      height: 88px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(92, 107, 192, 0.08), rgba(126, 87, 194, 0.08));
      margin-bottom: 20px;
    }
    .empty-icon {
      font-size: 40px !important;
      width: 40px !important;
      height: 40px !important;
      color: var(--primary);
    }
    .empty-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 6px;
    }
    .empty-subtitle {
      font-size: 14px;
      color: var(--text-secondary);
    }
  `]
})
export class NotificationListComponent implements OnInit {
  notifications: Notification[] = [];
  unreadCount = 0;
  loading = true;

  constructor(
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.notificationService.unreadCount$.subscribe(count => this.unreadCount = count);
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) this.notifications = res.data;
      }
    });
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = { info: 'info', warning: 'warning', success: 'check_circle', danger: 'error' };
    return icons[type] || 'notifications';
  }

  markRead(notification: Notification): void {
    this.notificationService.markAsRead(notification._id).subscribe({
      next: () => { this.snackBar.open('Marked as read', 'Close', { duration: 2000 }); }
    });
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => { this.snackBar.open('All marked as read', 'Close', { duration: 2000 }); }
    });
  }

  deleteNotification(notification: Notification): void {
    this.notificationService.deleteNotification(notification._id).subscribe({
      next: () => { this.snackBar.open('Notification deleted', 'Close', { duration: 2000 }); }
    });
  }
}
