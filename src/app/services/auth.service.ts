// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://rest-api-sigma-five.vercel.app/api/auth'; // Cambia esta URL por la de tu API

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/signin`, { email, password });
  }

  register(username: string, email: string, password: string, roles: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, { username, email, password, roles });
  }
}