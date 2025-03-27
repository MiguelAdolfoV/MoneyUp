import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormPage } from './form.page';

// Definición de las rutas para este módulo
const routes: Routes = [
  {
    path: '',
    component: FormPage  // Componente que se muestra cuando se accede a esta ruta
  }
];

@NgModule({
  imports: [
    // Configuración de rutas para este módulo
    RouterModule.forChild(routes)
  ],
  exports: [
    // Exportamos RouterModule para que se pueda usar en otros módulos
    RouterModule
  ],
})
export class FormPageRoutingModule {}
