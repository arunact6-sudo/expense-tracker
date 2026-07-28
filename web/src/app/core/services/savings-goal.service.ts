import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SavingsGoal, ApiResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class SavingsGoalService {
  constructor(private api: ApiService) {}

  getSavingsGoals(): Observable<ApiResponse<SavingsGoal[]>> {
    return this.api.get<SavingsGoal[]>('/savings-goals');
  }

  createSavingsGoal(data: Partial<SavingsGoal>): Observable<ApiResponse<SavingsGoal>> {
    return this.api.post<SavingsGoal>('/savings-goals', data);
  }

  updateSavingsGoal(id: string, data: Partial<SavingsGoal>): Observable<ApiResponse<SavingsGoal>> {
    return this.api.put<SavingsGoal>(`/savings-goals/${id}`, data);
  }

  deleteSavingsGoal(id: string): Observable<ApiResponse<any>> {
    return this.api.delete(`/savings-goals/${id}`);
  }

  contributeToGoal(id: string, amount: number): Observable<ApiResponse<SavingsGoal>> {
    return this.api.post<SavingsGoal>(`/savings-goals/${id}/contribute`, { amount });
  }

  getGoalProgress(id: string): Observable<ApiResponse<any>> {
    return this.api.get(`/savings-goals/${id}/progress`);
  }
}
