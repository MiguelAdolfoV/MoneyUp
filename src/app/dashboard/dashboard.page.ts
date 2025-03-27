import { Component, AfterViewInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';

interface FinancialEntry {
  tipo: boolean;
  cantidad: number;
  fecha: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements AfterViewInit {
  totalSavings: number = 0;
  totalExpenses: number = 0;
  lastWeekSavings: number = 0;
  consejos: string[] = [];
  showTips: boolean = false;

  private pieChart: any;
  private barChart: any;

  constructor(private http: HttpClient, private router: Router) {}

  ngAfterViewInit() {
    this.loadData();
    this.loadFinancialTips();
  }

  loadData() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No se encontró el token en el almacenamiento local.');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({ 'x-access-token': token });

    this.http.get<FinancialEntry[]>('https://rest-api-sigma-five.vercel.app/api/ingreso/', { headers }).subscribe(
      data => {
        let totalIncomes = 0;
        let totalExpenditures = 0;
        let lastWeekIncomes = 0;

        data.forEach((entry: FinancialEntry) => {
          if (entry.tipo) {  
            totalIncomes += entry.cantidad;
          } else {  
            totalExpenditures += entry.cantidad;
          }

          const entryDate = new Date(entry.fecha);
          const today = new Date();
          const lastWeek = new Date();
          lastWeek.setDate(today.getDate() - 7);  
        
          if (entryDate >= lastWeek) {
            lastWeekIncomes += entry.cantidad;
          }
        });

        this.totalSavings = totalIncomes - totalExpenditures;
        this.totalExpenses = totalExpenditures;
        this.lastWeekSavings = lastWeekIncomes - totalExpenditures;

        this.createPieChart(totalIncomes, totalExpenditures);
        this.createBarChart(data);
      },
      error => {
        console.error('Error al cargar los datos de ingresos:', error);
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    );
  }

  createPieChart(income: number, expenses: number) {
    const ctx = document.getElementById('pieChart') as HTMLCanvasElement;
    if (this.pieChart) {
      this.pieChart.destroy();
    }
    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Ingresos', 'Gastos'],
        datasets: [{
          data: [income, expenses],
          backgroundColor: [this.getRandomColor(), this.getRandomColor()],
        }]
      },
      options: {
        responsive: true
      }
    });
  }

  createBarChart(data: FinancialEntry[]) {
    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    if (this.barChart) {
      this.barChart.destroy();
    }
  
    const categories: { [key: string]: number } = {};

    data.forEach(entry => {
      const key = entry.tipo ? 'Ingresos' : 'Gastos';
      categories[key] = (categories[key] || 0) + entry.cantidad;
    });

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(categories),
        datasets: [{
          label: 'Distribución Financiera',
          data: Object.values(categories),
          backgroundColor: Object.keys(categories).map(() => this.getRandomColor()),
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
  loadFinancialTips() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No se encontró el token en el almacenamiento local.');
      this.router.navigate(['/login']);
      return;
    }
  
    const url = 'https://rest-api-sigma-five.vercel.app/api/ingreso/consejo';

    const headers = new HttpHeaders({
      'x-access-token': token,
      'Content-Type': 'application/json'
    });
  
    const body = {
      usuario: 'cliente2' 
    };

    this.http.post(url, body, { headers }).subscribe(
      (response: any) => {
        console.log('Consejos recibidos:', response);

        if (response && response.consejo) {
          this.consejos = [response.consejo];
          console.log('Consejos procesados:', this.consejos);
        } else if (response && response.consejos && Array.isArray(response.consejos)) {
          this.consejos = response.consejos;
          console.log('Consejos procesados:', this.consejos);
        } else {
          console.log('No se encontraron consejos en la respuesta.');
          this.consejos = [];
        }
      },
      (error) => {
        console.error('Error al obtener los consejos:', error);
        alert('Hubo un error al cargar los consejos. Por favor, intenta más tarde.');
        this.consejos = [];
      }
    );
  }

  toggleFinancialTips() {
    this.showTips = !this.showTips;
  }

  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  goToMetas() {
    this.router.navigate(['/metas']); 
  }
  
  goToForm(type: string) {
    this.router.navigate(['/form'], { queryParams: { type } });
  }
  
  goToProfile() {
    this.router.navigate(['/perfil']);
  }
  
}
