import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';
import { InMemoryDataService } from './in-memory-data.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule} from '@angular/material/icon';
import { MatMenuModule} from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopbarComponent } from './topbar/topbar.component';
import { HomepageComponent } from './homepage/homepage.component';
import { environment } from 'src/environments/environment.development';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { AboutusComponent } from './aboutus/aboutus.component';
import { FooterComponent } from './footer/footer.component';
import { EventsComponent } from './events/events.component';
import { NewsComponent } from './news/news.component';
import { ThingstodoComponent } from './thingstodo/thingstodo.component';
import { AttractionsComponent } from './attractions/attractions.component';
import { EateriesComponent } from './eateries/eateries.component';
import { BusstopComponent } from './busstop/busstop.component';
import { AdminTopbarComponent } from './admin-topbar/admin-topbar.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AdminAttComponent } from './admin-att/admin-att.component';
import { CommunityComponent } from './community/community.component';
import { BookingComponent } from './booking/booking.component';
import { AdminEatComponent } from './admin-eat/admin-eat.component';
import { ContactusComponent } from './contactus/contactus.component';
import { AttractionDashboardComponent } from './attraction-dashboard/attraction-dashboard.component';
import { AdminEventComponent } from './admin-event/admin-event.component';
import { CartComponent } from './cart/cart.component';
import { CartItemComponent } from './cart-item/cart-item.component';
import { EateriesDashboardComponent } from './eateries-dashboard/eateries-dashboard.component';
import { EventsDashboardComponent } from './events-dashboard/events-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { BookingDetailsComponent } from './booking-details/booking-details.component';
import { CheckOutComponent } from './check-out/check-out.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { CheckoutItemComponent } from './checkout-item/checkout-item.component';
import { CircleRowComponent } from './circle-row/circle-row.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';


@NgModule({
  declarations: [
    AppComponent,
    TopbarComponent,
    HomepageComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    AdminDashboardComponent,
    SearchbarComponent,
    AboutusComponent,
    FooterComponent,
    EventsComponent,
    NewsComponent,
    ThingstodoComponent,
    AttractionsComponent,
    EateriesComponent,
    BusstopComponent,
    AdminTopbarComponent,
    AdminLoginComponent,
    AdminAttComponent,
    CommunityComponent,
    BookingComponent,
    AdminEatComponent,
    ContactusComponent,
    AttractionDashboardComponent,
    AdminEventComponent,
    CartComponent,
    CartItemComponent,
    EateriesDashboardComponent,
    EventsDashboardComponent,
    UserDashboardComponent,
    BookingDetailsComponent,
    CheckOutComponent,
    CheckoutItemComponent,
    CircleRowComponent,
    ConfirmationComponent,
  ],
  imports: [
    HttpClientModule,
    HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, { dataEncapsulation: false }),
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireAuthModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
