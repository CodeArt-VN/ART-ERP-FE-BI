import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ShareModule } from 'src/app/share.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PriceListCompareComponent } from './price-list-compare/price-list-compare.component';
import { PriceListVersionCompareComponent } from './price-list-version-compare/price-list-version-compare.component';

@NgModule({
  imports: [IonicModule, CommonModule, ShareModule, FormsModule, ReactiveFormsModule],
  declarations: [PriceListCompareComponent, PriceListVersionCompareComponent],
  exports: [PriceListCompareComponent, PriceListVersionCompareComponent],
})
export class PriceReportComponentsModule {}
