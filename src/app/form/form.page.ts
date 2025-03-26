import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-form',
  templateUrl: './form.page.html',
  styleUrls: ['./form.page.scss'],
})
export class FormPage implements OnInit {
  description: string = ''; 
  amount: number = 0;        
  type: boolean = true;     

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['type'] === 'ingreso') {
        this.type = true;
      } else if (params['type'] === 'egreso') {
        this.type = false;
      }
    });
  }


  onSubmit() {
    const token = localStorage.getItem('authToken');  

    if (!token) {
      console.error('No se encontró el token en el almacenamiento local.');

      this.router.navigate(['/login']);
      return;
    }

    const transactionData = {
      usuario: 'cliente2',   
      tipo: this.type,      
      cantidad: this.amount,  
      descripcion: this.description  
    };

    const headers = new HttpHeaders({
      'x-access-token': token 
    });


    const apiUrl = 'https://rest-api-sigma-five.vercel.app/api/ingreso/';
    

    this.http.post(apiUrl, transactionData, { headers }).subscribe(
      (response) => {
        console.log(`${this.type ? 'Ingreso' : 'Egreso'} registrado`, response);
        
        alert(`${this.type ? 'Ingreso' : 'Egreso'} registrado con éxito.`);
        this.router.navigate(['/dashboard']);  
      },
      (error) => {
        console.error('Error al registrar transacción', error);
        alert('Ocurrió un error al registrar la transacción.');
      }
    );
  }
}