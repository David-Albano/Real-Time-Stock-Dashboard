import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<button (click)="executeLogin()">Log In</button> <br/><br/> <button (click)="getData()">Get Data</button>',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('client-trading');

  constructor(private authServiceAux: AuthService) {}

  executeLogin() {
      this.authServiceAux.login('first.admin.user@mail.com','admin').subscribe(res => console.log('\nSuccess ===>: ',res));
  }

  getData() {
      this.authServiceAux.fetchMe().subscribe(res => console.log('\nSuccess ===>: ',res))
  }

  ngOnInit() {
    
  }

}
