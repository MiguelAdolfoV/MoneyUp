import { Component, AfterViewInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavigationEnd, Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';

interface FinancialEntry {
  tipo: boolean;
  cantidad: number;
  fecha: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements AfterViewInit {
  totalSavings: number = 0;
  totalExpenses: number = 0;
  lastWeekSavings: number = 0;
  isModalOpen: boolean = false;
  showTips: boolean = false;
  consejos: string[] = [];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    Chart.register(...registerables);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd && event.url === '/dashboard') {
        this.loadData(); // Aquí llamas la función que refresca la información
      }
    });
  }

  ngAfterViewInit() {
    this.loadData();
    this.loadFinancialTips(); // Carga los consejos al iniciar
  }
  
  refreshData(event: any) {
    console.log("Refrescando datos...");
    this.loadData(); // Llama a la función que carga los datos
  
    setTimeout(() => {
      event.target.complete(); // Detiene el efecto de refresco
      console.log("Datos actualizados");
    }, 1500); // Simula un pequeño tiempo de espera
  }
  

  ionViewWillEnter() {
    console.log("Dashboard cargado");
    this.loadData(); // Se ejecuta cada vez que se muestra el dashboard
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
        this.totalSavings = 0;
        this.totalExpenses = 0;
        this.lastWeekSavings = 0;

        data.forEach((entry: FinancialEntry) => {
          if (entry.tipo) {  
            this.totalSavings += entry.cantidad;
          } else {  
            this.totalExpenses += entry.cantidad;
          }

          const entryDate = new Date(entry.fecha);
          const today = new Date();
          const lastWeek = new Date();
          lastWeek.setDate(today.getDate() - 7);  
          this.lastWeekSavings = 0;
        
          if (entryDate >= lastWeek) {
            this.lastWeekSavings += entry.cantidad;
          }
        });

        this.lastWeekSavings = this.totalSavings - this.totalExpenses;

        console.log('Total Ingresos:', this.totalSavings);
        console.log('Total Egresos:', this.totalExpenses);
        console.log('Ahorro Última Semana:', this.lastWeekSavings);

        this.createPieChart();
        this.createBarChart(this.totalSavings, this.totalExpenses);
      },
      error => {
        console.error('Error al cargar los datos de ingresos:', error);
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    );
  }

  loadFinancialTips() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No se encontró el token en el almacenamiento local.');
      this.router.navigate(['/login']);
      return;
    }
  
    const url = 'https://rest-api-sigma-five.vercel.app/api/ingreso/consejo';
    const username = localStorage.getItem('username');


    const headers = new HttpHeaders({
      'x-access-token': token,
      'Content-Type': 'application/json'
    });
  
    const body = {
      usuario: username 
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
  

  getRandomColor(): string {
    const r = Math.floor(Math.random() * 256); 
    const g = Math.floor(Math.random() * 256); 
    const b = Math.floor(Math.random() * 256); 
    const a = (Math.random() * 0.5 + 0.5).toFixed(2); // Opacidad (valor entre 0.5 y 1)
    return `rgba(${r}, ${g}, ${b}, ${a})`;  // Retorna en formato rgba
  }

  createPieChart() {
    const ctx = document.getElementById('myPieChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Ingresos', 'Gastos'],
        datasets: [{
          label: 'Ingresos y Gastos',
          data: [this.totalSavings, this.totalExpenses],
          backgroundColor: [
            this.getRandomColor(),  // Color aleatorio para cada segmento
            this.getRandomColor()
          ],
          hoverBackgroundColor: [
            this.getRandomColor(),  // Colores al pasar el ratón
            this.getRandomColor()
          ]
        }]
      }
    });
  }

  createBarChart(totalIncomes: number, totalExpenditures: number) {
    const ctx = document.getElementById('myBarChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Ingresos', 'Egresos'],
        datasets: [{
          label: 'Ingresos y Egresos',
          data: [totalIncomes, totalExpenditures],
          backgroundColor: [
            this.getRandomColor(),  // Colores aleatorios para las barras
            this.getRandomColor()
          ],
          borderColor: [
            this.getRandomColor(),  // Colores aleatorios para los bordes
            this.getRandomColor()
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  goToMetas() {
    this.router.navigate(['/metas']); 
  }
  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  toggleFinancialTips() {
    this.showTips = !this.showTips;
  }

  goToForm(type: string) {
    this.router.navigate(['/form'], { queryParams: { type } });
  }

  goToProfile() {
    this.router.navigate(['/perfil']);
  }
}
