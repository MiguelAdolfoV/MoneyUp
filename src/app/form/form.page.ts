import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-form',
  templateUrl: './form.page.html',
  styleUrls: ['./form.page.scss'],
  standalone : false
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

  // Método para manejar el envío del formulario
  onSubmit() {
    const token = localStorage.getItem('authToken');  

    if (!token) {
      console.error('No se encontró el token en el almacenamiento local.');

      // Redirigir al login si no hay token
      this.router.navigate(['/login']);
      return;
    }

    // Preparar los datos de la transacción
    const transactionData = {
      usuario: 'cliente2',   
      tipo: this.type,      
      cantidad: this.amount,  
      descripcion: this.description  
    };

    // Establecer los encabezados de la solicitud con el token
    const headers = new HttpHeaders({
      'x-access-token': token 
    });

    // URL de la API
    const apiUrl = 'https://rest-api-sigma-five.vercel.app/api/ingreso/';

    // Realizar la solicitud POST
    this.http.post(apiUrl, transactionData, { headers }).subscribe(
      (response) => {
        // Respuesta exitosa
        console.log(`${this.type ? 'Ingreso' : 'Egreso'} registrado`, response);
        
        // Mostrar mensaje de éxito
        alert(`${this.type ? 'Ingreso' : 'Egreso'} registrado con éxito.`);
        
        // Redirigir al dashboard
        this.router.navigate(['/dashboard']);  
      },
      (error) => {
        // Manejo de errores
        console.error('Error al registrar transacción', error);
        
        // Mostrar mensaje de error
        alert('Ocurrió un error al registrar la transacción.');
      }
    );
  }
}
