import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShareModule } from 'src/app/share.module';
import { PosRevenuePage } from './pos-revenue.page';
import { ShareChartsModule } from 'src/app/components/charts/share-charts.module';

const routes: Routes = [
  {
    path: '',
    component: PosRevenuePage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ShareModule,
    ShareChartsModule,
    RouterModule.forChild(routes),
  ],
  declarations: [PosRevenuePage],
})
export class PosRevenuePageModule {}
