import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { Tab1Page } from '../tab1/tab1.page';
import { Tab2Page } from '../tab2/tab2.page';
import { Tab3Page } from '../tab3/tab3.page';
import { DescongelarComponent } from '@app/private/pages/congelados/descongelar/descongelar.component';
import { TupperComponent } from '@app/private/pages/congelados/tupper/tupper.component';
import { MesaComponent } from '@app/private/pages/congelados/mesa/mesa.component';

export const routes: Routes = [
  {
    path: 'home',
    component: TabsPage,
    children: [
      {
        path: 'etiquetas',
        component: Tab1Page,
      },
      {
        path: 'escanear',
        component: Tab2Page,
      },
      {
        path: 'congelados/descongelar',
        component: DescongelarComponent,
      },
      {
        path: 'congelados/tupper',
        component: TupperComponent,
      },
      {
        path: 'congelados/mesa',
        component: MesaComponent,
      },
      {
        path: 'productos',
        component: Tab3Page,
      },
      {
        path: '',
        redirectTo: '/home/etiquetas',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: '',
    redirectTo: '/home/etiquetas',
    pathMatch: 'full',
  },
];
