import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false
})
export class PerfilPage implements OnInit {
  userData: any = null;
  transacciones: any[] = [];

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    this.userData = await this.authService.getUser();
    if (this.userData) {
      this.loadTransaccionesDesdeStorage();
    }
  }

  async loadTransaccionesDesdeStorage() {
    const username = this.userData.username;
    const ingresosGuardados = await this.authService.getIngresos();

    // Filtrar por usuario actual
    this.transacciones = ingresosGuardados.filter(t => t.usuario === username);
  }
}
