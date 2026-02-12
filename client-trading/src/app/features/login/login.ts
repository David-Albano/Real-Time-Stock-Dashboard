import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

    constructor(private authServiceAux: AuthService, private routerAux: Router) {}

    email = "";
    password = "";

    executeLogin(email: string, password: string) {

          this.authServiceAux.login(email, password).subscribe(res => {
            console.log('\nSuccess ===>: ',res)
            this.routerAux.navigate(['/home'])
          });
      }

    ngOnInit() {}

}
