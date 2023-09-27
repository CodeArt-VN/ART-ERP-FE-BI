import { Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/app.guard';


export const BIRoutes: Routes = [

	//POS
	{ path: 'bill-status-report', loadChildren: () => import('./POS/bill-status-report/bill-status-report.module').then(m => m.BillStatusReportPageModule), canActivate: [AuthGuard] },

	//IT reports
	{ path: 'sample-dashboard', loadChildren: () => import('./IT/sample-dashboard/sample-dashboard.module').then(m => m.SampleDashboardPageModule), canActivate: [AuthGuard] },
	{ path: 'sample-report', loadChildren: () => import('./IT/dynamic-report/dynamic-report.module').then(m => m.DynamicReportPageModule), canActivate: [AuthGuard] },
	//{ path: 'sample-report', loadChildren: () => import('./IT/sample-report/sample-report.module').then(m => m.SampleReportPageModule), canActivate: [AuthGuard] },


	//HRM reports
	{ path: 'branch-payroll-report', loadChildren: () => import('./HRM/branch-payroll-report/branch-payroll-report.module').then(m => m.BranchPayrollReportPageModule), canActivate: [AuthGuard] },


];

