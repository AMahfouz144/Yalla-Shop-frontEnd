import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePromoComponent } from './create-promo.component';

describe('CreatePromoComponent', () => {
  let component: CreatePromoComponent;
  let fixture: ComponentFixture<CreatePromoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreatePromoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreatePromoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
