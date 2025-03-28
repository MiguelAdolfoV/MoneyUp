import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-form',
  templateUrl: './form.page.html',
  styleUrls: ['./form.page.scss'],
  standalone: false
})
export class FormPage implements OnInit {
  description: string = '';
  amount: number = 0;
  type: boolean = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['type'] === 'ingreso') {
        this.type = true;
      } else if (params['type'] === 'egreso') {
        this.type = false;
      }
    });
  }

  async onSubmit() {
    const token = await this.authService.getToken();
    const user = await this.authService.getUser();
    const username = user?.username;

    if (!token || !username) {
      this.presentToast('Sesión no válida. Redirigiendo...', 'danger');
      this.router.navigate(['/login']);
      return;
    }

    const transactionData = {
      usuario: username,
      tipo: this.type,
      cantidad: this.amount,
      descripcion: this.description
    };

    const headers = new HttpHeaders({ 'x-access-token': token });
    const apiUrl = 'https://rest-api-sigma-five.vercel.app/api/ingreso/';

    this.http.post(apiUrl, transactionData, { headers }).subscribe(
      async () => {
        await this.presentToast(`${this.type ? 'Ingreso' : 'Egreso'} registrado con éxito. 🎉`, 'success');
        this.router.navigate(['/dashboard']);
      },
      async error => {
        console.error('Error inesperado:', error);
        const customMessage = error?.error?.message;
        if (customMessage) {
          this.presentToast(customMessage);
        } else {
        }
      }
    );
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom',
      color,
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }
}
