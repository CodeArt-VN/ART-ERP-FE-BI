import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FinanceManagementPage } from './finance-management.page';

describe('FinanceManagementPage', () => {
  let component: FinanceManagementPage;
  let fixture: ComponentFixture<FinanceManagementPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FinanceManagementPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FinanceManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
