import { Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/app.guard';


export const BIRoutes: Routes = [

	//POS

	{ path: 'pos-dashboard', loadChildren: () => import('./dynamic-dashboard/dynamic-dashboard.module').then(m => m.DynamicDashboardPageModule), canActivate: [AuthGuard] },

	{ path: 'sales-by-hour-of-day', loadChildren: () => import('./dynamic-report/dynamic-report.module').then(m => m.DynamicReportPageModule), canActivate: [AuthGuard] },
	{ path: 'sales-by-day-of-week', loadChildren: () => import('./dynamic-report/dynamic-report.module').then(m => m.DynamicReportPageModule), canActivate: [AuthGuard] },
	{ path: 'bill-status-report', loadChildren: () => import('./dynamic-report/dynamic-report.module').then(m => m.DynamicReportPageModule), canActivate: [AuthGuard] },
	{ path: 'payment-methods', loadChildren: () => import('./dynamic-report/dynamic-report.module').then(m => m.DynamicReportPageModule), canActivate: [AuthGuard] },
	{ path: 'bills-vs-target', loadChildren: () => import('./dynamic-report/dynamic-report.module').then(m => m.DynamicReportPageModule), canActivate: [AuthGuard] },
	{ path: 'income-n-expenses', loadChildren: () => import('./dynamic-report/dynamic-report.module').then(m => m.DynamicReportPageModule), canActivate: [AuthGuard] },
	{ path: 'bills-by-days', loadChildren: () => import('./dynamic-report/dynamic-report.module').then(m => m.DynamicReportPageModule), canActivate: [AuthGuard] },

	{ path: 'sankey-demo', loadChildren: () => import('./dynamic-report/dynamic-report.module').then(m => m.DynamicReportPageModule), canActivate: [AuthGuard] },
	{ path: 'cancellation-reason', loadChildren: () => import('./dynamic-report/dynamic-report.module').then(m => m.DynamicReportPageModule), canActivate: [AuthGuard] },
	{ path: 'cancellation-reason-by-staff', loadChildren: () => import('./dynamic-report/dynamic-report.module').then(m => m.DynamicReportPageModule), canActivate: [AuthGuard] },

	{ path: 'dynamic-dashboard/:id', loadChildren: () => import('./dynamic-dashboard/dynamic-dashboard.module').then(m => m.DynamicDashboardPageModule), canActivate: [AuthGuard] },
	{ path: 'dynamic-report/:id', loadChildren: () => import('./dynamic-report/dynamic-report.module').then(m => m.DynamicReportPageModule), canActivate: [AuthGuard] },

	

	//HRM reports
	{ path: 'branch-payroll-report', loadChildren: () => import('./HRM/branch-payroll-report/branch-payroll-report.module').then(m => m.BranchPayrollReportPageModule), canActivate: [AuthGuard] },


];

