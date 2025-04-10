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
  filteredTransacciones: any[] = [];

  filtroSeleccionado = 'all';
  ordenMonto = 'ninguno';
  fechaSeleccionada: string | null = null;
  mostrarCalendario: boolean = false;

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    this.userData = await this.authService.getUser();
    if (this.userData) {
      await this.loadTransaccionesDesdeStorage();
      this.aplicarFiltro();
    }
  }

  async loadTransaccionesDesdeStorage() {
    const username = this.userData.username;
    const ingresosGuardados = await this.authService.getIngresos();
    this.transacciones = ingresosGuardados.filter(t => t.usuario === username);
  }

  aplicarFiltro() {
    let resultado = [...this.transacciones];

    // Filtro por tipo
    if (this.filtroSeleccionado === 'ingresos') {
      resultado = resultado.filter(t => t.tipo === true);
    } else if (this.filtroSeleccionado === 'gastos') {
      resultado = resultado.filter(t => t.tipo === false);
    }

    // Filtro por fecha
    if (this.fechaSeleccionada) {
      const fechaFiltro = new Date(this.fechaSeleccionada).toDateString();
      resultado = resultado.filter(t => new Date(t.createdAt).toDateString() === fechaFiltro);

      // Ocultar el calendario después de seleccionar
      this.mostrarCalendario = false;
    }

    // Ordenar por monto
    if (this.ordenMonto === 'mayor') {
      resultado.sort((a, b) => b.cantidad - a.cantidad);
    } else if (this.ordenMonto === 'menor') {
      resultado.sort((a, b) => a.cantidad - b.cantidad);
    }

    this.filteredTransacciones = resultado;
  }

  limpiarFecha() {
    this.fechaSeleccionada = null;
    this.aplicarFiltro();
  }
}
