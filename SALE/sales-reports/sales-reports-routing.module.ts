import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/app.guard';

import { SalesReportsPage } from './sales-reports.page';

const routes: Routes = [
  {
    path: '',
    component: SalesReportsPage,
    children: [
      //{ path: 'sale-overview', children: [{ loadChildren: () => import('./tabs/sale-overview/sale-overview.module').then(m => m.SaleOverviewPageModule), path: '', canActivate: [AuthGuard] }] },
      { path: 'sale-saleman', children: [{ loadChildren: () => import('./tabs/sale-saleman/sale-saleman.module').then(m => m.SaleSalemanPageModule), path: '', canActivate: [AuthGuard] }] },
      { path: 'sale-product', children: [{ loadChildren: () => import('./tabs/sale-product/sale-product.module').then(m => m.SaleProductPageModule), path: '', canActivate: [AuthGuard] }] },
      { path: 'sale-outlet', children: [{ loadChildren: () => import('./tabs/sale-outlet/sale-outlet.module').then(m => m.SaleOutletPageModule), path: '', canActivate: [AuthGuard] }] },



      {
      	path: '',
      	redirectTo: '/sales-reports/sale-saleman',
      	pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesReportsPageRoutingModule { }
