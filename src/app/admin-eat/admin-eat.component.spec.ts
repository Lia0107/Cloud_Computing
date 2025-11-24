import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEatComponent } from './admin-eat.component';

describe('AdminEatComponent', () => {
  let component: AdminEatComponent;
  let fixture: ComponentFixture<AdminEatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminEatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
