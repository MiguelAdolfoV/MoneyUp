import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const isLoggedIn = await this.authService.isLoggedIn();

    if (isLoggedIn) {
      const user = await this.authService.getUser();
      const username = user?.username || 'usuario';

      const toast = await this.toastController.create({
        message: `Sesión previamente iniciada como ${username}.`,
        duration: 2000,
        color: 'warning',
        position: 'bottom'
      });
      await toast.present();

      return this.router.parseUrl('/dashboard');
    }

    return true;
  }
}
