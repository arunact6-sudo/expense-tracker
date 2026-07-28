import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SavingsGoalListComponent } from './components/savings-goal-list/savings-goal-list.component';
import { SavingsGoalDetailComponent } from './components/savings-goal-detail/savings-goal-detail.component';

const routes: Routes = [
  { path: '', component: SavingsGoalListComponent },
  { path: ':id', component: SavingsGoalDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SavingsGoalsRoutingModule {}
