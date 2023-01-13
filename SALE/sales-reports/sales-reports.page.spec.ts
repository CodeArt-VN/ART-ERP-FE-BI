import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SalesReportsPage } from './sales-reports.page';

describe('SalesReportsPage', () => {
  let component: SalesReportsPage;
  let fixture: ComponentFixture<SalesReportsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesReportsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SalesReportsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
