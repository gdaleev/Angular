import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  tokenExpiration: number | undefined;
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  saveCookie(token: string): void {
    document.cookie = `jwt=${token}; Path=/;`;
  }

  clearToken(): Observable<any> {
    const options = { withCredentials: true };
    const clearTokenUrl = `${this.apiUrl}/logout`;
    return this.http.post<any>(clearTokenUrl, {}, options);
  }

  getToken(isInitialLoad: boolean = false): Observable<any> {
    const options = {
      withCredentials: true,
      headers: {
        'Initial-Load': isInitialLoad ? 'true' : 'false' 
      }
    };
  
    return this.http.get(`${this.apiUrl}/get-token`, options);
  }

  setTokenExpiration(decodedTokenExp: any): void {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    this.tokenExpiration = decodedTokenExp - currentTimestamp;
  }
}
