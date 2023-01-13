import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SaleSummaryMobilePageRoutingModule } from './sale-summary-mobile-routing.module';

import { SaleSummaryMobilePage } from './sale-summary-mobile.page';
import { ShareModule } from 'src/app/share.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ShareModule,
    IonicModule,
    SaleSummaryMobilePageRoutingModule,

  ],
  declarations: [SaleSummaryMobilePage]
})
export class SaleSummaryMobilePageModule { }
