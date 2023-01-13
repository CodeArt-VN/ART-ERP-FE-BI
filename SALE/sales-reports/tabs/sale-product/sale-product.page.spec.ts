import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SaleProductPage } from './sale-product.page';

describe('SaleProductPage', () => {
  let component: SaleProductPage;
  let fixture: ComponentFixture<SaleProductPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SaleProductPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SaleProductPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
