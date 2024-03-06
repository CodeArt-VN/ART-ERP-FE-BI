import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SaleSummaryMobilePage } from './sale-summary-mobile.page';

describe('SaleSummaryMobilePage', () => {
  let component: SaleSummaryMobilePage;
  let fixture: ComponentFixture<SaleSummaryMobilePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SaleSummaryMobilePage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(SaleSummaryMobilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
