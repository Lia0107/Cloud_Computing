import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AttData } from '../model/att-data';
import { DataService } from '../shared/data.service';
import { CartData } from '../model/cart-data';
import { CartService } from '../cart.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-thingstodo',
  templateUrl: './thingstodo.component.html',
  styleUrls: ['./thingstodo.component.css']
})
export class ThingstodoComponent implements OnInit {
  attdataList: AttData[] = [];
  displayData: AttData[] = [];
 
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private cartService: CartService, 
    private afs: AngularFirestore
  ) {}

  ngOnInit(): void {
    this.getAllAttractions();
  }

  getAllAttractions() {
    this.dataService.getAllAttractions().subscribe(
      (res: any) => {
        this.attdataList = res.map((e: any) => {
          const data = e.payload.doc.data();
          data.att_id = e.payload.doc.id;
          return data;
        });
  
        this.displayData = this.attdataList.filter((attData: AttData) => {
          return attData.att_price != '-';
        });
  
        this.sortData(); 
      },
      (err: any) => {
        alert('Error while fetching attractions, please try again later');
      }
    );
  }
  

  formatTime(time: string): string {
    if (time === '24 Hours') {
      return time;
    } else if (time === '-' || !time) {
      return '';
    } else {
      const date = new Date(`2000-01-01T${time}`);
      const formattedTime = date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        hourCycle: 'h23'
      });
      return formattedTime;
    }
  }

  sortData() {
    this.displayData.sort((a, b) => {
      return a.att_name.localeCompare(b.att_name);
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

  redirectToAttractionDashboardComponent(attdata: AttData): void {
    const { att_id, att_name,att_image, att_desc, att_openHrs, att_closeHrs, att_price, att_location } = attdata;
    this.router.navigate(['/attraction-dashboard'], {
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
}
