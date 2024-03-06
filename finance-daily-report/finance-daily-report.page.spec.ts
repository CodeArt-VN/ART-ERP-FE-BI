import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FinanceDailyReportPage } from './finance-daily-report.page';

describe('FinanceDailyReportPage', () => {
  let component: FinanceDailyReportPage;
  let fixture: ComponentFixture<FinanceDailyReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FinanceDailyReportPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(FinanceDailyReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
