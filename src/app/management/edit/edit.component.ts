import { Component, OnInit } from '@angular/core';
import { NewsService } from 'src/app/information/news/news.service';
import { ActivatedRoute, Router } from '@angular/router';

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
  errorMessage: string | null = null;

  constructor(
    private newsService: NewsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const articleId = params['id'];

      this.newsService.getArticleDataForEdit(articleId).subscribe((article) => {
        this.article = article.newsArticle;
      });
    });
  }

  postNewData(event: Event): void {
    event.preventDefault();
    this.newsService.updateArticle(this.article._id, this.article).subscribe(
      () => {
        this.router.navigate(['/news']);
      },
      (error: any) => {
        if (Array.isArray(error)) {
          this.errorMessage = error.join(', ');
        } else {
          this.errorMessage = 'Failed to add news article. Please try again.';
        }
      }
    );
  }
}
