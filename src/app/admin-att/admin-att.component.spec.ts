import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAttComponent } from './admin-att.component';

describe('AdminAttComponent', () => {
  let component: AdminAttComponent;
  let fixture: ComponentFixture<AdminAttComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAttComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAttComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
