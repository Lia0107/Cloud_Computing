import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HttpClient } from '@angular/common/http';
import { AttData } from './model/att-data';
import { CartData } from './model/cart-data';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  //public cartItemList : any = []
  //public productList = new BehaviorSubject<any>([]);

  constructor(private http: HttpClient, private afs: AngularFirestore) {}

  // getProduct(){
  //   return this.productList.asObservable();
  // }

  // setproduct(product : any){
  //   this.cartItemList.push(...product);
  //   this.productList.next(product);
  // }
  
  // addToCart(attdata : any){
  //   this.cartItemList.push(attdata);
  //   // this.cartItemList.push(product);
  //   // this.productList.next(this.cartItemList);
  //   // this.getTotalPrice();
  //   // console.log(this.cartItemList);
  // }

  // getTotalPrice() : number{
  //   let grandTotal = 0;
  //   this.cartItemList.map((a:any)=>{
  //     grandTotal += a.total;
  //   })
  //   return grandTotal;
  // }

  // removeCartItem(product: any){
  //   this.cartItemList.map((a:any, index:any)=>{
  //     if(product.id=== a.id){
  //       this.cartItemList.splice(index,1);
  //     }
  //   })
  // }

  // removeAllCart(){
  //   this.cartItemList = []
  //   this.productList.next(this.cartItemList);
  // }

  // Get Attractions
  getAllAttractions() {
    return this.afs.collection('/attdatas').snapshotChanges();
  }

  // Add Attractions
  addAttraction(attdata: AttData) {
    attdata.att_id = this.afs.createId();
    return this.afs.collection('/cartdatas').add(attdata);
  }

  //Store to firestore
  addCartItem(cartData: CartData) {
    return this.afs.collection('/cartdatas').add(cartData);
  }

  //Fetch from firestore OR Get Cart Item from firestore
  addToCart() {
    return this.afs.collection('/cartdatas').snapshotChanges();
  }

  //Delete Cart Item
  // deleteCartItem(cartdata: CartData) {
  //   return this.afs.doc('/cartdatas/'+ cartdata.cart_id).delete();
  // }

  // deleteCartItem(cartdata: CartData) {
  //   const cartItemId = cartdata.cart_id;
  //   return this.afs.collection('/cartdatas').doc(cartItemId).delete();
  // }

  deleteCartItem(cartdata: CartData) {
    return this.afs.collection('/cartdatas').doc(cartdata.cart_id).delete();
  }

  updateCartItem(cartItem: CartData){
    return this.afs.collection('/cartdatas').doc(cartItem.cart_id).update(cartItem);
  }

}