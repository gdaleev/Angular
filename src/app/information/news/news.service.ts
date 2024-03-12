import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = 'http://localhost:3000/api/news';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getNews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  addNewsArticle(news: any): Observable<any> {
    const headers = this.authService.getAuthorizationHeader();
    return this.http.post<any>(`${this.apiUrl}`, news, {withCredentials: true}).pipe(
      catchError((error) => throwError(error))
    );
  }
}
