import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { authGuard, authKeep } from './auth/auth.guard';
import { PublicLayout } from './layouts/PublicLayout/PublicLayout';
import { MainLayout } from './layouts/MainLayout/MainLayout';
import { Home } from './layouts/MainLayout/home/home';

export const routes: Routes = [
    // public routes
    {
        path: '',
        component: PublicLayout,
        children: [
            { path: 'login', component: Login },
        ]
    },

    // Protected routes
    {
        path: '',
        component: MainLayout,
        canActivate: [authGuard],
        children: [
            { path: 'home', component: Home },
            { path: 'dashboard', component: Dashboard },
        ]
    },

    { path: '**', redirectTo: 'login' }

];
