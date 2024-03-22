import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';
import { ErrorMessageService } from './error-message.service';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  constructor(private router: Router, private authService: AuthService, private errorMessageService: ErrorMessageService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
           this.authService.logoutUser()
           this.router.navigate(['/login'])
           this.errorMessageService.setErrorMessage('Your session has expired. Please log in again.');
        }
        return throwError(error);
      })
    );
  }
}
