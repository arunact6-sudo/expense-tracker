import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, Category, ApiResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private api: ApiService) {}

  getAllUsers(params: any = {}): Observable<ApiResponse<User[]>> {
    return this.api.get<User[]>('/admin/users', params);
  }

  updateUserStatus(id: string, status: boolean): Observable<ApiResponse<User>> {
    return this.api.put<User>(`/admin/users/${id}/status`, { isActive: status });
  }

  getSystemStats(): Observable<ApiResponse<any>> {
    return this.api.get('/admin/stats');
  }

  getAllCategories(params: any = {}): Observable<ApiResponse<Category[]>> {
    return this.api.get<Category[]>('/admin/categories', params);
  }
}
