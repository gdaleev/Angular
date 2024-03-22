import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private apiUrl = 'http://localhost:3000/api/news';

  constructor(private http: HttpClient) {}

  getNews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  addNewsArticle(news: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, news, { withCredentials: true })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 400 && error.error && Array.isArray(error.error.error)) {
            return throwError(error.error.error); 
          } else {
            return throwError('Failed to add news article. Please try again.');
          }
        })
      );
  }

  getNewsArticleDetails(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/details/${id}`, { withCredentials: true })
      .pipe(catchError((error) => throwError(error)));
  }

  addArticleToUserFavorites(articleId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/favorites/${articleId}`,{}, {withCredentials: true})
  }

  getFavoriteArticles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/favorites`, {withCredentials: true})
  }

  getArticleDataForEdit(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/edit/${id}`, {withCredentials: true})
  }

  updateArticle(id: string, article: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/edit/${id}`, article, {withCredentials: true}).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400 && error.error && Array.isArray(error.error.error)) {
          return throwError(error.error.error);
        } else {
          return throwError('Failed to update news article. Please try again.');
        }
      })
    );
  }

  deleteArticle(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`, {withCredentials: true})
  }
}
