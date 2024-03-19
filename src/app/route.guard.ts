import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import {jwtDecode} from 'jwt-decode'; // Import jwt-decode library
import { AuthService } from './auth/auth.service';
import { ErrorMessageService } from './error-message.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouteGuard implements CanActivate {
  constructor(private router: Router) {}
  // return true;
  canActivate(): boolean {
    if (this.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/login'])
      return false;
    }
  }

  private isAuthenticated() : boolean {
     return this.getCookie('jwt') !== null;
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
};

