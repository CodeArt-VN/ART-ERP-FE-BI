import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PriceReportPage } from './price-report.page';

describe('PriceReportPage', () => {
  let component: PriceReportPage;
  let fixture: ComponentFixture<PriceReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PriceReportPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PriceReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
