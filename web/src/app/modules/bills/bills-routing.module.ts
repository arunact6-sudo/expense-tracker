import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillListComponent } from './components/bill-list/bill-list.component';
import { BillDetailComponent } from './components/bill-detail/bill-detail.component';

const routes: Routes = [
  { path: '', component: BillListComponent },
  { path: ':id', component: BillDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillsRoutingModule {}
