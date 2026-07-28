import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class BackupService {
  constructor(private api: ApiService) {}

  backupData(): Observable<ApiResponse<any>> {
    return this.api.get('/backup/export');
  }

  restoreData(data: any): Observable<ApiResponse<any>> {
    return this.api.post('/backup/import', data);
  }

  exportToCSV(params: any = {}): Observable<Blob> {
    return this.api.get('/backup/export/csv', params) as any;
  }

  exportToExcel(params: any = {}): Observable<Blob> {
    return this.api.get('/backup/export/excel', params) as any;
  }
}
