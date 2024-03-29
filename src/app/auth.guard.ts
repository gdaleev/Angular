import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import {jwtDecode} from 'jwt-decode'; 
import { AuthService } from './auth/auth.service';
import { ErrorMessageService } from './error-message.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService, private errorMessageService: ErrorMessageService) {}

  canActivate(): boolean {
    const token = this.getCookie('jwt');

    if (!token) {
      this.authService.logoutUser()
      this.errorMessageService.setErrorMessage('Your session has expired. Please log in again.')
      this.router.navigate(['/login']);
      return false;
    }

    const decodedToken: any = jwtDecode(token);

    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp < currentTime) {
      this.authService.logoutUser()
      this.errorMessageService.setErrorMessage('Your session has expired. Please log in again.')
      this.router.navigate(['/login']);
      return false;
    }
    
    return true;
  }

  private getCookie(name: string): string | null {
    const cookieName = `${name}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(cookieName) === 0) {
        return cookie.substring(cookieName.length, cookie.length);
      }
    }

    return null;
  }
}
