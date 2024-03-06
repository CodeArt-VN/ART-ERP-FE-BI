import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SaleInsigntsPage } from './sale-insignts.page';

describe('SaleInsigntsPage', () => {
  let component: SaleInsigntsPage;
  let fixture: ComponentFixture<SaleInsigntsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SaleInsigntsPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(SaleInsigntsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
