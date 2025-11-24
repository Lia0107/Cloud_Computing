import { Component } from '@angular/core';
import { AuthenticationService } from '../shared/authentication.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { DataService } from '../shared/data.service';
import { EventData } from '../model/event-data';

@Component({
  selector: 'app-admin-event',
  templateUrl: './admin-event.component.html',
  styleUrls: ['./admin-event.component.css']
})
export class AdminEventComponent {
  eventdataList: EventData[] = [];
  eventdataObj: EventData= {
    event_id: '',
    event_name: '',
    event_desc: '',
    event_date: '',
    event_openHrs: '',
    event_closeHrs: '',
    event_price: '',
    event_location: '',
    event_image: ''
  };
  event_id: string= '';
  event_name: string= '';
  event_desc: string= '';
  event_openHrs: string= '';
  event_closeHrs: string= '';
  event_price: string= '';
  event_location: string= '';
  event_image: string= '';

  constructor(private auth: AuthenticationService, private data: DataService, private afAuth: AngularFireAuth) {}

  ngOnInit(): void {
    this.getAllEateries();
  }

  // register() {
  //   this.auth.logout();
  // }

  // Get All Events
  getAllEateries() {
    this.data.getAllEvents().subscribe(res => {
      this.eventdataList= res.map( (e: any) => {
        const data= e.payload.doc.data();
        data.event_id= e.payload.doc.id;
        return data;
      })
    }, err => {
      alert('Error while fetching eateries, please try again later');
    })
  }

  // Reset Form
  resetForm() {
    this.event_id= '';
    this.event_name= '';
    this.event_desc= '';
    this.event_openHrs= '';
    this.event_closeHrs= '';
    this.event_price= '';
    this.event_location= '';
    this.event_image= '';
  }

  // Add Events
  addEvents() {
    if(this.event_name == '' || this.event_desc == '' || this.event_openHrs == '' || this.event_closeHrs == '' ||this.event_price == '' || this.event_location == '') {
      alert('Please fill in all fields');
      return;
    }

    this.eventdataObj.event_id= '';
    this.eventdataObj.event_name= this.event_name;
    this.eventdataObj.event_desc= this.event_desc;
    this.eventdataObj.event_openHrs= this.event_openHrs;
    this.eventdataObj.event_closeHrs= this.event_closeHrs;
    this.eventdataObj.event_price= this.event_price;
    this.eventdataObj.event_location= this.event_location;
    this.eventdataObj.event_image= this.event_image;

    this.data.addEvents(this.eventdataObj);
    this.resetForm();
  }

  //Update Events
  updateEateries() {

  }

  // Delete Events
  deleteEvents(eventdata: EventData) {
    if(window.confirm('Are you sure you want to delete ' + eventdata.event_name + '?')){
      this.data.deleteEvents(eventdata);
    }
  }

  formatTime(time: string): string {
    // Convert the time string to a JavaScript Date object
    const date = new Date(`2000-01-01T${time}`);
  
    // Format the time using options for hour12 and hourCycle
    const formattedTime = date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      hourCycle: 'h23'
    });
  
    return `${formattedTime}`;
  }
  handleFileInput(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const fileData = e.target.result;
        // Process the file data as needed (e.g., upload to server, display preview, etc.)
        console.log(fileData);
      };
      reader.readAsDataURL(file);
    }
  }  
}
