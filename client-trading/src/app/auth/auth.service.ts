import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, tap, catchError, of, finalize } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private url = "http://localhost:8000/auth";

    private userSubject = new BehaviorSubject<any>(null);

    constructor(private http: HttpClient) {};

    // login
    login(email: string, password: string) {
        return this.http.post<any>(

            `${this.url}/login`,
            { email, password},
            { withCredentials: true }

        ).pipe(
            tap(res => {
                this.userSubject.next(res.user);
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
        // not tokens stored on this.localStorage, but just in case
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        this.userSubject.next(null);
    }

    get currentUser() {
        return this.userSubject.value;
    }

    get isLoggedIn() {
        return !!this.userSubject.value;
    }

}

