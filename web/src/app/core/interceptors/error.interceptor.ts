import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let message = 'An unexpected error occurred';

        if (error.error?.message) {
          message = error.error.message;
        } else if (error.error?.error) {
          message = error.error.error;
        } else if (error.message) {
          message = error.message;
        }

        switch (error.status) {
          case 400:
            message = error.error?.message || 'Bad request';
            break;
          case 403:
            message = 'You do not have permission to perform this action';
            break;
          case 404:
            message = 'Resource not found';
            break;
          case 500:
            message = 'Internal server error';
            break;
        }

        this.snackBar.open(message, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });

        return throwError(() => error);
      })
    );
  }
}
