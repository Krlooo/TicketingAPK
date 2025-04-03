import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from './private/components/header/header.component';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonContent, IonRouterOutlet, HeaderComponent],
})
export class AppComponent {
  constructor() { }
}
