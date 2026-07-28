import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { WalletsRoutingModule } from './wallets-routing.module';
import { WalletListComponent } from './components/wallet-list/wallet-list.component';
import { WalletFormComponent } from './components/wallet-form/wallet-form.component';
import { WalletTransferComponent } from './components/wallet-transfer/wallet-transfer.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [WalletListComponent, WalletFormComponent, WalletTransferComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    WalletsRoutingModule,
    SharedModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule
  ]
})
export class WalletsModule {}
