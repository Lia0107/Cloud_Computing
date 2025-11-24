import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router, Routes } from '@angular/router';
import { UserData } from '../model/user-data';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  isLoggedIn: boolean = false; // Add a flag to track login status

  constructor(private fireauth : AngularFireAuth, private router: Router) { }
  
  // Login Method
  login(email: string, password: string){
    this.fireauth.signInWithEmailAndPassword(email, password).then(() => {
      localStorage.setItem('token', 'true'); 
      this.isLoggedIn = true; // Set the flag to true on successful login
      alert('User Login Successfully');
      this.router.navigate(['/user-dashboard']);
      
      // if (email === 'dttest@gmail.com' && password === '123456') {
      //   this.router.navigate(['/admin-dashboard']);
      // } else {
      // Redirect to user dashboard or any other page for regular users
      //   this.router.navigate(['/homepage']);
      // }

    }, err => {
      alert(err.message); 
      this.router.navigate(['/login']); 
    })
  } 

  // Register Method
  register(userdataObj: UserData): Promise<void> {
    const { user_email, user_password } = userdataObj;
    return this.fireauth.createUserWithEmailAndPassword(user_email, user_password)
      .then(res => {
        this.sendEmailForVerification(res.user);
      });
  }

  // Logout Method
  logout(){
    this.fireauth.signOut().then(() => {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }, err => {
      alert(err.message);
      this.router.navigate(['/login']); 
    }) 
  }

  // Forgot Password Method
  forgotPassword(email: string){
    this.fireauth.sendPasswordResetEmail(email).then(() => {
      alert('Password Reset Email Sent');
      this.router.navigate(['/verify-email']);
    }, err => {
      alert('Something went wrong');
      this.router.navigate(['/forgot-password']);
    })
  }

  // Send Email For Verification Method
  sendEmailForVerification(user: any){
    user.sendEmailVerification().then((res: any) => {
      this.router.navigate(['/verify-email']);
    }, (err: any) => {
      alert('Something went wrong. Not able to send verification email.');
      this.router.navigate(['/register']);
    })
  }
}
