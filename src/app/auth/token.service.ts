import { Injectable } from '@angular/core';
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  tokenExpiration: any = {}
  
  saveTokenAndUserData(token: string): void {
    localStorage.setItem('jwt', token);
    const decodedToken = jwtDecode(token);
    localStorage.setItem('userData', JSON.stringify(decodedToken));
  }
  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  // Remove token from localStorage
  removeToken(): void {
    localStorage.removeItem('jwt');
  }
}
