import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationListComponent } from './components/notification-list/notification-list.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [NotificationListComponent],
  imports: [
    CommonModule, RouterModule, NotificationsRoutingModule, SharedModule,
    MatCardModule, MatButtonModule, MatIconModule, MatListModule, MatBadgeModule, MatTooltipModule, MatDividerModule
  ]
})
export class NotificationsModule {}
