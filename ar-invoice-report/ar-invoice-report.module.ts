import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ARInvoiceReportPageRoutingModule } from './ar-invoice-report-routing.module';

import { ARInvoiceReportPage } from './ar-invoice-report.page';
import { ShareModule } from 'src/app/share.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgSelectModule,
    NgOptionHighlightModule,
    ShareModule,
    ARInvoiceReportPageRoutingModule
  ],
  declarations: [ARInvoiceReportPage]
})
export class ARInvoiceReportPageModule {}
