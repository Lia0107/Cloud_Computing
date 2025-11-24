import { Component, Output, EventEmitter } from '@angular/core';
import { AuthenticationService } from '../shared/authentication.service';
@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent {
  isLoggedIn: boolean = false; // Add a flag to track login status

  constructor(public authenticationService: AuthenticationService) {}

  /*Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon*/
  myFunction() {
    var x = document.getElementById("myTopnav");
     if (x != null){
      if (x.className === "topbar-right") { // === is to compare the values
        x.className += " responsive";
        } else {
          x.className = "topbar-right";
        }
     }
  }

  logout() {
    this.authenticationService.logout();
    this.authenticationService.isLoggedIn = false; // Set the flag to false on logout
  }
}
