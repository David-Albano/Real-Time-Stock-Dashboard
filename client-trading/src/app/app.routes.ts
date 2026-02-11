import { Routes } from '@angular/router';
import { App } from './app';
import { Dashboard } from './features/dashboard/dashboard';

export const routes: Routes = [
    { path: '', component: App },
    { path: 'dashboard', component: Dashboard }
];
