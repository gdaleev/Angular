import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
// import { jwtDecode } from "jwt-decode";
import { TokenService } from '../token.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  userData: any = {};
  private subscription: Subscription = new Subscription();

  constructor(private authService: AuthService, private tokenService: TokenService, private router: Router) {}

  onSubmit(): void {
    this.subscription.add(
      this.authService.loginUser(this.userData).subscribe(
        (response) => {
          console.log('Login successful:', response);
          if (response.token) {
            // Decode and set token expiration if needed
            // this.tokenService.setTokenExpiration(jwtDecode(response.token).exp);
          }
          // this.tokenService.saveCookie(response.token);
          // this.decodedToken = jwtDecode(response.token);
          // this.tokenService.setTokenExpiration(this.decodedToken.exp)
          // console.log(this.decodedToken);
          // console.log(this.decodedToken.exp);
          this.router.navigate(["/"])
        },
        (error) => {
          console.error('Login failed:', error);
        }
      )
    );
  }
}
