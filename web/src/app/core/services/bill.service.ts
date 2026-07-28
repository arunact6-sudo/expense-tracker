import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Bill, ApiResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class BillService {
  constructor(private api: ApiService) {}

  getBills(params: any = {}): Observable<ApiResponse<Bill[]>> {
    return this.api.get<Bill[]>('/bills', params);
  }

  createBill(data: Partial<Bill>): Observable<ApiResponse<Bill>> {
    return this.api.post<Bill>('/bills', data);
  }

  updateBill(id: string, data: Partial<Bill>): Observable<ApiResponse<Bill>> {
    return this.api.put<Bill>(`/bills/${id}`, data);
  }

  deleteBill(id: string): Observable<ApiResponse<any>> {
    return this.api.delete(`/bills/${id}`);
  }

  markAsPaid(id: string): Observable<ApiResponse<Bill>> {
    return this.api.put<Bill>(`/bills/${id}/pay`, {});
  }

  getUpcomingBills(): Observable<ApiResponse<Bill[]>> {
    return this.api.get<Bill[]>('/bills/upcoming');
  }

  getOverdueBills(): Observable<ApiResponse<Bill[]>> {
    return this.api.get<Bill[]>('/bills/overdue');
  }
}
