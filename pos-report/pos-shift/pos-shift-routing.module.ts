import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/app.guard';
import { PosShiftPage } from './pos-shift.page';

const routes: Routes = [
  {
    path: '',
    component: PosShiftPage,
    children: [
      {
        path: 'sale-saleman',
        children: [
          {
            loadChildren: () => import('./tabs/sale-saleman/sale-saleman.module').then((m) => m.SaleSalemanPageModule),
            path: '',
            canActivate: [AuthGuard],
          },
        ],
      },

      {
        path: '',
        redirectTo: '/pos-shift/sale-saleman',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PosShiftPageRoutingModule {}
