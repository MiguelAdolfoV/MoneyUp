import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-metas',
  templateUrl: './metas.page.html',
  styleUrls: ['./metas.page.scss'],
  standalone: false
})
export class MetasPage {
  newMeta: string = '';
  metas: any[] = []; // ahora cada meta tiene: meta, consejo, usuario, etc.

  financialTips: any[] = [
    {
      title: "¡Para lograr esta meta, puedes vender productos caseros!",
      steps: [
        "1. Investiga qué productos tienen alta demanda en tu localidad, como chicharrones, tortillas, o galletas.",
        "2. Comienza con pequeñas producciones y ve aumentando conforme vayas recibiendo feedback.",
        "3. Vende a amigos, familiares y en mercados locales para hacer crecer tu clientela.",
        "4. Usa las redes sociales para promocionar tus productos y llegar a más personas."
      ]
    },
    {
      title: "¡Puedes empezar a ahorrar con un presupuesto mensual!",
      steps: [
        "1. Haz una lista de tus ingresos y egresos mensuales.",
        "2. Establece un monto fijo que ahorrarás cada mes, y haz que sea una prioridad.",
        "3. Usa aplicaciones de finanzas personales para mantener un control y evitar gastos innecesarios.",
        "4. Cada vez que te sientas tentado a gastar más, recuerda tu meta de ahorro."
      ]
    },
    {
      title: "¿Has considerado empezar un negocio en línea?",
      steps: [
        "1. Define qué producto o servicio quieres vender en línea. Puedes vender desde ropa hasta servicios de asesoría.",
        "2. Crea una tienda en plataformas como Etsy, MercadoLibre o Instagram.",
        "3. Usa publicidad pagada o marketing orgánico para llegar a más personas.",
        "4. Ofrece un excelente servicio al cliente y busca siempre mejorar tu producto."
      ]
    },
    {
      title: "Considera invertir en tu educación financiera",
      steps: [
        "1. Comienza a leer libros sobre finanzas personales y administración del dinero.",
        "2. Toma cursos en línea que te ayuden a mejorar tu capacidad para generar ingresos.",
        "3. Invierte en tu salud financiera, revisando tus hábitos de gasto y aprendizaje sobre inversiones.",
        "4. Practica lo aprendido y verás cómo poco a poco tus finanzas mejoran."
      ]
    }
  ];

  financialTip: any = {};
  isModalOpen: boolean = false;

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  async ionViewDidEnter() {
    await this.loadRemoteMetas();
  }

  async addMeta() {
    if (!this.newMeta.trim()) {
      this.presentToast('Por favor, ingresa una meta válida', 'warning');
      return;
    }

    const token = await this.authService.getToken();
    const user = await this.authService.getUser();
    const username = user?.username;
    const consejo = "Reducir gastos innecesarios y registrar los ingresos y egresos"; // o selecciona uno dinámico

    if (!token || !username) {
      this.presentToast('Sesión inválida', 'danger');
      return;
    }

    const metaPayload = {
      usuario: username,
      meta: this.newMeta.trim(),
      consejo
    };

    const headers = new HttpHeaders({
      'x-access-token': token,
      'Content-Type': 'application/json'
    });

    this.http.post('https://rest-api-sigma-five.vercel.app/api/ingreso/metas', metaPayload, { headers }).subscribe(
      async (res: any) => {
        this.newMeta = '';
        this.presentToast('Meta registrada correctamente');
        await this.loadRemoteMetas(); // 🔄 Recargar metas
      },
      (error) => {
        console.error(error);
        this.presentToast('Error al guardar la meta', 'danger');
      }
    );
  }

  async loadRemoteMetas() {
    const token = await this.authService.getToken();
    const user = await this.authService.getUser();
    const username = user?.username;
  
    if (!token || !username) {
      this.metas = [];
      return;
    }
  
    const headers = new HttpHeaders({
      'x-access-token': token
    });
  
    this.http.get<any[]>('https://rest-api-sigma-five.vercel.app/api/ingreso/metas', { headers }).subscribe(
      async (response) => {
        const metasFiltradas = response.filter(meta => meta.usuario === username);
        this.metas = metasFiltradas;
  
        // ✅ Guardar copia local en Ionic Storage
        await this.authService.saveMetas(this.metas);
      },
      async (error) => {
        console.error('Error al cargar metas desde la API:', error);
  
        // ⚠️ Cargar desde storage como respaldo
        this.metas = await this.authService.getMetas();
  
        this.presentToast('No se pudieron cargar metas en línea, mostrando copia local.', 'warning');
      }
    );
  }
  
  openTip(index: number) {
    this.financialTip = this.financialTips[Math.floor(Math.random() * this.financialTips.length)];
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
