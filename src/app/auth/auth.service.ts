import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  token: string | null = null;
  private authenticationStatusSubject = new Subject<boolean>();
  authenticationStatus$ = this.authenticationStatusSubject.asObservable();
  private initialLoad = true;

  constructor(private http: HttpClient, private tokenService: TokenService) {
    // this.token = this.tokenService.getToken();
  }

  isInitialLoad(): boolean {
    return this.initialLoad;
  }

  setInitialLoadFalse(): void {
    this.initialLoad = false;
  }

  registerUser(userData: any): Observable<any> {
    const registerUrl = `${this.apiUrl}/register`;
    return this.http.post<any>(registerUrl, userData).pipe(
      catchError((error: HttpErrorResponse) => {
        if (
          error.status === 400 &&
          error.error &&
          Array.isArray(error.error.error)
        ) {
          // If the status code is 400 and the error contains validation errors
          return throwError(error.error.error); // Return validation errors to the component
        } else {
          // For other errors, simply re-throw the error
          return throwError('Failed to register user. Please try again.');
        }
      })
    );
  }

  // loginUser(userData: any): Observable<any> {
  //   const loginUrl = `${this.apiUrl}/login`;

  //   return this.http.post<any>(loginUrl, userData, {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${this.token}`
  //     })
  //   }).pipe(
  //     catchError((error) => throwError(error))
  //   );
  // }

  loginUser(userData: any): Observable<any> {
    const loginUrl = `${this.apiUrl}/login`;

    return this.http
      .post<any>(loginUrl, userData, { withCredentials: true })
      .pipe(
        tap((response) => {
          this.tokenService.saveCookie(response.token);
          this.notifyAuthenticationStatus(true);
        }),
        catchError((error: HttpErrorResponse) => {

          if (error.status === 400) {
            if (error.error && error.error.error === "Username is required!") {
              return throwError("Please enter your username!");
            } else if (error.error && error.error.error === "Password is required!") {
              return throwError("Please enter your password!");
            } else if (error.error && error.error.error === "Invalid username!") {
              return throwError("Invalid username!");
            } else if (error.error && error.error.error === "Invalid password!") {
              return throwError("Invalid password!");
            }
          }

          return throwError('An error occurred during login. Please try again.');
        })
      );
  }

  logoutUser(): Observable<any> {
    // Additional logic for clearing tokens on the server if needed
    this.tokenService.clearToken().subscribe(
      () => {
        this.notifyAuthenticationStatus(false);
      },
      (error) => {
        console.error('Error clearing token: ', error);
        this.notifyAuthenticationStatus(false);
      }
    );

    return throwError('Logout failed');
  }

  // Other methods...

  private saveCookie(token: string): void {
    document.cookie = `jwt=${token}; Path=/;`;
  }

  private clearCookie(): void {
    document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  private notifyAuthenticationStatus(status: boolean): void {
    this.authenticationStatusSubject.next(status);
  }

  getAuthorizationHeader(): HttpHeaders {
    const token = this.tokenService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // Get user data from localStorage
  getUserData(): Observable<any | null> {
    const userDataUrl = `${this.apiUrl}/get-user-data`;
    return this.http.get<any>(userDataUrl, { withCredentials: true });
  }

  // clearUserData(): void {
  //   const userDataString = localStorage.getItem('userData');
  //   localStorage.removeItem('userData');
  // }

  // decodeToken(token: string): any | null {
  //   if (token) {
  //     const decodedToken = jwtDecode(token)
  //     return decodedToken;
  //   }

  //   return null
  // }
}
