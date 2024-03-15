import { Component, OnInit } from '@angular/core';
import { NewsService } from 'src/app/information/news/news.service';
import { ActivatedRoute } from '@angular/router';

interface Article {
  _id: string;
  imgUrl: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit {
  article!: Article;

  constructor(
    private newsService: NewsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const articleId = params['id'];

      this.newsService.getArticleDataForEdit(articleId).subscribe((article) => {
        this.article = article.newsArticle;
      });
    });
  }
}
