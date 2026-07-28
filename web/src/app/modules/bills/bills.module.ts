import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { BillsRoutingModule } from './bills-routing.module';
import { BillListComponent } from './components/bill-list/bill-list.component';
import { BillFormComponent } from './components/bill-form/bill-form.component';
import { BillDetailComponent } from './components/bill-detail/bill-detail.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [BillListComponent, BillFormComponent, BillDetailComponent],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule, BillsRoutingModule, SharedModule,
    MatTableModule, MatCardModule, MatButtonModule, MatIconModule, MatDialogModule, MatChipsModule,
    MatTooltipModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule,
    MatNativeDateModule, MatSlideToggleModule, MatMenuModule
  ]
})
export class BillsModule {}
