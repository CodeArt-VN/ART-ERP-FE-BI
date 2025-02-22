import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PurchaseProductPage } from './purchase-product.page';

describe('PurchaseProductPage', () => {
	let component: PurchaseProductPage;
	let fixture: ComponentFixture<PurchaseProductPage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PurchaseProductPage],
			imports: [IonicModule.forRoot()],
		}).compileComponents();

		fixture = TestBed.createComponent(PurchaseProductPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
