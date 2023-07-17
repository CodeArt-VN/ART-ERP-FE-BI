import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PosShiftPage } from './pos-shift.page';
import { ShareModule } from 'src/app/share.module';
// import { RouterModule } from '@angular/router';
import { ShareChartsModule } from 'src/app/components/charts/share-charts.module';
import { PosShiftPageRoutingModule } from './pos-shift-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShareModule,
    ShareChartsModule,
    PosShiftPageRoutingModule
  ],
  declarations: [PosShiftPage]
})
export class PosShiftPageModule {}
