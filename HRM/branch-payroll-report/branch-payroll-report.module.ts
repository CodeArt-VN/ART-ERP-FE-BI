import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BranchPayrollReportPage } from './branch-payroll-report.page';
import { ShareModule } from 'src/app/share.module';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ShareModule,
    NgSelectModule,
    RouterModule.forChild([{ path: '', component: BranchPayrollReportPage }])
  ],
  declarations: [BranchPayrollReportPage]
})
export class BranchPayrollReportPageModule {}
