import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar, IonTabButton, IonIcon, IonLabel, IonButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonButton, IonLabel, RouterModule, IonIcon, IonTabButton, IonContent, IonHeader, IonRefresher, IonRefresherContent, IonTitle, IonToolbar],
})
export class Tab1Page {
  constructor() { }
  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      // Any calls to load data go here
      (event.target as HTMLIonRefresherElement).complete();
    }, 2000);
  }
}
