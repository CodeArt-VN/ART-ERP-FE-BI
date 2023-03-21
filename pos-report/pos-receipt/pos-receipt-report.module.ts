import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule  } from '@angular/forms';

import { ShareModule } from 'src/app/share.module';

import { NgSelectModule } from '@ng-select/ng-select';
import { POSReceiptReportPage } from './pos-receipt-report.page';
import { ShareChartsModule } from 'src/app/components/charts/share-charts.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    ShareChartsModule,
    ShareModule,
    RouterModule.forChild([{ path: '', component: POSReceiptReportPage }])
  ],
  declarations: [POSReceiptReportPage]
})
export class POSReceiptReportPageModule {}
