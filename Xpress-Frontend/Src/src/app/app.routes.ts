import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [MsalGuard],
  },
];
