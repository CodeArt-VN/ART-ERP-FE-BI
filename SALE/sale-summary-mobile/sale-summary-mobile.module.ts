import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SaleSummaryMobilePageRoutingModule } from './sale-summary-mobile-routing.module';

import { SaleSummaryMobilePage } from './sale-summary-mobile.page';
import { ShareModule } from 'src/app/share.module';
import { ShareChartsModule } from 'src/app/components/charts/share-charts.module';

@NgModule({
  imports: [CommonModule, FormsModule, ShareModule, IonicModule, SaleSummaryMobilePageRoutingModule, ShareChartsModule],
  declarations: [SaleSummaryMobilePage],
})
export class SaleSummaryMobilePageModule {}
