import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthService } from './auth.service';
import { FormsModule } from '@angular/forms';
import { LogoutComponent } from './logout/logout.component';
import { TokenService } from './token.service';

@NgModule({
  declarations: [LoginComponent, RegisterComponent, ProfileComponent, LogoutComponent],
  imports: [
    CommonModule,
    FormsModule
  ],
  providers: [AuthService, TokenService],
  exports: [LoginComponent, RegisterComponent, ProfileComponent]
})
export class AuthModule { }
