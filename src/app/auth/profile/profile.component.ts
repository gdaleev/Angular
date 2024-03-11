interface UserData {
  username: string;
  email: string;
}

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userData: UserData | null = null;
  
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getUserData().subscribe(
      (response: UserData) => {
        this.userData = response;
      }
    )
  }
}
