import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, filter, take, switchMap, catchError } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private url = 'http://localhost:8000/auth';

  private isRefreshing = false;
  private refreshSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private authServiceAux: AuthService, private http: HttpClient) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // always send cookies
    const cloned = req.clone({
      withCredentials: true
    });

    // console.log('\n\n Intercepting Request: +++++++', cloned)

    return next.handle(cloned).pipe(

      catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.log('\n ~~~ error.status: ', error.status)
            return this.handle401Error(req, next);
          }

          console.log('going here throwing error 222222222:', error)

          return throwError(() => error);
      })
    );
  };


  private handle401Error(req: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          this.refreshSubject.next(false);

          return this.http.post(

              `${this.url}/refresh`,
              {},
              {withCredentials: true}

          ).pipe(
              switchMap(() => {
                console.log('inside switchMap now ««««««««')
                this.isRefreshing = false;
                this.refreshSubject.next(true);
                
                // retry original request
                return next.handle(req.clone({withCredentials: true}))
              }),

              catchError(error => {
                console.log('error inside handle401Error =>: ', error)
                this.isRefreshing = false;
                this.authServiceAux.logout().subscribe(res => {
                  console.log('\n LOGGING OUT FROM AUTH.INTERCEPTOR.TS: ',res)
                });

                this.authServiceAux.clearSession();
                
                console.log('going here throwing error 222222222:', error)
                return throwError(() => error);
              })

            )
        };

        console.log('going hereeee somewhere <<<<<<<<<<')

        return this.refreshSubject.pipe(
          filter(success => success === true),
          take(1),
          switchMap(() => {
            return next.handle(req.clone({withCredentials: true}));
          }),
          catchError((error) => {
            console.log('err AFTER EVERYTHING: ', error)
            return throwError(() => error); 
          })
        )
    }
}
