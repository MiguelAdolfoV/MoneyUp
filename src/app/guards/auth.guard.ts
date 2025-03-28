import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const isLoggedIn = await this.authService.isLoggedIn();

    if (isLoggedIn) {
      return true; // ✅ Usuario logueado, permitir acceso
    } else {
      return this.router.parseUrl('/login'); // 🚫 Redirigir a login si no hay sesión
    }
  }
}
