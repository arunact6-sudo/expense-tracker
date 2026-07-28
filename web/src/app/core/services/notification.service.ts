import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, interval, switchMap, startWith } from 'rxjs';
import { ApiService } from './api.service';
import { Notification, ApiResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  private pollingSubscription: any;

  constructor(private api: ApiService) {}

  getNotifications(): Observable<ApiResponse<Notification[]>> {
    return this.api.get<Notification[]>('/notifications')
      .pipe(
        tap(res => {
          if (res.success && res.data) {
            this.notificationsSubject.next(res.data);
            const unread = res.data.filter(n => !n.isRead).length;
            this.unreadCountSubject.next(unread);
          }
        })
      );
  }

  markAsRead(id: string): Observable<ApiResponse<any>> {
    return this.api.put(`/notifications/${id}/read`, {})
      .pipe(
        tap(() => this.getNotifications().subscribe())
      );
  }

  markAllAsRead(): Observable<ApiResponse<any>> {
    return this.api.put('/notifications/read-all', {})
      .pipe(
        tap(() => this.getNotifications().subscribe())
      );
  }

  getUnreadCount(): Observable<ApiResponse<{ count: number }>> {
    return this.api.get<{ count: number }>('/notifications/unread-count')
      .pipe(
        tap(res => {
          if (res.success && res.data) {
            this.unreadCountSubject.next(res.data.count);
          }
        })
      );
  }

  deleteNotification(id: string): Observable<ApiResponse<any>> {
    return this.api.delete(`/notifications/${id}`)
      .pipe(
        tap(() => this.getNotifications().subscribe())
      );
  }

  startPolling(intervalMs: number = 30000): void {
    this.stopPolling();
    this.pollingSubscription = interval(intervalMs)
      .pipe(startWith(0), switchMap(() => this.getUnreadCount()))
      .subscribe();
  }

  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}
