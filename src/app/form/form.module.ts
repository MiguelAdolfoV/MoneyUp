import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FormPageRoutingModule } from './form-routing.module';

import { FormPage } from './form.page';

@NgModule({
  imports: [
    // Módulo común que proporciona directivas y servicios comunes de Angular
    CommonModule,
    // Módulo necesario para trabajar con formularios en Angular
    FormsModule,
    // Módulo necesario para trabajar con componentes de Ionic
    IonicModule,
    // Módulo que maneja las rutas específicas de esta página
    FormPageRoutingModule
  ],
  declarations: [
    // Declaración del componente 'FormPage' que pertenece a este módulo
    FormPage
  ]
})
export class FormPageModule {}
