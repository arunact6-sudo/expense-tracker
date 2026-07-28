import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { CurrencyFormatPipe } from './pipes/currency-format.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { HighlightDirective } from './directives/highlight.directive';
import { StaggerDirective } from './directives/stagger.directive';
import { CountUpDirective } from './directives/count-up.directive';

@NgModule({
  declarations: [
    ConfirmationDialogComponent,
    LoadingSpinnerComponent,
    CurrencyFormatPipe,
    TimeAgoPipe,
    HighlightDirective,
    StaggerDirective,
    CountUpDirective
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  exports: [
    ConfirmationDialogComponent,
    LoadingSpinnerComponent,
    CurrencyFormatPipe,
    TimeAgoPipe,
    HighlightDirective,
    StaggerDirective,
    CountUpDirective,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ]
})
export class SharedModule {}
