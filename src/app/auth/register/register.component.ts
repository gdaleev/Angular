import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  userData: any = {};
  private subscription: Subscription = new Subscription();
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}
  
  onSubmit(): void {
    // if (this.userData.password !== this.userData.rePassword) {
    //   console.error('Password and Confirm Password do not match');
    //   return;
    // }
  
    this.subscription.add(
      this.authService.registerUser(this.userData).subscribe(
        (response) => {
          console.log('Registration successful:', response);
          this.router.navigate(['/login'])
        },
        (error: any) => {
          if (Array.isArray(error)) {
            // If the error is an array of validation errors, join them into a single string
            // this.errorMessage = error.join(', ');
            this.errorMessage = error[0];
          } else {
            // For other errors, display the generic error message
            this.errorMessage = 'Failed to register user. Please try again.';
          }
        }
      )
    );
  }
}
