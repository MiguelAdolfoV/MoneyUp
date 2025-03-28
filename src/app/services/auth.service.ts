import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _storage: Storage | null = null;
  private readonly API_URL = 'https://rest-api-sigma-five.vercel.app/api/auth';

  constructor(
    private storage: Storage,
    private http: HttpClient // 👈 importante importar
  ) {
    this.init();
  }

  async init() {
    this._storage = await this.storage.create();
  }

  // ✅ Método de login
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.API_URL}/signin`, { email, password });
  }

  // 🔐 Guardar sesión
  async saveSession(token: string, user: any): Promise<void> {
    await this._storage?.set('authToken', token);
    await this._storage?.set('user', user);
  }

  // 🔎 Obtener token
  async getToken(): Promise<string | null> {
    return await this._storage?.get('authToken');
  }

  // 👤 Obtener usuario
  async getUser(): Promise<any> {
    return await this._storage?.get('user');
  }

  // ✅ Verificar si está logueado
  async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  // 🔓 Logout
  async logout(): Promise<void> {
    await this._storage?.remove('authToken');
    await this._storage?.remove('user');
  }

// 🔖 Guardar metas
async saveMetas(metas: string[]): Promise<void> {
  await this._storage?.set('metas', metas);
}

// 🔎 Obtener metas
async getMetas(): Promise<string[]> {
  const stored = await this._storage?.get('metas');
  return stored || [];
}

// 👤 Registrar usuarios
register(username: string, email: string, password: string, roles: string[]): Observable<any> {
  const body = { username, email, password, roles };
  return this.http.post(`${this.API_URL}/signup`, body);
}

// 🔍 Guardar ingresos
async saveIngresos(data: any[]): Promise<void> {
  await this._storage?.set('ingresos', data);
}

// 🔍 Mostrar ingresos
async getIngresos(): Promise<any[]> {
  return (await this._storage?.get('ingresos')) || [];
}

}