import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  registerUser(userData: any): Observable<any> {
    const registerUrl = `${this.apiUrl}/register`;
    return this.http.post<any>(registerUrl, userData).pipe(
      catchError((error) => throwError(error))
    );
  }

  loginUser(userData: any): Observable<any> {
    const loginUrl = `${this.apiUrl}/login`;
    return this.http.post<any>(loginUrl, userData).pipe(
      catchError((error) => throwError(error))
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('jwt', token);
  }

  // Get token from localStorage
  private getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  // Remove token from localStorage
  removeToken(): void {
    localStorage.removeItem('jwt');
  }
}
