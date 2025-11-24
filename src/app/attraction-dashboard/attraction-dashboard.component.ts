import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AttData } from '../model/att-data';
import { CartData } from '../model/cart-data';
import { CartService } from '../cart.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-attraction-dashboard',
  templateUrl: './attraction-dashboard.component.html',
  styleUrls: ['./attraction-dashboard.component.css']
})
export class AttractionDashboardComponent implements OnInit {
  selectedData: any;

  constructor(private route: ActivatedRoute, private cartService: CartService, private afs: AngularFirestore, private router: Router) {}

  ngOnInit(): void {
    this.selectedData = history.state;
  console.log('Selected Data:', this.selectedData);

  const { att_openHrs, att_closeHrs } = this.selectedData;
  console.log('att_openHrs:', att_openHrs);
  console.log('att_closeHrs:', att_closeHrs);
  
  console.log('Time parameter:', this.formatTime(att_openHrs));
  console.log('Time parameter:', this.formatTime(att_closeHrs));
  // this.selectedData.forEach((a: any) => {
  //   Object.assign(a,{quantity:1,total:a.price});
  // });
  }

  formatTime(time: string): string {
    console.log('Time parameter:', time);
  
    if (time === '24 Hours') {
      return time; // Return "24 Hours" as is
    }
  
    if (time === '-' || !time) {
      return ''; // Return an empty string or handle the case when time is '-' or undefined
    }
  
    // Convert the time string to a JavaScript Date object
    const date = new Date(`2000-01-01T${time}`);
  
    // Format the time using options for hour12 and hourCycle
    const formattedTime = date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      hourCycle: 'h23'
    });
  
    return formattedTime; // Return the formatted time without the label
  }

  getImageUrl(attdata: AttData): string {
    return attdata.att_image;
  }

    //Store to firestore
    addToCart(attdata: AttData) {
      const cartData: CartData = {
        cart_id: this.afs.createId(),
        cart_user_id: '', // Add the user ID if applicable
        cart_item_id: '',
        cart_item_name: attdata.att_name,
        cart_item_price: attdata.att_price,
        cart_item_quantity: '1', // Set the quantity
        cart_item_image: attdata.att_image,
        cart_item_desc: attdata.att_desc
      };
  
      this.cartService.addCartItem(cartData)
        .then(() => {
          console.log('Item added to cart successfully');
        })
        .catch((error) => {
          console.error('Error adding item to cart', error);
        });
    }
  
  

  redirectToBookingDetailsComponent(attdata: AttData): void {
    const { att_id, att_name, att_image, att_desc, att_openHrs, att_closeHrs, att_price, att_location } = attdata;  
    this.router.navigate(['/booking-details'], {
      state: {
        att_id,
        att_name,
        att_image,
        att_desc,
        att_openHrs,
        att_closeHrs,
        att_price,
        att_location
      }
    });
  }

}