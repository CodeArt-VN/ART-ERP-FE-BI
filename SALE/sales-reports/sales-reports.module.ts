import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesReportsPageRoutingModule } from './sales-reports-routing.module';

import { SalesReportsPage } from './sales-reports.page';
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
    SalesReportsPageRoutingModule
  ],
  declarations: [SalesReportsPage]
})
export class SalesReportsPageModule {}
