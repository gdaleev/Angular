import { NgModule, createComponent } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateComponent } from './create/create.component';
import { DetailsComponent } from './details/details.component';
import { EditComponent } from './edit/edit.component';
import { FavouritesComponent } from './favourites/favourites.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [CreateComponent, DetailsComponent, EditComponent, FavouritesComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  exports: [CreateComponent, DetailsComponent, EditComponent, FavouritesComponent]
})
export class ManagementModule { }
