import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { TokenService } from '../token.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent {
  constructor(private authService: AuthService, private tokenService: TokenService, private router: Router) {}

  logout(): void {
    this.tokenService.removeToken();
    // TODO: need to clear the user data from local storage
    this.authService.clearUserData();
    this.router.navigate(['/']);
  }
}
