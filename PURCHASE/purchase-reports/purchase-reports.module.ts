import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PurchaseReportsPageRoutingModule } from './purchase-reports-routing.module';

import { PurchaseReportsPage } from './purchase-reports.page';
import { ShareModule } from 'src/app/share.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShareModule,
    PurchaseReportsPageRoutingModule
  ],
  declarations: [PurchaseReportsPage]
})
export class PurchaseReportsPageModule {}
