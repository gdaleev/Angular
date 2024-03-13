import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsService } from 'src/app/information/news/news.service';

interface Article {
  imgUrl: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent {
  article!: Article;
  isAuthenticated!: boolean;
  isAuthorized!: boolean;
  constructor(private route: ActivatedRoute, private newsService: NewsService) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const articleId = params['id']

      this.newsService.getNewsArticleDetails(articleId).subscribe((article) => {
        this.article = article.newsArticle;
        this.isAuthenticated = article.isAuthenticated
        this.isAuthorized = article.isAuthorized
      })
    })
  }
}
