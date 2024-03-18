import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/auth/token.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
})
export class NavigationComponent implements OnInit {
  isAuthenticated: boolean = false;
  private authenticationStatusSubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // console.log('Cookies on Page Load:', document.cookie);
    this.authenticationStatusSubscription = this.authService.authenticationStatus$.subscribe(
      (status)=>{
        this.isAuthenticated = status
      }
    )

    this.updateAuthenticationStatus()
  }

  ngOnDestroy() {
    this.authenticationStatusSubscription.unsubscribe();
  }

  logout(): void {
    console.log('Logout function called');
    // console.log('Current Cookies:', document.cookie);
    this.authService.logoutUser();
    this.router.navigate(['/']);
  }
  
  private updateAuthenticationStatus(): void {
    this.tokenService.getToken().subscribe(
      (response) => {
        if (response) {
          // Check if the token is present and not expired
          // console.log('Decoded Token:', response.decodedToken);
          this.isAuthenticated =
            response.decodedToken.exp > Math.floor(Date.now() / 1000);
            if (!this.isAuthenticated) {
              this.logout()
              this.router.navigate(['/login']);
            }
        } else {
          console.error('Token response is null or undefined');
          this.isAuthenticated = false;
        }
      },
      (error) => {
        console.error('Token retrieval error:', error);

        if (error.status === 401) {
          console.log(
            'Received 401 Unauthorized response. Setting isAuthenticated to false.'
          );
          this.isAuthenticated = false;
        } else {
          // Handle other errors as needed
          console.error('Unhandled error:', error);
        }
      }
    );
  }
}
