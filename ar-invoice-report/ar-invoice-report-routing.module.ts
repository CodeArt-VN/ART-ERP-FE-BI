import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/app.guard';

import { ARInvoiceReportPage } from './ar-invoice-report.page';

const routes: Routes = [
	{
		path: '',
		component: ARInvoiceReportPage,
		children: [
			//{ path: 'sale-overview', children: [{ loadChildren: () => import('./tabs/sale-overview/sale-overview.module').then(m => m.SaleOverviewPageModule), path: '', canActivate: [AuthGuard] }] },
			{
				path: 'revenue',
				children: [
					{
						loadChildren: () => import('./tabs/revenue/revenue.module').then((m) => m.RevenuePageModule),
						path: '',
						canActivate: [AuthGuard],
					},
				],
			},

			{
				path: '',
				redirectTo: '/ar-invoice-report/revenue',
				pathMatch: 'full',
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ARInvoiceReportPageRoutingModule {}
