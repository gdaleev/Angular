import { Component, OnInit } from '@angular/core';
import { NewsService } from '../news/news.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})

export class NewsComponent implements OnInit {
  articles!: any[];
  // articles: any[] = [];
  // newArticle: any = {};

  constructor(private newsService: NewsService) {}

  ngOnInit() {
    this.newsService.getNews().subscribe((articles) => {
      this.articles = articles;
    })
  }

  // addNewsArticle() {
  //   this.newsService.addNewsArticle(this.newArticle).subscribe((article) => {
  //     this.articles.push(article);
  //     this.newArticle = {};
  //   })
  // }
}
