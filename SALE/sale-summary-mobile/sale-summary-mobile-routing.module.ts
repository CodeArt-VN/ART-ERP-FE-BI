import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SaleSummaryMobilePage } from './sale-summary-mobile.page';

const routes: Routes = [
	{
		path: '',
		component: SaleSummaryMobilePage,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class SaleSummaryMobilePageRoutingModule {}
