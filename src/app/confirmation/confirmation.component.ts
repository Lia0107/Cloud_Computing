import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent {
  orderNumber: string;
  
    constructor() {
      //Generate random order number
      this.orderNumber= this.generateOrderNumber();
    }

    generateOrderNumber(): string {
      // Implement your logic to generate the order number here
      // For example, you can use a timestamp or a random string
      // Let's use a timestamp for demonstration purposes
      const timestamp = Date.now().toString();
      return timestamp;
    }
}
