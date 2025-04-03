import { Component, OnInit } from '@angular/core';
import { IonPicker, IonPickerColumn, IonSelect, IonSelectOption, IonPickerColumnOption, IonTitle, IonContent, IonButton, IonIcon, IonItem, IonModal, IonImg, IonText, IonToast, IonAlert } from '@ionic/angular/standalone';
import { BarcodeScanningModalComponent } from "../../../../modules/barcode-scanning-modal.component";
import { addIcons } from 'ionicons';
import { eyeOutline, addOutline, removeOutline } from 'ionicons/icons';
import { ApiService } from '@app/core/services/api/api.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-descongelar',
  imports: [IonAlert, IonToast, IonText, IonImg, IonModal, IonItem, FormsModule, IonIcon, IonButton, IonContent, IonSelect, IonSelectOption, IonTitle, IonPicker, IonPickerColumn, IonPickerColumnOption, BarcodeScanningModalComponent],
  templateUrl: './descongelar.component.html',
  styleUrls: ['./descongelar.component.scss'],
})
export class DescongelarComponent implements OnInit {
  public data: any;
  public results: any;
  product: any;
  img: any;
  date: Date = new Date();
  qt = 1;

  async ngOnInit() {
    // Verificar inmediatamente al iniciar
    this.getCongelados();
    this.route.queryParams.subscribe(params => {
      this.product = params['producto'];

      // Parse date from query params if exists
      if (params['fc_envase']) {
        const [day, month, year] = params['fc_envase'].split('-').map(Number);
        this.date = new Date(year, month - 1, day);
      }
    });
  }

  async goPrint() {
    const formattedDate = this.formatDate(this.date);
    this.api.printDescongecion(this.product, formattedDate).then((result: any) => {
      this.product = null;
    }).catch((err: any) => {
      // Handle error
    });
  }

  newDescongelado() {
    this.router.navigate([], {
      queryParams: { producto: this.product },
      queryParamsHandling: 'merge'
    });

    this.updateDateInQueryParams();
  }

  updateDateInQueryParams() {
    const formattedDate = this.formatDate(this.date);
    this.router.navigate([], {
      queryParams: { fc_envase: formattedDate },
      queryParamsHandling: 'merge'
    });
  }

  formatDate(date: Date): string {
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  }

  dayChange(event: CustomEvent) {
    this.date.setDate(event.detail.value);
    this.updateDateInQueryParams();
  }

  monthChange(event: CustomEvent) {
    this.date.setMonth(event.detail.value - 1);
    this.updateDateInQueryParams();
  }

  yearChange(event: CustomEvent) {
    this.date.setFullYear(event.detail.value);
    this.updateDateInQueryParams();
  }

  async generatePreview() {
    const formattedDate = this.formatDate(this.date);
    console.log("GENERANDO PREVIEW");
    this.img = await this.api.previewDescongecion(this.product, formattedDate);
    this.img = "data:image/jpeg;base64," + this.img.data.image;
  }

  private async getCongelados() {
    let pro = await this.api.getCongelados();
    this.data = pro.data.message;
    this.results = this.data;
    console.log(this.data);
  }

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {
    addIcons({ eyeOutline, addOutline, removeOutline });
  }

  // Generate an array of days (1-31)
  days = Array.from({ length: 31 }, (_, i) => i + 1);
  months = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
  ];
  years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() + i);
}