import { Component, OnInit } from '@angular/core';
import { TokenService } from '../token.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userData: any = {}
  
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userData = this.authService.getUserData()
  }
}
