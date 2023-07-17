import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShareModule } from 'src/app/share.module';
import { PosDayPage } from './pos-day.page';
import { FileUploadModule } from 'ng2-file-upload';
import { ShareChartsModule } from 'src/app/components/charts/share-charts.module';

const routes: Routes = [
  {
    path: '',
    component: PosDayPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    FileUploadModule,
    ShareModule,
    ShareChartsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PosDayPage]
})
export class PosDayPageModule { }
