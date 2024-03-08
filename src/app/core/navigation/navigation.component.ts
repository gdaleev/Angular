import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {
  constructor(private authService: AuthService, private router: Router) {}
  
  logout(): void {
    this.authService.removeToken();
    // Optionally, navigate to another page after logout
    this.router.navigate(['/']);
  }
}
