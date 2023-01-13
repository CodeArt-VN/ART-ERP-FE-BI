import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SaleOverviewPage } from './sale-overview.page';

describe('SaleOverviewPage', () => {
  let component: SaleOverviewPage;
  let fixture: ComponentFixture<SaleOverviewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SaleOverviewPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SaleOverviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
