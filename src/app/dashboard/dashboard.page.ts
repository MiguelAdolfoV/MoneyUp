import { Component, AfterViewInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

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

  constructor(private http: HttpClient, private router: Router) {}

  ngAfterViewInit() {
    this.loadData();
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
      },
      error => {
        console.error('Error al cargar los datos de ingresos:', error);
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    );
  }
}
