import { Component } from '@angular/core';
import { AuthenticationService } from '../shared/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private auth : AuthenticationService) {}

  ngOnInit(): void {}

  login(){
    if(this.email == ''){
      alert('Please enter your email');
      return
    }
    if(this.password == ''){
      alert('Please enter your password');
      return
    }
    this.auth.login(this.email, this.password);
    
    this.email = '';
    this.password = '';
  }
}
