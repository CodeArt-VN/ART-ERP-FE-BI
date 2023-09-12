import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SampleDashboardPage } from './sample-dashboard.page';
import { ShareModule } from 'src/app/share.module';
import { GridsterComponent, GridsterItemComponent } from 'angular-gridster2';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ShareModule,
    RouterModule.forChild([{ path: '', component: SampleDashboardPage }]),

    GridsterComponent,
    GridsterItemComponent
  ],
  declarations: [SampleDashboardPage]
})
export class SampleDashboardPageModule {}
