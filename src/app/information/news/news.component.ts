import { Component, OnInit } from '@angular/core';
import { NewsService } from '../news/news.service';

interface Article {
  imgUrl: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})

export class NewsComponent implements OnInit {
  articles!: any[];
  article!: Article;
  // articles: any[] = [];
  // newArticle: any = {};

  constructor(private newsService: NewsService) {}

  ngOnInit() {
    this.newsService.getNews().subscribe((articles) => {
      this.articles = articles;
    })
  }

  getNewsArticleDetails(articleId: string) {
    this.newsService.getNewsArticleDetails(articleId).subscribe((article) => {
      this.article = article.newsArticle;
    })
  }
}
