import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ARInvoiceReportPage } from './ar-invoice-report.page';

describe('ARInvoiceReportPage', () => {
  let component: ARInvoiceReportPage;
  let fixture: ComponentFixture<ARInvoiceReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ARInvoiceReportPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ARInvoiceReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
