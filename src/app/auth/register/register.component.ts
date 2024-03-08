import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  userData: any = {};
  private subscription: Subscription = new Subscription();

  constructor(private authService: AuthService) {}
  
  onSubmit(): void {
    if (this.userData.password !== this.userData.rePassword) {
      console.error('Password and Confirm Password do not match');
      return;
    }
  
    this.subscription.add(
      this.authService.registerUser(this.userData).subscribe(
        (response) => {
          console.log('Registration successful:', response);
        },
        (error) => {
          console.error('Registration failed:', error);
        }
      )
    );
  }
}
