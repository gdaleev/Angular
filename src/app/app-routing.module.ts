import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewsComponent } from './information/news/news.component';
import { AboutComponent } from './information/about/about.component';
import { ContactComponent } from './information/contact/contact.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './auth/profile/profile.component';
import { FavouritesComponent } from './management/favourites/favourites.component';
import { CreateComponent } from './management/create/create.component';
import { DetailsComponent } from './management/details/details.component';
import { EditComponent } from './management/edit/edit.component';
import { HomeComponent } from './home/home-comp/home.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'news', component: NewsComponent},
  {path: 'about', component: AboutComponent},
  {path: 'contact', component: ContactComponent},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'profile', component: ProfileComponent},
  {path: 'favourites', component: FavouritesComponent},
  {path: 'create', component: CreateComponent, canActivate: [AuthGuard]},
  {path: 'details/:id', component: DetailsComponent},
  {path: 'edit/:id', component: EditComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
