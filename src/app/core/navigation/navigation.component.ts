import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { TokenService } from 'src/app/auth/token.service';
import { Observable, map, tap } from 'rxjs';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
})
export class NavigationComponent {
  isAuthenticated: boolean = false;

  constructor(
    private router: Router,
    private tokenService: TokenService
  ) // private authService: AuthService
  {}

  logout(): void {
    this.tokenService.removeCookie().subscribe(
      () => {
        this.isAuthenticated = false;
        this.router.navigate(['/']);
      },
      (error) => {
        console.error('Logout failed:', error);
      }
    );
  }

  ngOnInit() {
    this.updateAuthenticationStatus()
  }

  private updateAuthenticationStatus(): void {
    this.tokenService.getToken().subscribe(
      (response) => {
        if (response) {
          // Check if the token is present and not expired
          this.isAuthenticated = response.decodedToken.exp > Math.floor(Date.now() / 1000);
        } else {
          console.error('Token response is null or undefined');
          this.isAuthenticated = false;
        }
      },
      (error) => {
        console.error('Token retrieval error:', error);
        
        if (error.status === 401) {
          console.log('Received 401 Unauthorized response. Setting isAuthenticated to false.');
          this.isAuthenticated = false;
        } else {
          // Handle other errors as needed
          console.error('Unhandled error:', error);
        }
      }
    );
  }
}