import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { DataService } from '../shared/data.service';
import { EatData } from '../model/eat-data';


@Component({
  selector: 'app-eateries-dashboard',
  templateUrl: './eateries-dashboard.component.html',
  styleUrls: ['./eateries-dashboard.component.css']
})
export class EateriesDashboardComponent implements OnInit{

  selectedData: any;

  constructor(private route: ActivatedRoute, private dataservice : DataService) {}

  ngOnInit(): void {
    this.selectedData = history.state;
  console.log('Selected Data:', this.selectedData);

  const { eat_openHrs, eat_closeHrs } = this.selectedData;
  console.log('eat_openHrs:', eat_openHrs);
  console.log('eat_closeHrs:', eat_closeHrs);
  
  console.log('Time parameter:', this.formatTime(eat_openHrs));
  console.log('Time parameter:', this.formatTime(eat_closeHrs));
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

  getImageUrl(eatdata: EatData): string {
    return eatdata.eat_image;
  }

}
