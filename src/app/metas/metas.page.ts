import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-metas',
  templateUrl: './metas.page.html',
  styleUrls: ['./metas.page.scss'],
})
export class MetasPage {
  
  newMeta: string = ''; // Variable para la nueva meta
  metas: string[] = []; // Arreglo para almacenar las metas
  financialTips: any[] = [ // Consejos financieros predefinidos con tácticas detalladas
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
  financialTip: any = {}; // Consejo seleccionado
  isModalOpen: boolean = false; // Estado del modal

  constructor(private modalController: ModalController, private toastController: ToastController) {}

  // Función para mostrar un toast
  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000, // Duración en milisegundos
      position: 'bottom',
      color: color // 'success', 'danger', 'warning', etc.
    });
    await toast.present();
  }

   // Función para agregar una meta
   addMeta() {
    if (this.newMeta.trim()) {
      // Agregar la meta al arreglo
      this.metas.push(this.newMeta.trim());
      this.newMeta = ''; // Limpiar el input
      // Guardar las metas en localStorage para persistencia
      localStorage.setItem('metas', JSON.stringify(this.metas));

      // Mostrar mensaje de éxito
      this.presentToast('Meta creada exitosamente ');
    } else {
      this.presentToast('Por favor, ingresa una meta válida', 'warning');
    }
  }

   // Función para abrir el modal con el consejo
   openTip(index: number) {
    this.financialTip = this.financialTips[Math.floor(Math.random() * this.financialTips.length)];
    this.isModalOpen = true; // Abrir el modal
  }

}