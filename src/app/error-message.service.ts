// error-message.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorMessageService {
  private errorMessageSubject = new BehaviorSubject<string>('');

  errorMessage$ = this.errorMessageSubject.asObservable();

  setErrorMessage(message: string) {
    this.errorMessageSubject.next(message);
  }
}
