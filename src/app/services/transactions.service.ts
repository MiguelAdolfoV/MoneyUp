import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private apiUrl = 'http://localhost:3000/api/transactions'; 

  constructor(private http: HttpClient) {}

  registerTransaction(transactionData: any): Observable<any> {
    return this.http.post(this.apiUrl, transactionData);
  }
}
