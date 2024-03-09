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

  // Get user data from localStorage
  getUserData(): any | null {
    const userDataString = localStorage.getItem('userData');
    return userDataString ? JSON.parse(userDataString) : null;
  }

  clearUserData(): void {
    localStorage.removeItem('userData');
  }

  // decodeToken(token: string): any | null {
  //   if (token) {
  //     const decodedToken = jwtDecode(token)
  //     return decodedToken;
  //   }

  //   return null
  // }
}
