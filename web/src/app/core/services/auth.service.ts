import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, ApiResponse } from '../models/user.model';
interface DecodedToken {
  id: string;
  email: string;
  role: string;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const user = this.loadStoredUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(res => {
          if (res.success) {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            this.currentUserSubject.next(res.data.user);
          }
        })
      );
  }

  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data)
      .pipe(
        tap(res => {
          if (res.success) {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            this.currentUserSubject.next(res.data.user);
          }
        })
      );
  }

  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/profile`)
      .pipe(
        tap(res => {
          if (res.success && res.data) {
            localStorage.setItem('user', JSON.stringify(res.data));
            this.currentUserSubject.next(res.data);
          }
        })
      );
  }

  updateProfile(data: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/profile`, data)
      .pipe(
        tap(res => {
          if (res.success && res.data) {
            localStorage.setItem('user', JSON.stringify(res.data));
            this.currentUserSubject.next(res.data);
          }
        })
      );
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/change-password`, data);
  }

  forgotPassword(data: { email: string; securityQuestion: string; securityAnswer: string; newPassword: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/forgot-password`, data);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = token.split('.')[1];
      const decoded: DecodedToken = JSON.parse(atob(payload));
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  private loadStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr && this.isLoggedIn()) {
        return JSON.parse(userStr);
      }
    } catch {}
    return null;
  }
}
