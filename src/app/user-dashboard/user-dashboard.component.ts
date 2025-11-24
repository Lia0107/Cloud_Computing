import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserData } from '../model/user-data';
import { DataService } from '../shared/data.service';
import { AuthenticationService } from '../shared/authentication.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  activebook: string = 'user';
  userdataList: UserData[] = [];
  displayData: UserData[] = [];
  isLoggedIn: boolean = false; // Add a flag to track login status

  constructor(private firestore: AngularFirestore, private dataService: DataService, private authService: AuthenticationService, private afAuth: AngularFireAuth) {}
  getUserImage(userData: UserData){}

  ngOnInit() {  
    this.getUserData();
  }

  openbooking(tab: string) {
    this.activebook = tab;
  }

  getUserData() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.isLoggedIn = true; // User is logged in
        const userEmail = user.email;

        if (userEmail !== null && userEmail !== undefined) {
          this.dataService.getUserDataByEmail(userEmail).subscribe(
            (res: any) => {
              this.userdataList = res.map((e: any) => {
                const data = e.payload.doc.data();
                data.user_id = e.payload.doc.id;
                return data;
              });
            },
            (err: any) => {
              alert('Error while fetching user data, please try again later');
            }
          );
        }
      } else {
        this.isLoggedIn = false; // User is not logged in
      }
    });
  }

  getImageUrl(userData: UserData): string {
    return userData.user_image;
  }
}
