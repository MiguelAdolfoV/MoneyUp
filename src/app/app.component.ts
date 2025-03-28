import { Component, Renderer2 } from '@angular/core';
import { ToastController } from '@ionic/angular';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent {
  isOnline: boolean = navigator.onLine;

  constructor(
    private renderer: Renderer2,
    private toastController: ToastController
  ) {
    this.monitorConnection();
  }

  monitorConnection() {
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    window.addEventListener('online', async () => {
      this.isOnline = true;
      await this.showOnlineToast();
    });
  }

  async showOnlineToast() {
    const toast = await this.toastController.create({
      message: '¡Conexión restaurada!',
      duration: 2000,
      color: 'success',
      position: 'bottom',
    });
    await toast.present();
  }
  
  startDrag(event: any, element: HTMLElement) {
    event.preventDefault();
  
    const isTouch = event.type === 'touchstart';
    const startX = isTouch ? event.touches[0].clientX : event.clientX;
    const startY = isTouch ? event.touches[0].clientY : event.clientY;
  
    const rect = element.getBoundingClientRect();
    const offsetX = startX - rect.left;
    const offsetY = startY - rect.top;
  
    const move = (e: any) => {
      const clientX = isTouch ? e.touches[0].clientX : e.clientX;
      const clientY = isTouch ? e.touches[0].clientY : e.clientY;
  
      let x = clientX - offsetX;
      let y = clientY - offsetY;
  
      const maxX = window.innerWidth - element.offsetWidth;
      const maxY = window.innerHeight - element.offsetHeight;
  
      // 🧱 Limitar dentro de la pantalla
      x = Math.max(0, Math.min(x, maxX));
      y = Math.max(0, Math.min(y, maxY));
  
      this.renderer.setStyle(element, 'left', `${x}px`);
      this.renderer.setStyle(element, 'top', `${y}px`);
    };
  
    const stop = () => {
      window.removeEventListener(isTouch ? 'touchmove' : 'mousemove', move);
      window.removeEventListener(isTouch ? 'touchend' : 'mouseup', stop);
    };
  
    window.addEventListener(isTouch ? 'touchmove' : 'mousemove', move);
    window.addEventListener(isTouch ? 'touchend' : 'mouseup', stop);
  }  
}
