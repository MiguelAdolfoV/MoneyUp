import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {
  showPassword: boolean = false;
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    const isLoggedIn = await this.authService.isLoggedIn();
    if (isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }
  }  

  async presentLoading(message: string = 'Iniciando sesión...') {
    const loading = await this.loadingController.create({
      message,
      spinner: 'crescent',
      cssClass: 'custom-loading',
      backdropDismiss: false
    });
    await loading.present();
    return loading;
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.presentToast('Por favor ingresa tanto el correo electrónico como la contraseña.');
      return;
    }

    this.presentLoading().then((loading) => {
      this.authService.login(this.email, this.password).subscribe(
        async (response: any) => {
          loading.dismiss();

          const token = response.token;
          const user = response.user;

          if (token && user) {
            await this.authService.saveSession(token, user);

            (document.activeElement as HTMLElement)?.blur();

            this.router.navigate(['/dashboard']);
          } else {
            this.presentToast('Error: datos de sesión incompletos.');
          }
        },
        (error: { error: { message: any }; status: number }) => {
          loading.dismiss();
          console.error('Error en el inicio de sesión', error);

          const customMessage = error?.error?.message;

          if (customMessage) {
            this.presentToast(customMessage);
          } else if (error.status === 401) {
            this.presentToast('Credenciales incorrectas, por favor intenta de nuevo.');
          } else {
          }
        }
      );
    });
  }
  
    // Eliminar espacios al escribir o pegar texto
  onInputSanitize(field: 'email' | 'password') {
    if (field === 'email') {
      this.email = this.email.replace(/\s/g, '');
    } else if (field === 'password') {
      this.password = this.password.replace(/\s/g, '');
    }
  }

  // Prevenir escribir espacios desde el teclado
  preventSpace(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
      this.presentToast('No se permiten espacios en este campo.');
    }
  }


  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      buttons: [
        {
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}