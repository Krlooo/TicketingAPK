import { Component, OnInit } from '@angular/core';
import { IonItem, IonLabel, IonList, IonSearchbar, IonContent, IonSkeletonText, IonTitle, IonRefresherContent, IonRefresher, IonBadge, IonText, IonNote, IonIcon, IonInfiniteScroll } from '@ionic/angular/standalone';
import { ApiService } from '@app/core/services/api/api.service';
import { addIcons } from 'ionicons';
import { chevronForward, listCircle } from 'ionicons/icons';
import { Router } from '@angular/router';
@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [IonInfiniteScroll, IonIcon, IonNote, IonText, IonBadge, IonRefresher, IonRefresherContent, IonTitle, IonSkeletonText, IonContent, IonItem, IonLabel, IonList, IonSearchbar],
})
export class Tab3Page implements OnInit {
  constructor(private api: ApiService, private router: Router) {
    addIcons({ chevronForward, listCircle });
  }
  public data: any
  public results: any;
  ngOnInit() {
    // Verificar inmediatamente al iniciar
    this.getProducts();

  }

  handlebutton(producto: any, categoria: any) {
    if (categoria == "CONGELADOS") {
      this.router.navigate(["/home/congelados/descongelar"], { queryParams: { producto: producto } })

    }
  }
  handleInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toLowerCase() || '';
    console.log(target.value)
    this.results = this.data.filter((d: any) => d.producto.toLowerCase().includes(query));
  }
  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      this.getProducts();
      (event.target as HTMLIonRefresherElement).complete();
    }, 2000);
  }
  private async getProducts() {



    this.data = await this.api.getProducts()
    this.results = this.data
    console.log(this.data)



  }
}
