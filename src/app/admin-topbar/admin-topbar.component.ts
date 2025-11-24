import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-admin-topbar',
  templateUrl: './admin-topbar.component.html',
  styleUrls: ['./admin-topbar.component.css']
})
export class AdminTopbarComponent {
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

  @Output() logoutAdmin: EventEmitter<void> = new EventEmitter<void>();

  onAdminLogout(): void {
    this.logoutAdmin.emit();
  }
}
