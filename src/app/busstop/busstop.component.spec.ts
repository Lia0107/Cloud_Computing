import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusstopComponent } from './busstop.component';

describe('BusstopComponent', () => {
  let component: BusstopComponent;
  let fixture: ComponentFixture<BusstopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusstopComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusstopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
