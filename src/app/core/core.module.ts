import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from './navigation/navigation.component';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@NgModule({
  declarations: [NavigationComponent],
  imports: [
    CommonModule, RouterModule
  ],
  providers: [AuthService],
  exports: [NavigationComponent]
})
export class CoreModule { }
