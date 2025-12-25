import { Routes } from '@angular/router'; 
import { AuthGuard } from 'src/app/guards/app.guard'; 

export const BIRoutes: Routes = [
  
  { path: 'dynamic-report', loadChildren: () => import('./dynamic-report/dynamic-report.module').then((m) => m.DynamicReportPageModule), canActivate: [AuthGuard] },
  { path: 'dynamic-report/:id', loadChildren: () => import('./dynamic-report-detail/dynamic-report-detail.module').then((m) => m.DynamicReportDetailPageModule), canActivate: [AuthGuard] },
  { path: 'reports/:code', loadChildren: () => import('./dynamic-report-detail/dynamic-report-detail.module').then((m) => m.DynamicReportDetailPageModule), canActivate: [AuthGuard] },

  { path: 'dynamic-dashboard', loadChildren: () => import('./dynamic-dashboard/dynamic-dashboard.module').then((m) => m.DynamicDashboardPageModule), canActivate: [AuthGuard] },
  { path: 'dynamic-dashboard/:id', loadChildren: () => import('./dynamic-dashboard-detail/dynamic-dashboard-detail.module').then((m) => m.DynamicDashboardDetailPageModule,), canActivate: [AuthGuard] },
  { path: 'dashboards/:code', loadChildren: () => import('./dynamic-dashboard-detail/dynamic-dashboard-detail.module').then((m) => m.DynamicDashboardDetailPageModule,), canActivate: [AuthGuard] },
  
  { path: 'branch-payroll-report', loadChildren: () => import('./HRM/branch-payroll-report/branch-payroll-report.module').then((m) => m.BranchPayrollReportPageModule), canActivate: [AuthGuard] },


];