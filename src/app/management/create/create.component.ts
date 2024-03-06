import { Component } from '@angular/core';
import { NewsService } from '../../information/news/news.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
  providers: [NewsService]
})

export class CreateComponent {
  articles: any[] = [];
  newArticle: any = {};
  
  constructor(private newsService: NewsService) {}

  addNewsArticle() {
    this.newsService.addNewsArticle(this.newArticle).subscribe((article: any) => {
      if (this.articles === undefined) {
        this.articles = []
      } 
      this.articles.push(article);
      this.newArticle = {};
    })
  }
}
