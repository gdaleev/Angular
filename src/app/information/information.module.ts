import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { NewsComponent } from './news/news.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [AboutComponent, ContactComponent, NewsComponent],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [AboutComponent, ContactComponent, NewsComponent]
})
export class InformationModule { }
