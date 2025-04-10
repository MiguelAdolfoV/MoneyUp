import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MetaConsejoModalComponent } from '../components/meta-consejo-modal/meta-consejo-modal.component';

@Component({
  selector: 'app-metas',
  templateUrl: './metas.page.html',
  styleUrls: ['./metas.page.scss'],
  standalone: false
  
})
export class MetasPage {
  newMeta: string = '';
  metas: any[] = [];

  constructor(
    private toastController: ToastController,
    private modalController: ModalController,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  async ionViewDidEnter() {
    await this.loadRemoteMetas();
  }

  async addMeta() {
    if (!this.newMeta.trim()) {
      this.presentToast('Por favor, ingresa una meta válida', 'warning');
      return;
    }

    const token = await this.authService.getToken();
    const user = await this.authService.getUser();
    const username = user?.username;

    if (!token || !username) {
      this.presentToast('Sesión inválida', 'danger');
      return;
    }

    const metaPayload = {
      usuario: username,
      meta: this.newMeta.trim()
    };

    const headers = new HttpHeaders({
      'x-access-token': token,
      'Content-Type': 'application/json'
    });

    this.http.post('https://rest-api-sigma-five.vercel.app/api/ingreso/metas', metaPayload, { headers }).subscribe(
      async (res: any) => {
        this.newMeta = '';
        this.presentToast('Meta registrada correctamente');
        await this.loadRemoteMetas();
      },
      async error => {
        console.error('Error al guardar la meta', error);
        const customMessage = error?.error?.message;
        if (customMessage) {
          this.presentToast(customMessage);
        }
      }
    );
  }

  async loadRemoteMetas() {
    const token = await this.authService.getToken();
    const user = await this.authService.getUser();
    const username = user?.username;

    if (!token || !username) {
      this.metas = [];
      return;
    }

    const headers = new HttpHeaders({
      'x-access-token': token
    });

    this.http.get<any[]>('https://rest-api-sigma-five.vercel.app/api/ingreso/metas', { headers }).subscribe(
      async (response) => {
        const metasFiltradas = response.filter(meta => meta.usuario === username);
        this.metas = metasFiltradas;

        await this.authService.saveMetas(this.metas);
      },
      async (error) => {
        console.error('Error al cargar metas desde la API:', error);
        this.metas = await this.authService.getMetas();
        this.presentToast('No se pudieron cargar metas en línea, mostrando copia local.', 'warning');
      }
    );
  }

  async openTip(index: number) {
    const modal = await this.modalController.create({
      component: MetaConsejoModalComponent,
      componentProps: {
        meta: this.metas[index]
      }
    });
    await modal.present();
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
