import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/app.guard';

import { PurchaseReportsPage } from './purchase-reports.page';

const routes: Routes = [
  {
    path: '',
    component: PurchaseReportsPage,
    children: [
      {
        path: 'ap-invoice',
        children: [
          {
            loadChildren: () => import('./tabs/ap-invoice/ap-invoice.module').then((m) => m.ApInvoicePageModule),
            path: '',
            canActivate: [AuthGuard],
          },
        ],
      },
      {
        path: 'purchase-buyer',
        children: [
          {
            loadChildren: () =>
              import('./tabs/purchase-buyer/purchase-buyer.module').then((m) => m.PurchaseBuyerPageModule),
            path: '',
            canActivate: [AuthGuard],
          },
        ],
      },
      {
        path: 'purchase-product',
        children: [
          {
            loadChildren: () =>
              import('./tabs/purchase-product/purchase-product.module').then((m) => m.PurchaseProductPageModule),
            path: '',
            canActivate: [AuthGuard],
          },
        ],
      },
      {
        path: 'purchase-vendor',
        children: [
          {
            loadChildren: () =>
              import('./tabs/purchase-vendor/purchase-vendor.module').then((m) => m.PurchaseVendorPageModule),
            path: '',
            canActivate: [AuthGuard],
          },
        ],
      },

      {
        path: '',
        redirectTo: '/purchase-reports/purchase-buyer',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchaseReportsPageRoutingModule {}
