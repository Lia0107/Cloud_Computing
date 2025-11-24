import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CartService } from '../cart.service';
import { AttData } from '../model/att-data';
import { CartData } from '../model/cart-data';
import { DataService } from '../shared/data.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthenticationService } from '../shared/authentication.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-item',
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.css']
})
export class CartItemComponent implements OnInit, OnChanges {
  cartdataList: CartData[] = [];
  attdataList: AttData[] = [];
  public products: any = [];
  grandTotal: number = 0;
  userLoggedIn: boolean = false;
  selectedData: any;

  constructor(
    private cartService: CartService,
    private formBuilder: FormBuilder,
    private auth: AuthenticationService,
    private data: DataService,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getAllAttractions();
    this.getCartItem();
    this.checkUserLoggedIn();
  }

  ngOnChanges() {
    this.calculateGrandTotal();
  }

  checkUserLoggedIn() {
    this.afAuth.authState.subscribe(user => {
      this.userLoggedIn = !!user;
    });
  }

  isUserLoggedIn(): boolean {
    return this.userLoggedIn;
  }

  getAllAttractions() {
    this.data.getAllAttractions().subscribe(res => {
      this.attdataList = res.map((e: any) => {
        const data = e.payload.doc.data();
        data.att_id = e.payload.doc.id;
        return data;
      })
    }, err => {
      alert('Error while fetching attractions, please try again later');
    })
  }

  getImageUrl(attdata: AttData): string {
    return attdata.att_image;
  }

  addToCart(attdata: AttData): void {
    const existingCartItem = this.cartdataList.find(
      (item) => item.cart_item_id === attdata.att_id
    );

    if (existingCartItem) {
      existingCartItem.cart_item_quantity = (
        parseInt(existingCartItem.cart_item_quantity) + 1
      ).toString();

      this.cartService
        .updateCartItem(existingCartItem)
        .then(() => {
          console.log('Item quantity updated in cart successfully');
          this.calculateGrandTotal();
        })
        .catch((error: any) => {
          console.error('Error updating item quantity in cart', error);
        });
    } else {
      const cartData: CartData = {
        cart_id: '',
        cart_user_id: '',
        cart_item_id: attdata.att_id,
        cart_item_name: attdata.att_name,
        cart_item_price: attdata.att_price,
        cart_item_quantity: '1',
        cart_item_image: attdata.att_image,
        cart_item_desc: attdata.att_desc
      };

      this.cartService
        .addCartItem(cartData)
        .then(() => {
          console.log('Item added to cart successfully');
          this.getCartItem();
          this.calculateGrandTotal();
        })
        .catch((error: any) => {
          console.error('Error adding item to cart', error);
        });
    }
  }

  getCartItem() {
    this.cartService.addToCart().subscribe(res => {
      this.cartdataList = [];
      this.cartdataList = res.map((e: any) => {
        const data =e.payload.doc.data();
        data.cart_id = e.payload.doc.id;
        return data;
      });
      this.calculateGrandTotal();
    }, err => {
      alert('Error while fetching cart items, please try again later');
    });
  }

  getCartImageUrl(cartdata: CartData): string {
    return cartdata.cart_item_image;
  }

  deleteCartItem(cartdata: CartData) {
    const cartItemName = cartdata.cart_item_name;

    const cartItemToDelete = this.cartdataList.find(item => item.cart_item_name === cartItemName);

    if (!cartItemToDelete) {
      console.error('Cart item not found');
      return;
    }

    this.afs
      .collection('cartdatas', ref => ref.where('cart_item_name', '==', cartItemName))
      .get()
      .subscribe(querySnapshot => {
        querySnapshot.forEach(doc => {
          doc.ref.delete().then(() => {
            console.log('Item deleted successfully');

            const index = this.cartdataList.indexOf(cartItemToDelete);
            if (index !== -1) {
              this.cartdataList.splice(index, 1);
            }

            this.calculateGrandTotal();
          })
            .catch(error => {
              console.error('Error deleting item', error);
            });
        });
      });
  }

  convertToNumber(value: string): number {
    return Number(value);
  }

  calculateGrandTotal() {
    this.grandTotal = 0;
    const addedItems: { [key: string]: CartData } = {};

    for (const cartdata of this.cartdataList) {
      if (cartdata.selected) {
        const totalPrice = this.convertToNumber(cartdata.cart_item_price) * this.convertToNumber(cartdata.cart_item_quantity);
        this.grandTotal += totalPrice;
      }

      // Keep track of items with the same name
      if (addedItems[cartdata.cart_item_name]) {
        addedItems[cartdata.cart_item_name].cart_item_quantity = (
          parseInt(addedItems[cartdata.cart_item_name].cart_item_quantity) +
          parseInt(cartdata.cart_item_quantity)
        ).toString();
      } else {
        addedItems[cartdata.cart_item_name] = cartdata;
      }
    }

    // Update the cartdataList with merged items
    this.cartdataList = Object.values(addedItems);
  }

  updateCartItem(cartdata: CartData): void {
    const cartItemToUpdate = this.cartdataList.find(item => item.cart_item_name === cartdata.cart_item_name);

    if (!cartItemToUpdate) {
      console.error('Cart item not found');
      return;
    }

    cartItemToUpdate.cart_item_quantity = cartdata.cart_item_quantity;

    this.cartService.updateCartItem(cartItemToUpdate)
      .then(() => {
        console.log('Item quantity updated in cart successfully');
        this.calculateGrandTotal();
      })
      .catch((error) => {
        console.error('Error updating item quantity in cart', error);
      });
  }


  redirectToCheckOutComponent(): void {
    const selectedItems = this.cartdataList.filter(cartdata => cartdata.selected);

    this.router.navigate(['/check-out'], {
      state: {
        cartdataList: selectedItems
      }
    });
  }
  
  
}