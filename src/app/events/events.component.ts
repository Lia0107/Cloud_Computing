import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../shared/data.service';
import { EventData } from '../model/event-data';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css'],
})
export class EventsComponent implements OnInit {
  eventdataList: EventData[] = [];
  eventDates: string[] = [];
  displayData: EventData[] = [];
  filteredData: EventData[] = [];
  loadedItemCount: number = 4;
  itemsToLoad: number = 8;
  startIndex: number = 4;
  isDataLoaded: boolean = false;
  selectedLocations: string[] = []; // Array to store selected locations
  selectedDateFilter: string = ''; // Variable to store the selected date filter

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.getAllEvents();
    this.showMore();
  }

  getAllEvents() {
    this.dataService.getAllEvents().subscribe(
      (res: any[]) => {
        this.eventdataList = res.map((e: any) => {
          const data = e.payload.doc.data();
          data.event_id = e.payload.doc.id;
          return data as EventData;
        });
        this.sortData();
        this.eventDates = this.eventdataList.map((event) => event.event_date);
        this.isDataLoaded = true;
        this.displayDefaultContent();
      },
      (err: any) => {
        alert('Error while fetching events, please try again later');
      }
    );
  }

  sortData() {
    this.eventdataList.sort((a, b) => {
      return a.event_name.localeCompare(b.event_name);
    });
  }

  displayDefaultContent() {
    this.displayData = this.eventdataList.slice(0, this.loadedItemCount).map((event, index) => ({
      ...event,
      event_date: this.eventDates[index]
    }));
  }

  showMore() {
    if (!this.isDataLoaded) {
      return;
    }
    const remainingData = this.eventdataList.slice(this.startIndex);
    const newData = remainingData.slice(0, this.itemsToLoad).map((event, index) => ({
      ...event,
      event_date: this.eventDates[this.startIndex + index]
    }));
    this.displayData = [...this.displayData, ...newData];
    this.startIndex += this.itemsToLoad;
  }

  filterByLocation(event: any) {
    const checkbox = event.target;
    const locationValue = checkbox.value;

    if (checkbox.checked) {
      this.selectedLocations.push(locationValue);
    } else {
      const index = this.selectedLocations.indexOf(locationValue);
      if (index !== -1) {
        this.selectedLocations.splice(index, 1);
      }
    }

    this.applyFilters();
  }

  toggleDateFilter(filter: string) {
    if (this.selectedDateFilter === filter) {
      this.selectedDateFilter = ''; // Uncheck the selected filter
    } else {
      this.selectedDateFilter = filter;
    }

    this.applyFilters();
  }

  applyFilters() {
    let filteredData = this.eventdataList;

    if (this.selectedLocations.length > 0) {
      filteredData = filteredData.filter((event) =>
        this.selectedLocations.includes(event.event_location)
      );
    }

    if (this.selectedDateFilter === 'previous') {
      const currentDate = new Date();
      filteredData = filteredData.filter((event) => {
        const eventDate = new Date(event.event_date);
        return eventDate < currentDate;
      });
    } else if (this.selectedDateFilter === 'upcoming') {
      const currentDate = new Date();
      filteredData = filteredData.filter((event) => {
        const eventDate = new Date(event.event_date);
        return eventDate > currentDate;
      });
    }

    if (filteredData.length > 0) {
      this.filteredData = filteredData;
      this.displayData = this.filteredData.slice(0, this.loadedItemCount);
      this.startIndex = this.loadedItemCount;
    } else {
      this.filteredData = [];
      this.displayData = [];
      this.startIndex = 0;
    }
  }

  removeFilters() {
    this.selectedLocations = [];
    this.selectedDateFilter = '';
    this.applyFilters();
  }

  isFilterMenuOpen: boolean = false;

  toggleFilterMenu() {
    this.isFilterMenuOpen = !this.isFilterMenuOpen;
  }

  getImageUrl(eventdata: EventData): string {
    return eventdata.event_image;
  }
  
}
