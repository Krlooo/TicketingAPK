import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonHeader, IonTitle, IonToolbar, IonBackdrop, IonButton, IonCheckbox, IonLoading, LoadingController } from '@ionic/angular/standalone';
import { CapacitorHttp } from '@capacitor/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '@app/core/services/api/api.service';

@Component({
  selector: 'app-header',
  imports: [IonLoading, IonCheckbox, IonButton, IonBackdrop, IonToolbar, IonTitle, IonHeader, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
})
export class HeaderComponent implements OnInit, OnDestroy {
  status: any;
  private intervalId: any;
  text: any
  constructor(private api: ApiService) { }

  async ngOnInit() {
    // Verificar inmediatamente al iniciar
    this.status = await this.api.checkApiStatus();

    // Configurar el intervalo para verificar cada segundo
    this.intervalId = setInterval(() => {
      this.api.checkApiStatus().then((result) => {
        this.status = result
      }).catch((err) => {
        this.status = err
      });
    }, 3000);
  }

  ngOnDestroy() {
    // Limpiar el intervalo cuando el componente se destruye
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }





}