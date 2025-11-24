import { Component } from '@angular/core';
import { AuthenticationService } from '../shared/authentication.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { DataService } from '../shared/data.service';
import { EatData } from '../model/eat-data';


@Component({
  selector: 'app-admin-eat',
  templateUrl: './admin-eat.component.html',
  styleUrls: ['./admin-eat.component.css']
})
export class AdminEatComponent {
  eatdataList: EatData[] = [];
  eatdataObj: EatData= {
    eat_id: '',
    eat_name: '',
    eat_contact:'',
    eat_desc: '',
    eat_openHrs: '',
    eat_closeHrs: '',
    eat_price: '',
    eat_location: '',
    eat_image: ''
  };
  eat_id: string= '';
  eat_name: string= '';
  eat_contact: string= '';
  eat_desc: string= '';
  eat_openHrs: string= '';
  eat_closeHrs: string= '';
  eat_price: string= '';
  eat_location: string= '';
  eat_image: string= '';

  constructor(private auth: AuthenticationService, private data: DataService, private afAuth: AngularFireAuth) {}

  ngOnInit(): void {
    this.getAllEateries();
  }

  // register() {
  //   this.auth.logout();
  // }

  // Get All Eateries
  getAllEateries() {
    this.data.getAllEateries().subscribe(res => {
      this.eatdataList= res.map( (e: any) => {
        const data= e.payload.doc.data();
        data.eat_id= e.payload.doc.id;
        return data;
      })
    }, err => {
      alert('Error while fetching eateries, please try again later');
    })
  }

  // Reset Form
  resetForm() {
    this.eat_id= '';
    this.eat_name= '';
    this.eat_contact= '';
    this.eat_desc= '';
    this.eat_openHrs= '';
    this.eat_closeHrs= '';
    this.eat_price= '';
    this.eat_location= '';
    this.eat_image= '';
  }

  // Add Eateries
  addEateries() {
    if(this.eat_name == '' || this.eat_desc == '' || this.eat_openHrs == '' || this.eat_closeHrs == '' ||this.eat_price == '' || this.eat_location == '' || this.eat_image == '') {
      alert('Please fill in all fields');
      return;
    }

    this.eatdataObj.eat_id= '';
    this.eatdataObj.eat_name= this.eat_name;
    this.eatdataObj.eat_contact= this.eat_contact;
    this.eatdataObj.eat_desc= this.eat_desc;
    this.eatdataObj.eat_openHrs= this.eat_openHrs;
    this.eatdataObj.eat_closeHrs= this.eat_closeHrs;
    this.eatdataObj.eat_price= this.eat_price;
    this.eatdataObj.eat_location= this.eat_location;
    this.eatdataObj.eat_image= this.eat_image;

    this.data.addEateries(this.eatdataObj);
    this.resetForm();
  }

  //Update Eateries
  updateEateries() {

  }

  // Delete Eateries
  deleteEateries(eatdata: EatData) {
    if(window.confirm('Are you sure you want to delete ' + eatdata.eat_name + '?')){
      this.data.deleteEateries(eatdata);
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
