import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { TokenService } from 'src/app/auth/token.service';

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
  ) {}

  logout(): void {
    this.isAuthenticated = false;
    this.tokenService.removeToken();
    // Optionally, navigate to another page after logout
    this.router.navigate(['/']);
  }

  checkAuth(): boolean {
    const token = !!this.tokenService.getToken()
    const tokenExpiration = this.tokenService.tokenExpiration;

    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Compare the expiration time with the current time
    if (!token || tokenExpiration < currentTimestamp) {
      this.isAuthenticated = false;
      return false;
    }

    this.isAuthenticated = true;
    return true;
  }

  ngOnInit(): void {
    this.checkAuth();
  }
}
