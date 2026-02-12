import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { catchError, map, of } from "rxjs";

export const authGuard: CanActivateFn = () => {

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
            routerAux.navigate(['/login']);
            return false;
        }),
        catchError(() => {
            console.log('ERROR -- NOT LOGGED IN!!')
            routerAux.navigate(['/login']);
            return of(false);
        })
    )
}

export const authKeep: CanActivateFn = () => {

    const authServiceAux = inject(AuthService);
    const routerAux = inject(Router);

    console.log('GOING INSIDE AUTHKEEP')

    return authServiceAux.fetchMe().pipe(
        map(user => {
            console.log('user 22222222222: ', user)
            if (user) {
                routerAux.navigate(['/home']);
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
