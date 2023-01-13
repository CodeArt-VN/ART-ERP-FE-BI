import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SaleDailyReportPage } from './sale-daily-report.page';

describe('SaleDailyReportPage', () => {
  let component: SaleDailyReportPage;
  let fixture: ComponentFixture<SaleDailyReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SaleDailyReportPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SaleDailyReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
