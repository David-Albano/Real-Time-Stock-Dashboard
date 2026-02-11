import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, switchMap, catchError } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private url = 'http://localhost:8000/auth';
  private isRefreshing = false;

  constructor(private authServiceAux: AuthService, private http: HttpClient) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // always send cookies
    const cloned = req.clone({
      withCredentials: true
    });

    // console.log('\n\n Intercepting Request: +++++++', cloned)

    return next.handle(cloned).pipe(

      catchError((error: HttpErrorResponse) => {

        if (error.status === 401 && !this.isRefreshing) {
          this.isRefreshing = true;

          return this.http.post(
                `${this.url}/refresh`,
                {},
                { withCredentials: true }
            ).pipe(
                switchMap(() => {
                    this.isRefreshing = false;

                    // retry original request
                    return next.handle(req.clone({ withCredentials: true }));
                }),
                catchError(err => {
                    this.isRefreshing = false;
                    this.authServiceAux.logout();
                    return throwError(() => err);
                })
            );
        }

        return throwError(() => error);
      })
    );
  }
}
