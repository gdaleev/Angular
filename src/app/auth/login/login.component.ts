import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { jwtDecode } from "jwt-decode";
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
  decodedToken: any = {};

  constructor(private authService: AuthService, private tokenService: TokenService, private router: Router) {}

  onSubmit(): void {
    this.subscription.add(
      this.authService.loginUser(this.userData).subscribe(
        (response) => {
          console.log('Login successful:', response);
          this.tokenService.saveTokenAndUserData(response.token);
          this.decodedToken = jwtDecode(response.token);
          // this.tokenService.decodedToken = jwtDecode(response.token)
          this.tokenService.tokenExpiration = this.decodedToken.exp;
          this.router.navigate(["/"])
          // Optionally, you can redirect or perform other actions upon successful login
        },
        (error) => {
          console.error('Login failed:', error);
        }
      )
    );
  }
}
