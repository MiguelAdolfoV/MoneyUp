import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../services/auth.service';
import { AlertController } from '@ionic/angular'; 

interface FinancialEntry {
  tipo: boolean;
  cantidad: number;
  fecha: string;
  usuario: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage {
  totalSavings: number = 0;
  totalExpenses: number = 0;
  lastWeekSavings: number = 0;
  showTips: boolean = false;
  consejos: string[] = [];

  pieChart: Chart | undefined;
  barChart: Chart | undefined;

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private authService: AuthService
  ) {
    Chart.register(...registerables);
  }

  ionViewWillEnter() {
    this.loadData();
    this.loadFinancialTips();
  }

  refreshData(event: any) {
    this.loadData();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }

  async loadData() {
    const token = await this.authService.getToken();
    const user = await this.authService.getUser();
    const username = user?.username;

    if (!token || !username) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({ 'x-access-token': token });

    this.http.get<FinancialEntry[]>('https://rest-api-sigma-five.vercel.app/api/ingreso/', { headers }).subscribe(
      data => {
        this.totalSavings = 0;
        this.totalExpenses = 0;
        this.lastWeekSavings = 0;

        const today = new Date();
        const lastWeek = new Date();
        lastWeek.setDate(today.getDate() - 7);

        // 🔎 Filtrar datos del usuario actual
        const filteredData = data.filter(entry => entry.usuario === username);

        filteredData.forEach((entry) => {
          const entryDate = new Date(entry.fecha);
          if (entry.tipo) {
            this.totalSavings += entry.cantidad;
            if (entryDate >= lastWeek) {
              this.lastWeekSavings += entry.cantidad;
            }
          } else {
            this.totalExpenses += entry.cantidad;
          }
        });

        this.lastWeekSavings = this.totalSavings - this.totalExpenses;

        this.renderCharts();
      },
      error => {
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    );
  }

  async loadFinancialTips() {
    const token = await this.authService.getToken();
    const user = await this.authService.getUser();
    const username = user?.username;

    if (!token || !username) {
      this.router.navigate(['/login']);
      return;
    }

    const url = 'https://rest-api-sigma-five.vercel.app/api/ingreso/consejo';

    const headers = new HttpHeaders({
      'x-access-token': token,
      'Content-Type': 'application/json'
    });

    const body = { usuario: username };

    this.http.post(url, body, { headers }).subscribe(
      (response: any) => {
        if (response?.consejo) {
          this.consejos = [response.consejo];
        } else if (Array.isArray(response?.consejos)) {
          this.consejos = response.consejos;
        } else {
          this.consejos = [];
        }
      },
      () => {
        this.consejos = [];
      }
    );
  }

  renderCharts() {
    if (this.pieChart) {
      this.pieChart.destroy();
    }

    if (this.barChart) {
      this.barChart.destroy();
    }

    const pieCtx = document.getElementById('myPieChart') as HTMLCanvasElement;
    const barCtx = document.getElementById('myBarChart') as HTMLCanvasElement;

    this.pieChart = new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: ['Ingresos', 'Gastos'],
        datasets: [{
          label: 'Ingresos y Gastos',
          data: [this.totalSavings, this.totalExpenses],
          backgroundColor: [this.getRandomColor(), this.getRandomColor()]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    this.barChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: ['Ingresos', 'Egresos'],
        datasets: [{
          label: 'Ingresos y Egresos',
          data: [this.totalSavings, this.totalExpenses],
          backgroundColor: [this.getRandomColor(), this.getRandomColor()],
          borderColor: [this.getRandomColor(), this.getRandomColor()],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  getRandomColor(): string {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const a = (Math.random() * 0.5 + 0.5).toFixed(2);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  toggleFinancialTips() {
    this.showTips = !this.showTips;
  }
  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar sesión',
          role: 'destructive',
          handler: async () => {
            await this.authService.logout();
            this.router.navigateByUrl('/login', { replaceUrl: true });
          }
        }
      ]
    });
  
    await alert.present();
  }  

  goToForm(type: string) {
    this.router.navigate(['/form'], { queryParams: { type } });
  }

  goToProfile() {
    this.router.navigate(['/perfil']);
  }

  goToMetas() {
    this.router.navigate(['/metas']);
  }
}
