import { inject } from "@angular/core";
import { CanMatchFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { catchError, map, of } from "rxjs";

export const authGuard: CanMatchFn = () => {

    const authServiceAux = inject(AuthService);
    const routerAux = inject(Router);
    console.log('GOING INSIDE AUTHguard')

    return authServiceAux.fetchMe().pipe(
        map(user => {
            console.log('user 11111111111: ', user)
            if (user) {
                return true;
            }
            console.log('NOT LOGGED IN!!')
            
            return routerAux.createUrlTree(['/login']);
        }),
        catchError(() => {
            console.log('ERROR -- NOT LOGGED IN!!')
            ;
            return of(routerAux.createUrlTree(['/login']));
        })
    )
}

export const authKeep: CanMatchFn = () => {

    const authServiceAux = inject(AuthService);
    const routerAux = inject(Router);

    console.log('GOING INSIDE AUTHKEEP')

    return authServiceAux.fetchMe().pipe(
        map(user => {
            console.log('user 22222222222: ', user)
            if (user) {
                routerAux.createUrlTree(['/home']);
                return true;
            }

            console.log('NOT LOGGED IN!!')
            authServiceAux.logout().subscribe(res => {
                console.log('\n LOGGING OUT FROM AUTH.GUARD.TS', res)
            });

            return false;
        }),
        catchError(() => {
            console.log('ERROR -- !!')
            
            return of(false);
        })
    )
}
