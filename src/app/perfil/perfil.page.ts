import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false
})
export class PerfilPage implements OnInit {
  userData: any = null;
  transacciones: any[] = [];

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    this.userData = await this.authService.getUser();
    if (this.userData) {
      this.loadTransacciones();
    }
  }

  async loadTransacciones() {
    const token = await this.authService.getToken();
    const username = this.userData.username;

    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });

    this.http.get<any[]>('https://rest-api-sigma-five.vercel.app/api/ingreso/', { headers }).subscribe(
      (response) => {
        // Filtrar por nombre de usuario
        this.transacciones = response.filter(t => t.usuario === username);
      },
      (error) => {
        console.error('Error al obtener transacciones', error);
      }
    );
  }
}
