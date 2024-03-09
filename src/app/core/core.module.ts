import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from './navigation/navigation.component';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TokenService } from '../auth/token.service';

@NgModule({
  declarations: [NavigationComponent],
  imports: [
    CommonModule, RouterModule
  ],
  providers: [AuthService, TokenService],
  exports: [NavigationComponent]
})
export class CoreModule { }
