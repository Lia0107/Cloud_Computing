import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EateriesDashboardComponent } from './eateries-dashboard.component';

describe('EateriesDashboardComponent', () => {
  let component: EateriesDashboardComponent;
  let fixture: ComponentFixture<EateriesDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EateriesDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EateriesDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
