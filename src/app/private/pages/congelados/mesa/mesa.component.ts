import { Component, OnInit } from '@angular/core';
import { IonAlert, IonToast, IonText, IonImg, IonModal, IonItem, IonIcon, IonButton, IonContent, IonSelect, IonSelectOption, IonTitle, IonPicker, IonPickerColumn, IonPickerColumnOption } from '@ionic/angular/standalone';
import { BarcodeScanningModalComponent } from "../../../../modules/barcode-scanning-modal.component";
import { addIcons } from 'ionicons';
import { eyeOutline, addOutline, removeOutline } from 'ionicons/icons';
import { ApiService } from '@app/core/services/api/api.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-mesa',
  imports: [IonAlert, IonToast, IonText, IonImg, IonModal, IonItem, FormsModule, IonIcon, IonButton, IonContent, IonSelect, IonSelectOption, IonTitle, IonPicker, IonPickerColumn, IonPickerColumnOption, BarcodeScanningModalComponent],
  templateUrl: './mesa.component.html',
  styleUrls: ['./mesa.component.scss'],
})
export class MesaComponent implements OnInit {

  public data: any;
  public results: any;
  product: any;
  img: any;

  // Two separate dates with time
  expirationDate: Date = new Date();
  defrostDate: Date = new Date();
  defrostHour: number = new Date().getHours();
  defrostMinute: number = new Date().getMinutes();

  qt = 1;

  // Determine which date is currently being edited
  currentDateType: 'expiration' | 'defrost' = 'expiration';
  currentTimeType: 'hour' | 'minute' = 'hour';

  async ngOnInit() {
    // Verificar inmediatamente al iniciar
    this.getCongelados();
    this.route.queryParams.subscribe(params => {
      this.product = params['producto'];

      // Parse expiration date from query params if exists
      if (params['fc_envase']) {
        const [day, month, year] = params['fc_envase'].split('-').map(Number);
        this.expirationDate = new Date(year, month - 1, day);
      }

      // Parse defrost date from query params if exists
      if (params['fc_descongelacion']) {
        const [day, month, year, hour, minute] = params['fc_descongelacion'].split('-').map(Number);
        this.defrostDate = new Date(year, month - 1, day);
        this.defrostHour = hour || new Date().getHours();
        this.defrostMinute = minute || new Date().getMinutes();
      }
    });
  }

  async goPrint() {
    const formattedExpirationDate = this.formatDate(this.expirationDate);
    const formattedDefrostDate = this.formatDefrostDate();

    this.api.previewMesaCong(this.product, formattedExpirationDate, formattedDefrostDate).then((result: any) => {
      this.product = null;
    }).catch((err: any) => {
      // Handle error
    });
  }

  newTupper() {
    this.router.navigate([], {
      queryParams: { producto: this.product },
      queryParamsHandling: 'merge'
    });

    this.updateDateInQueryParams();
  }

  updateDateInQueryParams() {
    const formattedExpirationDate = this.formatDate(this.expirationDate);
    const formattedDefrostDate = this.formatDefrostDate();

    this.router.navigate([], {
      queryParams: {
        fc_envase: formattedExpirationDate,
        fc_descongelacion: formattedDefrostDate
      },
      queryParamsHandling: 'merge'
    });
  }

  formatDate(date: Date): string {
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  }

  formatDefrostDate(): string {
    const hour = this.defrostHour.toString().padStart(2, '0');
    const minute = this.defrostMinute.toString().padStart(2, '0');
    return `${this.defrostDate.getDate()}-${this.defrostDate.getMonth() + 1}-${this.defrostDate.getFullYear()}-${hour}-${minute}`;
  }

  // Toggle between editing expiration and defrost dates
  toggleDateType(type: 'expiration' | 'defrost') {
    this.currentDateType = type;
  }

  // Toggle between editing hour and minute
  toggleTimeType(type: 'hour' | 'minute') {
    this.currentTimeType = type;
  }

  dayChange(event: CustomEvent) {
    const currentDate = this.currentDateType === 'expiration' ? this.expirationDate : this.defrostDate;
    currentDate.setDate(event.detail.value);
    this.updateDateInQueryParams();
  }

  monthChange(event: CustomEvent) {
    const currentDate = this.currentDateType === 'expiration' ? this.expirationDate : this.defrostDate;
    currentDate.setMonth(event.detail.value - 1);
    this.updateDateInQueryParams();
  }

  yearChange(event: CustomEvent) {
    const currentDate = this.currentDateType === 'expiration' ? this.expirationDate : this.defrostDate;
    currentDate.setFullYear(event.detail.value);
    this.updateDateInQueryParams();
  }

  hourChange(event: CustomEvent) {
    this.defrostHour = event.detail.value;
    this.updateDateInQueryParams();
  }

  minuteChange(event: CustomEvent) {
    this.defrostMinute = event.detail.value;
    this.updateDateInQueryParams();
  }

  formatDateForApi(date: Date, hour: number, minute: number): string {
    // Pad single digits with leading zero
    const pad = (num: number) => num.toString().padStart(2, '0');

    // Get date components
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());

    // Use provided or current time
    const hours = pad(hour);
    const minutes = pad(minute);
    const seconds = '00';

    // Microseconds (6 digits)
    const microseconds = '000000';

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${microseconds}`;
  }

  async generatePreview() {
    const formattedDefrostDate = this.formatDateForApi(this.defrostDate, this.defrostHour, this.defrostMinute);
    const formattedExpirationDate = this.formatDate(this.expirationDate);
    console.log("GENERANDO PREVIEW");
    this.img = await this.api.previewMesaCong(this.product, formattedExpirationDate, formattedDefrostDate);
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
  hours = Array.from({ length: 24 }, (_, i) => i);
  minutes = Array.from({ length: 60 }, (_, i) => i);
}