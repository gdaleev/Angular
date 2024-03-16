import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsService } from 'src/app/information/news/news.service';
import { Router } from '@angular/router';


interface Article {
  _id: string;
  imgUrl: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class DetailsComponent implements OnInit{
  article!: Article;
  articleId!: string;
  isAuthenticated!: boolean;
  isAuthorized!: boolean;
  isFavoredByUser!: boolean;

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const articleId = params['id'];

      this.newsService.getNewsArticleDetails(articleId).subscribe((article) => {
        this.article = article.newsArticle;
        this.isAuthenticated = article.isAuthenticated;
        this.isAuthorized = article.isAuthorized;
        this.isFavoredByUser = article.isFavoredByUser;
      });
    });
  }

  addArticleToFavorites(): void {
    if (!this.article || !this.article._id) {
      console.error('Article ID is not available.');
      return;
    }

    this.newsService.addArticleToUserFavorites(this.article._id).subscribe(
      () => {
        console.log('Article added to favorites successfully');
        this.isFavoredByUser = true;
        // Optionally, update the component state or UI to reflect the change
      },
      (error) => {
        console.error('Error adding article to favorites', error);
        // Handle the error (show a message, log, etc.)
      }
    );
  }

  updateFavoriteStatus() {
    this.isFavoredByUser = true; // Assuming you have a property to track if the article is favorited by the user
  }

  deleteArticle(): void {
    this.newsService.deleteArticle(this.article._id).subscribe(() => {
      this.router.navigate(["/news"])
    })
  }
}
