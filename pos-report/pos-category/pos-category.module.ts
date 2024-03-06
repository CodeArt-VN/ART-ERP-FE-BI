import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShareModule } from 'src/app/share.module';
import { PosCategoryPage } from './pos-category.page';
import { ShareChartsModule } from 'src/app/components/charts/share-charts.module';

const routes: Routes = [
  {
    path: '',
    component: PosCategoryPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ShareModule,
    ShareChartsModule,
    RouterModule.forChild(routes),
  ],
  declarations: [PosCategoryPage],
})
export class PosCategoryPageModule {}
