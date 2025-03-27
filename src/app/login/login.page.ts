// src/app/login/login.page.ts

import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string = '';
  password: string = '';
  loading: boolean = false;  // Para mostrar un indicador de carga

  constructor(private authService: AuthService, private router: Router) {}

  // Método para manejar el submit del formulario de login
  onSubmit() {
    if (!this.email || !this.password) {
      alert('Por favor ingresa tanto el correo electrónico como la contraseña.');
      return;
    }

    this.loading = true;

    this.authService.login(this.email, this.password).subscribe(
      (response: any) => {
        const token = response.token;
        const userId = response.id;

        if (token) {
          // Guardar el token en localStorage
          localStorage.setItem('authToken', token);  // Guardar el token
          localStorage.setItem('userId', userId);    // Guardar el ID de usuario

          console.log('Token guardado en localStorage:', token); // Verificar en consola

          // Redirigir al dashboard
          this.router.navigate(['/dashboard']);
        } else {
          alert('Error: no se recibió un token.');
        }
      },
      (error) => {
        this.loading = false;
        console.error('Error en el inicio de sesión', error);
        if (error.status === 401) {
          alert('Credenciales incorrectas, por favor intenta de nuevo.');
        } else {
          alert('Hubo un error con el servidor. Por favor, intenta más tarde.');
        }
      }
    );
  }

  // Redirigir a la página de registro
  goToRegister() {
    this.router.navigate(['/register']);
  }
}

