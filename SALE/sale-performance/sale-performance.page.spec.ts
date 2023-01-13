import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SalePerformancePage } from './sale-performance.page';

describe('SalePerformancePage', () => {
  let component: SalePerformancePage;
  let fixture: ComponentFixture<SalePerformancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SalePerformancePage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SalePerformancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
