import { Component, ElementRef, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AttData } from '../model/att-data';
import { EatData } from '../model/eat-data';
import { DataService } from '../shared/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit, OnDestroy {
  attdataList: AttData[] = [];
  eatdataList: EatData[] = [];
  additionalAttractions: AttData[] = [];
  carousel!: HTMLElement;
  leftBtn!: HTMLElement;
  rightBtn!: HTMLElement;
  indicators!: NodeListOf<Element>;
  leftBtn1!: HTMLElement;
  rightBtn1!: HTMLElement;
  leftBtn2!: HTMLElement;
  rightBtn2!: HTMLElement;
  span = 0;
  prv = 0;
  currentIndex = 0;
  isMobile = false;
  timer: any;

  constructor(private elRef: ElementRef, private dataService: DataService, private router: Router) {}

  ngOnInit() {
    this.carousel = this.elRef.nativeElement.querySelector('.carousel');
    this.leftBtn = this.elRef.nativeElement.querySelector('.leftbtn');
    this.rightBtn = this.elRef.nativeElement.querySelector('.rightbtn');
    this.indicators = this.elRef.nativeElement.querySelectorAll('.indicator');
    this.leftBtn1 = this.elRef.nativeElement.querySelector('.leftbtn1');
    this.rightBtn1 = this.elRef.nativeElement.querySelector('.rightbtn1');
    this.leftBtn2 = this.elRef.nativeElement.querySelector('.leftbtn2');
    this.rightBtn2 = this.elRef.nativeElement.querySelector('.rightbtn2');

    this.getFourAttractions();
    this.initializeSlider();
    this.getTwoEateries();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkIfMobile();
    this.updateSlider();
  }

  initializeSlider() {
    Array.from(this.indicators).forEach((indicator) => {
      indicator.addEventListener('click', () => {
        this.clearActive(this.currentIndex);
        const index = Array.from(this.indicators).indexOf(indicator);
        this.executeMove(index);
        this.currentIndex = index;
        indicator.classList.add('active');
      });
    });

    this.leftBtn.addEventListener('click', () => {
      this.moveSlide('left');
    });

    this.rightBtn.addEventListener('click', () => {
      this.moveSlide('right');
    });
    this.leftBtn1.addEventListener('click', () => {
      this.moveSlide('left');
    });

    this.rightBtn1.addEventListener('click', () => {
      this.moveSlide('right');
    });

    this.leftBtn2.addEventListener('click', () => {
      this.moveSlide('left');
    });

    this.rightBtn2.addEventListener('click', () => {
      this.moveSlide('right');
    });

    this.updateSlider();
    this.startAutoSlide();
  }

  getFourAttractions() {
    this.dataService.getAllAttractions().subscribe(
      (res: any) => {
        const attractions = res.map((e: any) => {
          const data = e.payload.doc.data();
          data.att_id = e.payload.doc.id;
          return data;
        });

        const attractionsFiltered = attractions.filter((attraction: AttData) => {
          return (
            attraction.att_name === 'Penang Botanic Gardens' ||
            attraction.att_name === 'Penang Hill' ||
            attraction.att_name === 'ESCAPE Penang' ||
            attraction.att_name === 'The Habitat Penang Hill'
          );
        });

        this.attdataList = attractionsFiltered.slice(0, 2);
        this.additionalAttractions = attractionsFiltered.slice(2, 4);

        this.attdataList.forEach((attraction: AttData) => {
          if (attraction.att_name === 'Penang Botanic Gardens') {
            attraction.att_image = 'https://apicms.thestar.com.my/uploads/images/2021/04/30/1119173.jpg';
          } else if (attraction.att_name === 'Penang Hill') {
            attraction.att_image = 'https://media2.malaymail.com/uploads/articles/2018/2018-11/2111_SZ_penang_hill1.jpg';
          }
        });

        this.additionalAttractions.forEach((attraction: AttData) => {
          if (attraction.att_name === 'ESCAPE Penang') {
            attraction.att_image = 'https://www.pelago.co/img/products/MY-Malaysia/escape-penang/743fd9ec-0f95-40c2-b5c2-fcb6c235cb4a_escape-penang.jpg';
          } else if (attraction.att_name === 'The Habitat Penang Hill') {
            attraction.att_image = 'https://mypenang.gov.my/uploads/directory/136/cover/The-Habitat-Penang-Hill-1.jpg';
          }
        });
      },
      (err: any) => {
        console.error('Error while fetching attractions:', err);
      }
    );
  }

  clearActive(current: number) {
    Array.from(this.indicators).forEach((indicator) => {
      indicator.classList.remove('active');
    });
  }

  executeMove(index: number) {
    const mov = index * this.span;
    this.carousel.animate(
      [
        { transform: `translateX(-${this.prv}px)` },
        { transform: `translateX(-${mov}px)` }
      ],
      { duration: 300 }
    );
    this.carousel.style.transform = `translateX(-${mov}px)`;
    this.prv = mov;
  }

  moveSlide(dir: string) {
    this.stopAutoSlide();

    if (dir === 'right') {
      this.currentIndex++;
    } else {
      this.currentIndex--;
    }

    if (this.currentIndex < 0) {
      this.currentIndex = this.indicators.length - 1;
    }

    if (this.currentIndex > this.indicators.length - 1) {
      this.currentIndex = 0;
    }

    this.clearActive(this.currentIndex);
    this.executeMove(this.currentIndex);
    this.indicators[this.currentIndex].classList.add('active');

    this.startAutoSlide();
  }

  checkIfMobile() {
    this.isMobile = window.innerWidth < 768;
  }

  updateSlider() {
    this.checkIfMobile();
    this.span = this.carousel.offsetWidth;
    const mov = this.currentIndex * this.span;
    this.carousel.style.transform = `translateX(-${mov}px)`;
    this.prv = mov;
  }

  startAutoSlide() {
    this.timer = setInterval(() => {
      this.moveSlide('right');
    }, 5000);
  }

  stopAutoSlide() {
    clearInterval(this.timer);
  }

  redirectToAttractionDashboardComponent(attdata: AttData): void {
    const { att_id, att_name, att_image, att_desc, att_openHrs, att_closeHrs, att_price, att_location } = attdata;
    this.router.navigate(['/attraction-dashboard'], {
      state: {
        att_id,
        att_name,
        att_image,
        att_desc,
        att_openHrs,
        att_closeHrs,
        att_price,
        att_location
      }
    });
  }

  getTwoEateries() {
    this.dataService.getAllEateries().subscribe(
      (res: any) => {
        this.eatdataList = res
          .map((e: any) => {
            const data = e.payload.doc.data();
            data.eat_id = e.payload.doc.id;
            return data;
          })
          .filter((eatdata: EatData) => {
            return (
              eatdata.eat_name === 'Penang Road Famous Laksa' || eatdata.eat_name === 'Penang Road Famous Teochew Chendul'
            );
          })
          .slice(0, 2);

        // Manually assign image URLs for the eateries
        this.eatdataList.forEach((eatdata: EatData) => {
          if (eatdata.eat_name === 'Penang Road Famous Laksa') {
            eatdata.eat_image = 'https://www.penang-fyi.com/wp-content/uploads/2018/11/penang-laksa.jpg';
          } else if (eatdata.eat_name === 'Penang Road Famous Teochew Chendul') {
            eatdata.eat_image = 'https://1.bp.blogspot.com/-jWyVcgn96yk/XyeVB_JJenI/AAAAAAAA8gI/ZfcmuzXgSOQ9zYWVbpyZQCCxXtfrundHACNcBGAsYHQ/s640/IMG_2591.jpg';
          }
        });
      },
      (err: any) => {
        console.error('Error while fetching eateries:', err);
      }
    );
  }

  redirectToEateriesDashboardComponent(eatdata: EatData): void {
    const { eat_id, eat_name, eat_image, eat_desc, eat_openHrs, eat_closeHrs, eat_price, eat_location } = eatdata;
    this.router.navigate(['/eateries-dashboard'], {
      state: {
        eat_id,
        eat_name,
        eat_image,
        eat_desc,
        eat_openHrs,
        eat_closeHrs,
        eat_price,
        eat_location,
        data: this.eatdataList
      }
    });
  }
}
