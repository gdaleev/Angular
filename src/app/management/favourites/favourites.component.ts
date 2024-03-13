import { Component, OnInit } from '@angular/core';
import { NewsService } from 'src/app/information/news/news.service';

interface Article {
  imgUrl: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.css']
})
export class FavouritesComponent implements OnInit{
  articles!: any[]
  article!: Article;

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.newsService.getFavoriteArticles().subscribe((articles) => {
      this.articles = articles
    })
  }

  getNewsArticleDetails(articleId: string) {
    this.newsService.getNewsArticleDetails(articleId).subscribe((article) => {
      this.article = article.newsArticle;
    })
  }
}
