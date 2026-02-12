import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, filter, take, switchMap, catchError, retry } from 'rxjs';
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
                this.isRefreshing = false;
                this.refreshSubject.next(true);
                
                // retry original request
                return next.handle(req.clone({withCredentials: true}))
              }),

              catchError(error => {
                this.isRefreshing = false;
                this.authServiceAux.logout().subscribe(res => {
                  console.log('\n LOGGING OUT FROM AUTH.INTERCEPTOR.TS: ',res)
                });
                
                console.log('going here throwing error 222222222:', error)
                return throwError(() => error);
              })

            )
        };

        return this.refreshSubject.pipe(
          filter(success => success === true),
          take(1),
          switchMap(() => {
            return next.handle(req.clone({withCredentials: true}));
          })
        )
    }
}



// ================================
// ================================
// ================================



// import { Injectable } from '@angular/core';
// import {
//   HttpInterceptor,
//   HttpRequest,
//   HttpHandler,
//   HttpEvent,
//   HttpErrorResponse
// } from '@angular/common/http';
// import { Observable, throwError, switchMap, catchError } from 'rxjs';
// import { AuthService } from './auth.service';
// import { HttpClient } from '@angular/common/http';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {

//   private url = 'http://localhost:8000/auth';
//   private isRefreshing = false;

//   constructor(private authServiceAux: AuthService, private http: HttpClient) {}

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

//     // always send cookies
//     const cloned = req.clone({
//       withCredentials: true
//     });

//     // console.log('\n\n Intercepting Request: +++++++', cloned)

//     return next.handle(cloned).pipe(

//       catchError((error: HttpErrorResponse) => {

//         if (error.status === 401 && !this.isRefreshing) {
//           this.isRefreshing = true;

//           return this.http.post(
//                 `${this.url}/refresh`,
//                 {},
//                 { withCredentials: true }
//             ).pipe(
//                 switchMap(() => {
//                     this.isRefreshing = false;

//                     // retry original request
//                     return next.handle(req.clone({ withCredentials: true }));
//                 }),
//                 catchError(err => {
//                     this.isRefreshing = false;
//                     this.authServiceAux.logout();
//                     return throwError(() => err);
//                 })
//             );
//         }

//         return throwError(() => error);
//       })
//     );
//   }
// }
