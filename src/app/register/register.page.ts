import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';  // Importar ReactiveFormsModule y Validators
import { AuthService } from '../services/auth.service';  // Asegúrate de importar tu servicio de autenticación
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {
  // Usamos el operador "!" para asegurarle a TypeScript que la propiedad será inicializada más tarde.
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,  // FormBuilder para crear el formulario
    private authService: AuthService,  // Servicio de autenticación
    private router: Router  // Router para redirigir
  ) {}

  ngOnInit() {
    // Crear el formulario con validaciones
    this.registerForm = this.fb.group({
      username: ['', Validators.required],  // Validación para el nombre de usuario
      email: ['', [Validators.required, Validators.email]],  // Validación para el email
      password: ['', [
        Validators.required,
        Validators.minLength(6),  // La contraseña debe tener al menos 6 caracteres
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$')  // Validación para contraseña segura
      ]],
    });
  }

  // Método para enviar el formulario
  onSubmit() {
    if (this.registerForm.valid) {
      const { username, email, password } = this.registerForm.value;  // Obtener los valores del formulario
      const roles = ['customer'];  // Define los roles del usuario

      this.authService.register(username, email, password, roles).subscribe(
        response => {
          console.log('Registro exitoso', response);
          this.router.navigate(['/login']);  // Redirige a la página de login después de registrarse
        },
        error => {
          console.error('Error en el registro', error);
          alert('Hubo un error al registrar tu cuenta, por favor intenta de nuevo.');
        }
      );
    } else {
      console.log('Formulario inválido');
      this.registerForm.markAllAsTouched();  // Marcar todos los campos como tocados para mostrar los errores
    }
  }

  // Método para redirigir al login
  goToLogin() {
    this.router.navigate(['/login']);
  }

  // Métodos convenientes para acceder a los campos
  get username() {
    return this.registerForm.get('username');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }
}
