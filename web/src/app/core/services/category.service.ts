import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Category, ApiResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  constructor(private api: ApiService) {}

  getCategories(type?: string): Observable<ApiResponse<Category[]>> {
    const params = type ? { type } : {};
    return this.api.get<Category[]>('/categories', params)
      .pipe(
        tap(res => {
          if (res.success && res.data) {
            this.categoriesSubject.next(res.data);
          }
        })
      );
  }

  createCategory(data: Partial<Category>): Observable<ApiResponse<Category>> {
    return this.api.post<Category>('/categories', data)
      .pipe(
        tap(() => this.getCategories().subscribe())
      );
  }

  updateCategory(id: string, data: Partial<Category>): Observable<ApiResponse<Category>> {
    return this.api.put<Category>(`/categories/${id}`, data)
      .pipe(
        tap(() => this.getCategories().subscribe())
      );
  }

  deleteCategory(id: string): Observable<ApiResponse<any>> {
    return this.api.delete(`/categories/${id}`)
      .pipe(
        tap(() => this.getCategories().subscribe())
      );
  }

  getDefaultCategories(): Observable<ApiResponse<Category[]>> {
    return this.api.get<Category[]>('/categories/defaults');
  }
}
