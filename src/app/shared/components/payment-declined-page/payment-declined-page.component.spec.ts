import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentDeclinedPageComponent } from './payment-declined-page.component';

describe('PaymentDeclinedPageComponent', () => {
  let component: PaymentDeclinedPageComponent;
  let fixture: ComponentFixture<PaymentDeclinedPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentDeclinedPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentDeclinedPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
