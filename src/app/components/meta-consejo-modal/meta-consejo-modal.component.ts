import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-meta-consejo-modal',
  templateUrl: './meta-consejo-modal.component.html',
  styleUrls: ['./meta-consejo-modal.component.scss'],
  standalone: false
})
export class MetaConsejoModalComponent {
  @Input() meta: any;

  constructor(private modalCtrl: ModalController) {}

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
