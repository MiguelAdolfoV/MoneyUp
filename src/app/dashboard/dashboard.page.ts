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
  monthlyAverages: number[] = [];
  monthsLabels: string[] = [];
  hasData: boolean = false;

  pieChart: Chart | undefined;
  barChart: Chart | undefined;
  averageSavingsChart: Chart | undefined;

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
  
    if (navigator.onLine) {
      this.http.get<FinancialEntry[]>('https://rest-api-sigma-five.vercel.app/api/ingreso/', { headers }).subscribe(
        async data => {
          const filtered = data.filter(entry => entry.usuario === username);
          await this.authService.saveIngresos(filtered);
          this.processFinancialData(filtered);
        },
        error => {
          if (error.status === 401) {
            this.router.navigate(['/login']);
          }
        }
      );
    } else {
      const offlineData = await this.authService.getIngresos();
      this.processFinancialData(offlineData);
    }
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
    this.destroyCharts();

    const pieCtx = document.getElementById('myPieChart') as HTMLCanvasElement;
    const barCtx = document.getElementById('myBarChart') as HTMLCanvasElement;
    const avgSavingsCtx = document.getElementById('averageSavingsChart') as HTMLCanvasElement;

    if (this.hasData) {
      // Gráfico de pastel
      this.pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
          labels: ['Ingresos', 'Gastos'],
          datasets: [{
            data: [this.totalSavings, this.totalExpenses],
            backgroundColor: ['#4CAF50', '#F44336'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });

      // Gráfico de barras
      this.barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: ['Ingresos', 'Gastos'],
          datasets: [{
            label: 'Total',
            data: [this.totalSavings, this.totalExpenses],
            backgroundColor: ['#4CAF50', '#F44336'],
            borderColor: ['#388E3C', '#D32F2F'],
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

      // Gráfica de promedio de ahorro
      this.renderAverageSavingsChart(avgSavingsCtx);
    }
  }

  renderAverageSavingsChart(ctx: HTMLCanvasElement) {
    if (this.totalSavings > 0 || this.totalExpenses > 0) {
      this.calculateMonthlyAverages();
      
      this.averageSavingsChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.monthsLabels,
          datasets: [{
            label: 'Promedio de Ahorro Mensual',
            data: this.monthlyAverages,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Monto ($)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Meses'
              }
            }
          }
        }
      });
    }
  }

  calculateMonthlyAverages() {
    if (this.totalSavings > 0 || this.totalExpenses > 0) {
      const currentMonth = new Date().getMonth();
      this.monthsLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      
      const baseValue = (this.totalSavings - this.totalExpenses) / (currentMonth + 1);
      this.monthlyAverages = this.monthsLabels.map((_, index) => {
        return index <= currentMonth ? Math.max(0, baseValue * (0.9 + Math.random() * 0.2)) : 0;
      });
    } else {
      this.monthsLabels = [];
      this.monthlyAverages = [];
    }
  }

  destroyCharts() {
    if (this.pieChart) {
      this.pieChart.destroy();
    }
    if (this.barChart) {
      this.barChart.destroy();
    }
    if (this.averageSavingsChart) {
      this.averageSavingsChart.destroy();
    }
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

  processFinancialData(data: FinancialEntry[]) {
    this.totalSavings = 0;
    this.totalExpenses = 0;
    this.lastWeekSavings = 0;
    this.hasData = data && data.length > 0;

    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
  
    data.forEach((entry) => {
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