import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { BehaviorSubject, tap, catchError, of, finalize, throwError } from "rxjs";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private url = "http://localhost:8000/auth";

    private userSubject = new BehaviorSubject<any>(null);

    constructor(private http: HttpClient, private routerAux: Router) {};

    // login
    login(email: string, password: string) {
        return this.http.post<any>(

            `${this.url}/login`,
            { email, password},
            { withCredentials: true }

        ).pipe(
            tap(res => {
                this.userSubject.next(res.user);
            }),
            catchError((err: HttpErrorResponse) => {
                return throwError(() => err);
            })
        );
    };

    // register
    register(email: string, username: string, password: string) {
        return this.http.post(
            `${this.url}/register`,
            { email, username, password },
            { withCredentials: true }
        );
    };

    // get current session
    fetchMe() {
        return this.http.get<any>(
            `${this.url}/me`,
            { withCredentials: true}
        ).pipe(
            tap(user => this.userSubject.next(user)),
            catchError(() => {
                this.userSubject.next(null);
                return of(null);
            })
        );
    };

    // logout
    logout() {
        return this.http.post(
            `${this.url}/logout`,
            {},
            { withCredentials: true }
        ).pipe(
            finalize(() => this.clearSession())
        )
    }

    clearSession() {
        // tokens are not stored on localStorage, just in cookies on backend, but just in case
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        this.userSubject.next(null);
        this.routerAux.navigate(['/login'])
    }

    currentUser() {
        if (!this.isLoggedIn()) {
            this.routerAux.navigate(['/login'])
        }

        return true
    }

    isLoggedIn() {
        console.log('this.userSubject.value: ', this.userSubject.value)
        return !!this.userSubject.value;
    }

}

