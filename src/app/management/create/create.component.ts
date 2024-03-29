import { Component } from '@angular/core';
import { NewsService } from '../../information/news/news.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
  providers: [NewsService]
})

export class CreateComponent {
  articles: any[] = [];
  newArticle: any = {};
  errorMessage: string | null = null; 
  
  constructor(private newsService: NewsService, private router: Router) {}

  addNewsArticle() {
    this.newsService.addNewsArticle(this.newArticle).subscribe(
      (article: any) => {
        if (this.articles === undefined) {
          this.articles = []
        } 
        this.articles.push(article);
        this.newArticle = {};
        this.router.navigate(['/news']);
      },
      (error: any) => {
        if (Array.isArray(error)) {
          this.errorMessage = error[error.length - 1];
        } else {
          this.errorMessage = 'Failed to add news article. Please try again.';
        }
      }
    );
  }
}
