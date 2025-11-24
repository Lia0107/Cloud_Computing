import { Component } from '@angular/core';
import { AuthenticationService } from '../shared/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  email: string = 'dttest@gmail.com';
  password: string = '123456';

  constructor(private auth : AuthenticationService, private router: Router) {}

  ngOnInit(): void {}

  login(){
    if (this.email === 'dttest@gmail.com' && this.password === '123456') {
      this.router.navigate(['/admin-dashboard']);
    }else{
      alert('Invalid Credentials');
    }
  }
}
