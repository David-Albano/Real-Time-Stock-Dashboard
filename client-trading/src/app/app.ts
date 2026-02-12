import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  // templateUrl: './app.html',
  template: `<button (click)="executeLogin()">Log In</button>
            <br/><br/>
            <button (click)="getData()">Get Data</button>
            <br/><br/>
            <button (click)="executeLogout()">Log out</button>`,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('client-trading');

  constructor(private authServiceAux: AuthService) {}

  executeLogin() {
      this.authServiceAux.login('first.admin.user@mail.com','admin').subscribe(res => console.log('\nSuccess ===>: ',res));
  }

  executeLogout() {
      this.authServiceAux.logout().subscribe(res => console.log('\nSuccess ===>: ',res));
  }

  getData() {
      this.authServiceAux.fetchMe().subscribe(res => console.log('\nSuccess ===>: ',res))
  }

  ngOnInit() {
    
  }

}
