import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  token: string | null = null;

  constructor(private http: HttpClient, private tokenService: TokenService) {
    this.token = this.tokenService.getToken();
  }

  registerUser(userData: any): Observable<any> {
    const registerUrl = `${this.apiUrl}/register`;
    return this.http
      .post<any>(registerUrl, userData)
      .pipe(catchError((error) => throwError(error)));
  }

  loginUser(userData: any): Observable<any> {
    const loginUrl = `${this.apiUrl}/login`;
    
    return this.http.post<any>(loginUrl, userData, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.token}`
      })
    }).pipe(
      catchError((error) => throwError(error))
    );
  }

  getAuthorizationHeader(): HttpHeaders {
    const token = this.tokenService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // Get user data from localStorage
  getUserData(): any | null {
    const userDataString = localStorage.getItem('userData');
    return userDataString ? JSON.parse(userDataString) : null;
  }

  clearUserData(): void {
    const userDataString = localStorage.getItem('userData');
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
