import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ToastController } from '@ionic/angular';

@Injectable()
export class NetworkInterceptor implements HttpInterceptor {
  constructor(private toastController: ToastController) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!navigator.onLine) {
      if (req.method === 'POST') {
        this.showOfflineToast(); // ✅ Solo mostramos toast en POST
      }

      // ⛔️ Siempre bloqueamos si no hay conexión
      return throwError(() => new Error('Sin conexión a internet'));
    }

    return next.handle(req);
  }

  async showOfflineToast() {
    const toast = await this.toastController.create({
      message: `Estas fuera de linea, algunas funciones no están disponibles.`,
      duration: 3000,
      color: 'warning',
      position: 'bottom'
    });
    await toast.present();
  }
}
