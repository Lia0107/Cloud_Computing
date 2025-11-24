import { Component, OnInit } from '@angular/core';
import { DataService } from '../shared/data.service';
import { ActivatedRoute } from '@angular/router';
import { AttData } from '../model/att-data';
import { Router } from '@angular/router';
import { BookData } from '../model/book-data';

@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.css']
})
export class BookingDetailsComponent implements OnInit {
  selectedData: any;
  progress: number = 0;
  calendar: Date[][] = [];
  currentMonth: number = 0;
  currentYear: number = 0;
  selectedDate: Date = new Date();
  adultCount: number = 1;
  childCount: number = 0;

  bookdataList: BookData[] = [];
  bookdataObj: BookData = {
    book_id: '',
    book_adult: '',
    book_child: '',
    book_date: '',
    book_contact: 0,
    book_email: '',
    book_fname: '',
    book_lname: '',
    book_location: '',
  }
  book_id: string= '';
  book_adult: string= '';
  book_child: string= '';
  book_date: string= '';
  book_contact: number= 0;
  book_email: string= '';
  book_fname: string= '';
  book_lname: string= '';
  book_location: string= '';
  

  constructor(private route: ActivatedRoute, private router: Router) {
    this.initializeCalendar();
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.selectedDate = new Date(); // Initialize as an empty Date object
  }

  ngOnInit(): void {
    this.selectedData = history.state;
    console.log('Selected Data:', this.selectedData);

    const { att_openHrs, att_closeHrs } = this.selectedData;
    console.log('att_openHrs:', att_openHrs);
    console.log('att_closeHrs:', att_closeHrs);

    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();

    this.initializeCalendar();
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

  getImageUrl(attdata: AttData): string {
    return attdata.att_image;
  }

  updateLoader(progress: number): void {
    this.progress = progress;
  }

  initializeCalendar(): void {
    this.calendar = [];

    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);

    let startDate = new Date(firstDayOfMonth.getTime()); // Create a new Date object
    const endDate = new Date(lastDayOfMonth);

    while (startDate <= endDate) {
      const week: Date[] = [];

      for (let i = 0; i < 7; i++) {
        week.push(new Date(startDate.getTime())); // Create a new Date object
        startDate.setDate(startDate.getDate() + 1);
      }

      this.calendar.push(week);
    }
  }

  goToPreviousMonth(): void {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.updateCalendar();
  }

  goToNextMonth(): void {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.updateCalendar();
  }

  updateCalendar(): void {
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);

    let startDate = new Date(firstDayOfMonth);
    const endDate = new Date(lastDayOfMonth);

    this.calendar = [];

    while (startDate <= endDate) {
      const week: Date[] = [];

      for (let i = 0; i < 7; i++) {
        week.push(new Date(startDate));
        startDate.setDate(startDate.getDate() + 1);
      }

      this.calendar.push(week);
    }
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
  }

  submitBookingForm(): void {
    // Handle the form submission logic here
    // You can access the form fields using their respective IDs or by binding them to properties in the component
    // For example, you can access the firstName field value as follows:
    // const firstName = (<HTMLInputElement>document.getElementById('firstName')).value;
    // Perform the necessary operations with the form data (e.g., send it to the server)
    this.router.navigate(['/check-out']);
    console.log('Form submitted!');
  }

  getMonthName(month: number): string {
    const date = new Date(this.currentYear, month);
    return date.toLocaleDateString('en-US', { month: 'long' });
  }

  increment(field: string) {
    if (field === 'adult') {
      this.adultCount++;
    } else if (field === 'child') {
      this.childCount++;
    }
  }

  decrement(field: string) {
    if (field === 'adult' && this.adultCount > 1) {
      this.adultCount--;
    } else if (field === 'child' && this.childCount > 0) {
      this.childCount--;
    }
  }


  redirectToBookingDetailsComponent(attdata: AttData): void {
    const { att_image, att_name, att_price } = attdata;  
    this.router.navigate(['/check-out'], {
      state: {
        cartdataList: [
          { cart_item_image: att_image, cart_item_name: att_name, cart_item_price: att_price }
        ]
      }
    });
  }



  // Update the progress value based on your logic
  updateProgress(): void {
    this.progress = 2; // Set it to the desired value
  }
  
  
}