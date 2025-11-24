import { Component } from '@angular/core';
import { AuthenticationService } from '../shared/authentication.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { DataService } from '../shared/data.service';
import { UserData } from '../model/user-data';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  userdataList: UserData[] = [];
  userdataObj: UserData= {
    user_id: '',
    user_firstname: '',
    user_lastname: '',
    user_email: '',
    user_password: '',
    user_image: ''
  };
  user_id: string= '';
  user_firstname: string= '';
  user_lastname: string= '';
  user_email: string= '';
  user_password: string= '';
  user_image: string= '';

  constructor(private auth: AuthenticationService, private data: DataService, private afAuth: AngularFireAuth, private router: Router) {}

  ngOnInit(): void {
    this.getAllUsers();
  }

  // Get All Users
  getAllUsers() {
    this.data.getAllUsers().subscribe(res => {
      this.userdataList= res.map( (e: any) => {
        const data= e.payload.doc.data();
        data.user_id= e.payload.doc.id;
        return data;
      })
    }, err => {
      alert('Error while fetching users, please try again later');
    })
  }

  // Reset Form
  resetForm() {
    this.user_id= '';
    this.user_firstname= '';
    this.user_lastname= '';
    this.user_email= '';
    this.user_password= '';
    this.user_image= '';
  }

  // Add User
  register() {
    if(this.user_email == '' || this.user_firstname == '' || this.user_lastname == '' || this.user_password == '' ) {
      alert('Please fill in all fields');
      return;
    }

    this.userdataObj.user_id='';
    this.userdataObj.user_email= this.user_email;
    this.userdataObj.user_firstname= this.user_firstname;
    this.userdataObj.user_lastname= this.user_lastname;
    this.userdataObj.user_password= this.user_password;
    this.userdataObj.user_image= this.user_image;

    this.auth.register(this.userdataObj).then(
      () => {
        alert('User Registered Successfully');
        this.router.navigate(['/login']);
      },
      () => {
        alert('Something went wrong');
        this.router.navigate(['/register']);
      }
    );
    
    this.data.addUsers(this.userdataObj);
    this.resetForm();
  }

  // email: string = '';
  // password: string = '';

  // constructor(private auth : AuthenticationService) {}

  // ngOnInit(): void {}

  // register(){
   
  //   if(this.email == ''){
  //     alert('Please enter your email');
  //     return
  //   }

  //   if(this.password == ''){
  //     alert('Please enter your password');
  //     return
  //   }
    
  //   this.auth.register(this.email, this.password);
    
  //   this.email = '';
  //   this.password = '';
  // }
}
