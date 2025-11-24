import { Component } from '@angular/core';
import { AuthenticationService } from '../shared/authentication.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { DataService } from '../shared/data.service';
import { AttData } from '../model/att-data';

@Component({
  selector: 'app-admin-att',
  templateUrl: './admin-att.component.html',
  styleUrls: ['./admin-att.component.css']
})
export class AdminAttComponent {
  attdataList: AttData[] = [];
  attdataObj: AttData= {
    att_id: '',
    att_name: '',
    att_desc: '',
    att_openHrs: '',
    att_closeHrs: '',
    att_price: '',
    att_location: '',
    att_image: '',
    att_qty: ''
  };
  att_id: string= '';
  att_name: string= '';
  att_desc: string= '';
  att_openHrs: string= '';
  att_closeHrs: string= '';
  att_price: string= '';
  att_location: string= '';
  att_image: string= '';

  constructor(private auth: AuthenticationService, private data: DataService, private afAuth: AngularFireAuth) {}

  ngOnInit(): void {
    this.getAllAttractions();
  }

  // register() {
  //   this.auth.logout();
  // }

  // Get All Attractions
  getAllAttractions() {
    this.data.getAllAttractions().subscribe(res => {
      this.attdataList= res.map( (e: any) => {
        const data= e.payload.doc.data();
        data.att_id= e.payload.doc.id;
        return data;
      })
    }, err => {
      alert('Error while fetching attractions, please try again later');
    })
  }

  // Reset Form
  resetForm() {
    this.att_id= '';
    this.att_name= '';
    this.att_desc= '';
    this.att_openHrs= '';
    this.att_closeHrs= '';
    this.att_price= '';
    this.att_location= '';
    this.att_image= '';
  }

  // Add Attraction
  addAttraction() {
    if(this.att_name == '' || this.att_desc == '' || this.att_openHrs == '' || this.att_closeHrs == '' ||this.att_price == '' || this.att_location == '') {
      alert('Please fill in all fields');
      return;
    }

    this.attdataObj.att_id= '';
    this.attdataObj.att_name= this.att_name;
    this.attdataObj.att_desc= this.att_desc;
    this.attdataObj.att_openHrs= this.att_openHrs;
    this.attdataObj.att_closeHrs= this.att_closeHrs;
    this.attdataObj.att_price= this.att_price;
    this.attdataObj.att_location= this.att_location;
    this.attdataObj.att_image= this.att_image;

    this.data.addAttraction(this.attdataObj);
    this.resetForm();
  }

  //Update Attraction
  updateAttraction() {

  }

  // Delete Attraction
  deleteAttraction(attdata: AttData) {
    if(window.confirm('Are you sure you want to delete ' + attdata.att_name + '?')){
      this.data.deleteAttraction(attdata);
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

}
