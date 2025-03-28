import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular'; // 👈 También importamos LoadingController

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    // ✅ Verifica si el usuario ya está logueado
    const isLoggedIn = await this.authService.isLoggedIn();
    if (isLoggedIn) {
      this.router.navigate(['/dashboard']);
      return;
    }
  
    // ✅ Si no está logueado, muestra el formulario
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$')
      ]],
    });
  }
  

  // ✅ Mostrar spinner de carga
  async presentLoading(message: string = 'Creando cuenta...') {
    const loading = await this.loadingController.create({
      message,
      spinner: 'crescent',
      cssClass: 'custom-loading',
      backdropDismiss: false
    });
    await loading.present();
    return loading;
  }

  // ✅ Enviar formulario con spinner
  async onSubmit() {
    if (this.registerForm.valid) {
      const { username, email, password } = this.registerForm.value;
      const roles = ['customer'];

      const loading = await this.presentLoading();

      this.authService.register(username, email, password, roles).subscribe(
        async response => {
          await loading.dismiss();
          console.log('Registro exitoso', response);
          this.router.navigate(['/login']);
        },
        async error => {
          await loading.dismiss();
          console.error('Error en el registro', error);
          
          const errorMessage = error?.error?.message || 'Error inesperado. Intenta de nuevo.';
          await this.presentToast(errorMessage);
        }
      );
    } else {
      console.log('Formulario inválido');
      this.registerForm.markAllAsTouched();

      if (this.username?.invalid) this.shakeField('username');
      if (this.email?.invalid) this.shakeField('email');
      if (this.password?.invalid) this.shakeField('password');
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

  shakeField(field: string) {
    const element = document.querySelector(`ion-item.${field}`);
    if (element) {
      element.classList.add('shake');
      setTimeout(() => {
        element.classList.remove('shake');
      }, 400);
    }
  }

  get username() {
    return this.registerForm.get('username');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
