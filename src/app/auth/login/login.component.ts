import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
// import { jwtDecode } from "jwt-decode";
import { TokenService } from '../token.service';
import { Router } from '@angular/router';
import { ErrorMessageService } from 'src/app/error-message.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit{
  userData: any = {};
  private subscription: Subscription = new Subscription();
  expiredJwtError: string = '';
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private tokenService: TokenService, private router: Router, private errorMessageService: ErrorMessageService) {}

  ngOnInit(): void {
    this.errorMessageService.errorMessage$.subscribe(message => {
      this.expiredJwtError = message;
    });
  }

  onSubmit(): void {
    this.subscription.add(
      this.authService.loginUser(this.userData).subscribe(
        () => {
          this.router.navigate(["/"])
        },
        (error) => {
          console.error('Login failed:', error);
          this.errorMessage = error;
        }
      )
    );
  }
}
