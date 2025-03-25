import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  userData: { name: string; email: string; password: string; photoUrl?: string } = { name: '', email: '', password: '' };
  
  constructor(
    private http: HttpClient,
    private alertCtrl: AlertController,
    private storage: Storage,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  // Cargar los datos del usuario desde la API o almacenamiento local
  async loadUserData() {
    const token = await this.storage.get('token'); 
    if (token) {
      this.http.get('https://rest-api-sigma-five.vercel.app/api/auth/user', {
        headers: { 'Authorization': `Bearer ${token}` },
      }).subscribe((data: any) => {
        this.userData = data;
      });
    }
  }
}