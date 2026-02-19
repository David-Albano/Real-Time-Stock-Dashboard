import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { authGuard } from './auth/auth.guard';
import { PublicLayout } from './layouts/PublicLayout/PublicLayout';
import { MainLayout } from './layouts/MainLayout/MainLayout';
import { Home } from './layouts/MainLayout/home/home';
import { News } from './features/news/news';

export const routes: Routes = [
    // public routes
    {
        path: '',
        component: PublicLayout,
        children: [
            { path: '', redirectTo: 'login', pathMatch: 'full' },
            { path: 'login', component: Login },
        ]
    },

    // Protected routes
    {
        path: '',
        component: MainLayout,
        canMatch: [authGuard],
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: Home },
            { path: 'dashboard', component: Dashboard },
            { path: 'news', component: News },
        ]
    },

    { path: '**', redirectTo: 'home' }

];
