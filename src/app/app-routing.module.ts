// 'CommonModule' references and 'declarations' array are unnecessary, so are no longer part of 'AppRoutingModule'
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomepageComponent } from './homepage/homepage.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { EventsComponent } from './events/events.component';
import { AboutusComponent } from './aboutus/aboutus.component';
import { ThingstodoComponent } from './thingstodo/thingstodo.component';
import { FooterComponent } from './footer/footer.component';
import { NewsComponent } from './news/news.component';
import { AttractionsComponent } from './attractions/attractions.component';
import { EateriesComponent } from './eateries/eateries.component';
import { BusstopComponent } from './busstop/busstop.component';
import { AdminTopbarComponent } from './admin-topbar/admin-topbar.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AdminAttComponent } from './admin-att/admin-att.component';
import { CommunityComponent } from './community/community.component';
import { BookingComponent } from './booking/booking.component';
import { ContactusComponent } from './contactus/contactus.component';
import { AttractionDashboardComponent } from './attraction-dashboard/attraction-dashboard.component';
import { AdminEatComponent } from './admin-eat/admin-eat.component';
import { AdminEventComponent } from './admin-event/admin-event.component';
import { CartComponent } from './cart/cart.component';
import { CartItemComponent } from './cart-item/cart-item.component';
import { EateriesDashboardComponent } from './eateries-dashboard/eateries-dashboard.component';
import { EventsDashboardComponent } from './events-dashboard/events-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { BookingDetailsComponent} from './booking-details/booking-details.component';
import { CheckOutComponent} from './check-out/check-out.component';
import { CheckoutItemComponent } from './checkout-item/checkout-item.component';
import { CircleRowComponent } from './circle-row/circle-row.component';
import { ConfirmationComponent } from './confirmation/confirmation.component'

const routes: Routes = [
  { path: '', redirectTo: 'homepage', pathMatch: 'full' }, //Default route
  { path: 'homepage', component: HomepageComponent },
  { path: 'aboutus', component: AboutusComponent },
  { path: 'events', component: EventsComponent },
  { path: 'news', component: NewsComponent },
  { path: 'thingstodo', component: ThingstodoComponent },
  { path: 'attractions', component: AttractionsComponent },
  { path: 'register', component: RegisterComponent }, 
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'searchbar', component: SearchbarComponent },
  { path: 'events', component: EventsComponent },
  { path: 'aboutus', component: AboutusComponent },
  { path: 'thingstodo', component: ThingstodoComponent },
  { path: 'footer', component: FooterComponent },
  { path: 'news', component: NewsComponent },
  { path: 'attractions', component: AttractionsComponent },
  { path: 'eateries', component: EateriesComponent },
  { path: 'busstop', component: BusstopComponent },
  { path: 'admin-topbar', component: AdminTopbarComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'admin-att', component: AdminAttComponent },
  { path: 'community', component: CommunityComponent },
  { path: 'booking', component: BookingComponent },
  { path: 'contactus', component: ContactusComponent },
  { path: 'attraction-dashboard', component: AttractionDashboardComponent },
  { path: 'admin-eat', component: AdminEatComponent },
  { path: 'admin-event', component: AdminEventComponent },
  { path: 'cart', component: CartComponent },
  { path: 'cart-item', component: CartItemComponent },
  { path: 'eateries-dashboard', component: EateriesDashboardComponent },
  { path: 'events-dashboard', component: EventsDashboardComponent },
  { path: 'user-dashboard', component: UserDashboardComponent },
  { path: 'booking-details', component: BookingDetailsComponent},
  { path: 'check-out', component: CheckOutComponent},
  { path: 'checkout-item', component: CheckoutItemComponent},
  { path: 'circle-row', component: CircleRowComponent},
  { path: 'confirmation', component: ConfirmationComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule { }
