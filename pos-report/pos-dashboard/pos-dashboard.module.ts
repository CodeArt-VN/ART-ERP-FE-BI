import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PosDashboardPage } from './pos-dashboard.page';
import { ShareModule } from 'src/app/share.module';
import { RouterModule } from '@angular/router';
import { ShareChartsModule } from 'src/app/components/charts/share-charts.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShareModule,
    ShareChartsModule,
    RouterModule.forChild([{ path: '', component: PosDashboardPage }])
  ],
  declarations: [PosDashboardPage]
})
export class PosDashboardPageModule {}
