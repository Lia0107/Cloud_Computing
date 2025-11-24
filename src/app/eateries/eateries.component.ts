import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../shared/data.service';
import { EatData } from '../model/eat-data';

@Component({
  selector: 'app-eateries',
  templateUrl: './eateries.component.html',
  styleUrls: ['./eateries.component.css']
})
export class EateriesComponent implements OnInit {
  eatdataList: EatData[] = [];
  displayData: EatData[] = [];
  filteredData: EatData[] = [];
  isDataLoaded: boolean = false;
  loadedItemCount: number = 4;
  itemsToLoad: number = 6;
  startIndex: number = 4;
  selectedCategories: string[] = [];
  isMenuOpen: boolean = false;
  selectedLocations: string[] = [];
  isFilterChecked: boolean = false;

  locations: string[] = ['George Town', 'Jelutong', 'Ayer Itam', 'Tanjung Tokong'];

  constructor(private route: ActivatedRoute, private router: Router, private dataService: DataService) {}

  ngOnInit(): void {
    this.getAllEateries();
  }

  getAllEateries() {
    this.dataService.getAllEateries().subscribe(
      (res: any[]) => {
        this.eatdataList = res.map((e: any) => {
          const data = e.payload.doc.data();
          data.eat_id = e.payload.doc.id;
          return data as EatData;
        });
        this.sortData();
        this.isDataLoaded = true;
        this.filteredData = this.eatdataList;
        this.displayData = this.filteredData.slice(0, this.loadedItemCount);
      },
      (err: any) => {
        alert('Error while fetching eateries, please try again later');
      }
    );
  }

  formatTime(time: string): string {
    const date = new Date(`2000-01-01T${time}`);
    const formattedTime = date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      hourCycle: 'h23'
    });
    return formattedTime;
  }

  sortData() {
    this.eatdataList.sort((a, b) => {
      return a.eat_name.localeCompare(b.eat_name);
    });
  }

  showMore() {
    if (!this.isDataLoaded) {
      return;
    }
    const remainingData = this.filteredData.slice(this.startIndex);
    const newData = remainingData.slice(0, this.itemsToLoad);
    this.displayData = [...this.displayData, ...newData];
    this.startIndex += this.itemsToLoad;
  }

  filterEateries(event: any) {
    const checkbox = event.target;
    const categoryName = checkbox.name;

    if (checkbox.checked) {
      this.selectedCategories.push(categoryName);
    } else {
      const index = this.selectedCategories.indexOf(categoryName);
      if (index !== -1) {
        this.selectedCategories.splice(index, 1);
      }
    }

    this.isFilterChecked = this.selectedCategories.length > 0;
    this.applyFilters();
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

  applyFilters() {
    this.filteredData = this.eatdataList.filter((eatdata) => {
      const isLocationMatch =
        this.selectedLocations.length === 0 ||
        this.selectedLocations.some((location) =>
          eatdata.eat_location.toLowerCase().includes(location.toLowerCase())
        );
      return isLocationMatch;
    });

    if (this.selectedCategories.length > 0) {
      this.filteredData = this.filteredData.filter((eatdata) =>
      this.selectedCategories.some((category) =>
      eatdata.eat_name.toLowerCase().includes(category.toLowerCase())
      )
      );
    }

    this.displayData = this.filteredData.slice(0, this.loadedItemCount);
    this.startIndex = this.loadedItemCount;
  }

  isFilterMenuOpen: boolean = false;

  toggleFilterMenu() {
    this.isFilterMenuOpen = !this.isFilterMenuOpen;
  }
  
  getImageUrl(eatdata: EatData): string {
    return eatdata.eat_image;
  }
}
