import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  tokenExpiration: number | undefined;
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // ? saveCookie and removeCookie in a separate service

  saveCookie(token: string): void {
    document.cookie = `jwt=${token}; Path=/;`;
    // const decodedToken = jwtDecode(token);
    //localStorage.setItem('userData', JSON.stringify(decodedToken));
  }

  clearToken(): Observable<any> {
    const options = { withCredentials: true };
    const clearTokenUrl = `${this.apiUrl}/logout`;
    return this.http.post<any>(clearTokenUrl, {}, options);
  }

  getToken(): Observable<any> {
    const options = { withCredentials: true }; // Include withCredentials option

    return this.http.get(`${this.apiUrl}/get-token`, options);
  }

  setTokenExpiration(decodedTokenExp: any): void {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    this.tokenExpiration = decodedTokenExp - currentTimestamp;
  }
}
