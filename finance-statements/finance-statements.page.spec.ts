import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FinanceStatementsPage } from './finance-statements.page';

describe('FinanceStatementsPage', () => {
  let component: FinanceStatementsPage;
  let fixture: ComponentFixture<FinanceStatementsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FinanceStatementsPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FinanceStatementsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
