import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { ReportService } from 'src/app/services/report.service';
import { CRM_ContactProvider, HRM_StaffProvider, SALE_OrderProvider } from 'src/app/services/static/services.service';
import { NgSelectConfig } from '@ng-select/ng-select';
import { concat, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-sales-reports',
	templateUrl: './sales-reports.page.html',
	styleUrls: ['./sales-reports.page.scss'],
	standalone: false,
})
export class SalesReportsPage extends PageBase {
	segmentView = 'sales-reports/sale-saleman';

	filter = {
		type: 'd',
		frequency: 1,
		fromDate: '',
		toDate: '',
		saleman: null,
		outlet: null,
		isCalcShippedOnly: true,
	};

	constructor(
		public contactProvider: CRM_ContactProvider,
		public staffProvider: HRM_StaffProvider,
		public rpt: ReportService,
		public env: EnvService,
		public navCtrl: NavController
	) {
		super();
		this.filter.type = rpt.rptGlobal.query.type;
		this.filter.frequency = rpt.rptGlobal.query.frequency;
		this.filter.fromDate = rpt.rptGlobal.query.fromDate;
		this.filter.toDate = rpt.rptGlobal.query.toDate;
		this.pageConfig.isShowFeature = true;
	}

	loadData(event) {
		this.salemanSearch();
		this.outletSearch();
		super.loadedData(event);

		setTimeout(() => {
			this.runReports();
		}, 1);
	}

	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
		this.nav(ev.detail.value, 'root');
	}

	salemanList$;
	salemanListLoading = false;
	salemanListInput$ = new Subject<string>();
	salemanListSelected = [];
	salemanSelected = null;
	salemanSearch() {
		this.salemanListLoading = false;
		this.salemanList$ = concat(
			of(this.salemanListSelected),
			this.salemanListInput$.pipe(
				distinctUntilChanged(),
				tap(() => (this.salemanListLoading = true)),
				switchMap((term) =>
					this.staffProvider
						.search({
							Take: 20,
							Skip: 0,
							IDDepartment: this.env.selectedBranchAndChildren,
							Term: term,
						})
						.pipe(
							catchError(() => of([])), // empty list on error
							tap(() => (this.salemanListLoading = false))
						)
				)
			)
		);
	}

	outletList$;
	outletListLoading = false;
	outletListInput$ = new Subject<string>();
	outletListSelected = [];
	outletSelected = null;
	outletSearch() {
		this.outletListLoading = false;
		this.outletList$ = concat(
			of(this.outletListSelected),
			this.outletListInput$.pipe(
				distinctUntilChanged(),
				tap(() => (this.outletListLoading = true)),
				switchMap((term) =>
					this.contactProvider.search({ Take: 20, Skip: 0, Term: term }).pipe(
						catchError(() => of([])), // empty list on error
						tap(() => (this.outletListLoading = false))
					)
				)
			)
		);
	}

	refresh() {
		this.runReports();
	}

	runReports() {
		console.log('runReports');
		this.rpt.rptGlobal.query._cmd = 'runReport';
		this.rpt.rptGlobal.query.IDBranch = this.env.selectedBranchAndChildren;
		this.rpt.rptGlobal.query.frequency = this.filter.frequency;
		this.rpt.rptGlobal.query.fromDate = this.filter.fromDate;
		this.rpt.rptGlobal.query.toDate = this.filter.toDate;
		this.rpt.rptGlobal.query.saleman = this.filter.saleman;
		this.rpt.rptGlobal.query.outlet = this.filter.outlet;
		this.rpt.rptGlobal.query.isCalcShippedOnly = this.filter.isCalcShippedOnly;
		this.filter.type == 'set';
		this.rpt.rptGlobal.query.isShowFeature = this.pageConfig.isShowFeature;
		this.rpt
			.dateQuery(this.filter.type == 'set' ? 'setdone' : this.filter.type)
			.then((_) => {})
			.catch((err) => {
				let a = err;
			});
	}

	exportSaleProductReport() {
		this.rpt.rptGlobal.query._cmd = 'exportSaleProductReport';
		this.rpt.publishChange(this.rpt.rptGlobal.query);
	}

	changeDateFillter(type) {
		this.filter.type = type;
		let toDay = new Date();

		if (type == 'd') {
			this.filter.fromDate = lib.dateFormat(toDay, 'yyyy-mm-dd');
			this.filter.toDate = lib.dateFormat(toDay, 'yyyy-mm-dd');
		} else if (type == 'dw') {
			let weekDates = lib.getWeekDates(toDay);
			this.filter.fromDate = lib.dateFormat(weekDates[0], 'yyyy-mm-dd');
			this.filter.toDate = lib.dateFormat(weekDates[6], 'yyyy-mm-dd');
		} else if (type == 'dm' || type == 'm') {
			var first = new Date(toDay.getFullYear(), toDay.getMonth(), 1);
			var lastday = new Date(toDay.getFullYear(), toDay.getMonth() + 1, 0);
			this.filter.fromDate = lib.dateFormat(first, 'yyyy-mm-dd');
			this.filter.toDate = lib.dateFormat(lastday, 'yyyy-mm-dd');
		} else if (type == 'm3') {
			var first = new Date(toDay.getFullYear(), toDay.getMonth() - 2, 1);
			var lastday = new Date(toDay.getFullYear(), toDay.getMonth() + 1, 0);
			this.filter.fromDate = lib.dateFormat(first, 'yyyy-mm-dd');
			this.filter.toDate = lib.dateFormat(lastday, 'yyyy-mm-dd');
		} else if (type == 'm6') {
			var first = new Date(toDay.getFullYear(), toDay.getMonth() - 5, 1);
			var lastday = new Date(toDay.getFullYear(), toDay.getMonth() + 1, 0);
			this.filter.fromDate = lib.dateFormat(first, 'yyyy-mm-dd');
			this.filter.toDate = lib.dateFormat(lastday, 'yyyy-mm-dd');
		} else if (type == 'q' || type == 'q2' || type == 'q3') {
			var backMonth = type == 'q' ? 3 : type == 'q2' ? 6 : 9;

			var month = toDay.getMonth() + 1;
			var quarter = Math.ceil(month / 3);

			var first = new Date(toDay.getFullYear(), quarter * 3 - backMonth, 1);
			var lastday = new Date(toDay.getFullYear(), quarter * 3, 0);

			this.filter.fromDate = lib.dateFormat(first, 'yyyy-mm-dd');
			this.filter.toDate = lib.dateFormat(lastday, 'yyyy-mm-dd');
		} else if (type == 'my' || type == 'qy' || type == 'y' || type == 'y2' || type == 'y3') {
			var backYear = type == 'my' || type == 'qy' || type == 'y' ? 0 : type == 'y2' ? 1 : 2;

			var first = new Date(toDay.getFullYear() - backYear, 0, 1);
			var lastday = new Date(toDay.getFullYear(), 12, 0);
			this.filter.fromDate = lib.dateFormat(first, 'yyyy-mm-dd');
			this.filter.toDate = lib.dateFormat(lastday, 'yyyy-mm-dd');
		} else if (type == 'setdone') {
			this.filter.type = 'set';
		}
	}

	changeFrequency(f) {
		this.filter.frequency = f.Id;
	}
}
