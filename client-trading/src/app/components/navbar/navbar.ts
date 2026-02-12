import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  constructor(private authServiceAux: AuthService, private router: Router) {}

  navigate(route: string) {
    this.router.navigate([route]);
  }

  executeLogout() {
    this.authServiceAux.logout().subscribe(res => {
          console.log('\nSuccess ===>: ',res)
        });
  }

}
