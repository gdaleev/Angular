import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { jwtDecode } from "jwt-decode";
import { TokenService } from '../token.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  userData: any = {};
  private subscription: Subscription = new Subscription();
  decodedToken: any = {};

  constructor(private authService: AuthService, private tokenService: TokenService) {}

  onSubmit(): void {
    this.subscription.add(
      this.authService.loginUser(this.userData).subscribe(
        (response) => {
          console.log('Login successful:', response);
          this.authService.saveToken(response.token);
          this.decodedToken = jwtDecode(response.token);
          this.tokenService.decodedToken = jwtDecode(response.token)
          // Optionally, you can redirect or perform other actions upon successful login
        },
        (error) => {
          console.error('Login failed:', error);
        }
      )
    );
  }
}
