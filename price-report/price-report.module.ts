import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PriceReportPage } from './price-report.page';
import { ShareModule } from 'src/app/share.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { PriceReportComponentsModule } from './components/price-report-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    PriceReportComponentsModule,
    ShareModule,
    NgSelectModule,
    NgOptionHighlightModule,
    RouterModule.forChild([{ path: '', component: PriceReportPage }])
  ],
  declarations: [PriceReportPage]
})
export class PriceReportPageModule {}
