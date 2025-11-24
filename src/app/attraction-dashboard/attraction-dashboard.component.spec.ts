import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttractionDashboardComponent } from './attraction-dashboard.component';

describe('AttractionDashboardComponent', () => {
  let component: AttractionDashboardComponent;
  let fixture: ComponentFixture<AttractionDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttractionDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttractionDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
