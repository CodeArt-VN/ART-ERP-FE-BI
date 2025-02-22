import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicReportDetailPage } from './dynamic-report-detail.page';
import { ShareModule } from 'src/app/share.module';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
	imports: [IonicModule, CommonModule, FormsModule, ShareModule, RouterModule.forChild([{ path: '', component: DynamicReportDetailPage }])],
	declarations: [DynamicReportDetailPage],
})
export class DynamicReportDetailPageModule {}
