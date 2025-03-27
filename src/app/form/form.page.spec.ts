import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormPage } from './form.page';

// Bloque de pruebas para el componente FormPage
describe('FormPage', () => {
  let component: FormPage;  // Variable que hace referencia al componente FormPage
  let fixture: ComponentFixture<FormPage>;  // Variable que permite interactuar con el componente en el test

  // Configuración previa a cada test
  beforeEach(() => {
    // Crear la instancia del componente y el fixture para interactuar con él
    fixture = TestBed.createComponent(FormPage);
    component = fixture.componentInstance;  // Asignamos la instancia del componente a la variable
    fixture.detectChanges();  // Detectar los cambios del componente para asegurarse de que se renderiza correctamente
  });

  // Test para verificar que el componente se crea correctamente
  it('should create', () => {
    expect(component).toBeTruthy();  // Comprobamos que el componente ha sido creado exitosamente
  });
});
