import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  title = 'Capstone';
  hideTopbar: boolean | undefined;

  constructor(private primengConfig: PrimeNGConfig, private afAuth: AngularFireAuth, private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.hideTopbarInAdminPages(event.url);
      }
    });
  }

  private hideTopbarInAdminPages(url: string) {
    const adminPages = ['/admin-dashboard', '/admin-att', '/admin-eat', '/admin-event'];
    const hideTopbar = adminPages.some((page) => url.includes(page));

    // Use the hideTopbar variable to control the visibility of app-topbar component
    this.hideTopbar = hideTopbar;
  }

  logout(): void {
    this.afAuth.signOut()
      .then(() => {
        // Logout successful. Additional actions if needed.
      })
      .catch(error => {
        // Handle logout error. Display error message or take appropriate action.
        console.error('Logout error:', error);
      });
  }
}