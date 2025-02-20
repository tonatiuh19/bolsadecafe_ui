import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoffeeWizardComponent } from './coffee-wizard.component';

describe('CoffeeWizardComponent', () => {
  let component: CoffeeWizardComponent;
  let fixture: ComponentFixture<CoffeeWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CoffeeWizardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoffeeWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
