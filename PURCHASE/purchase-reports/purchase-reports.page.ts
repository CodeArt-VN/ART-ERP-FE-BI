import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { ReportService } from 'src/app/services/custom/report.service';
import { CRM_ContactProvider, HRM_StaffProvider } from 'src/app/services/static/services.service';
import { concat, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-purchase-reports',
	templateUrl: './purchase-reports.page.html',
	styleUrls: ['./purchase-reports.page.scss'],
	standalone: false,
})
export class PurchaseReportsPage extends PageBase {
	segmentView = 'purchase-reports/purchase-buyer';

	filter = {
		type: 'd',
		frequency: 1,
		fromDate: '',
		toDate: '',
		isCalcShippedOnly: false,
		IDOwner: null,
		IDSeller: null,
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
		this.IDOwnerDataSource.initSearch();
		this.IDSellerDataSource.initSearch();
		//this.buyerSearch();
		// this.vendorSearch();
		super.loadedData(event);

		setTimeout(() => {
			this.runReports();
		}, 1);
	}

	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
		this.nav(ev.detail.value, 'root');
	}

	buyerList$;
	buyerListLoading = false;
	buyerListInput$ = new Subject<string>();
	buyerListSelected = [];
	buyerSelected = null;
	buyerSearch() {
		this.buyerListLoading = false;
		this.buyerList$ = concat(
			of(this.buyerListSelected),
			this.buyerListInput$.pipe(
				distinctUntilChanged(),
				tap(() => (this.buyerListLoading = true)),
				switchMap((term) =>
					this.staffProvider.search({ Take: 20, Skip: 0, Keyword: term }).pipe(
						catchError(() => of([])), // empty list on error
						tap(() => (this.buyerListLoading = false))
					)
				)
			)
		);
	}

	vendorList$;
	vendorListLoading = false;
	vendorListInput$ = new Subject<string>();
	vendorListSelected = [];
	vendorSelected = null;
	vendorSearch() {
		this.vendorListLoading = false;
		this.vendorList$ = concat(
			of(this.vendorListSelected),
			this.vendorListInput$.pipe(
				distinctUntilChanged(),
				tap(() => (this.vendorListLoading = true)),
				switchMap((term) =>
					this.contactProvider
						.search({
							Take: 20,
							Skip: 0,
							Keyword: term,
							IsVendor: true,
							SkipAddress: true,
						})
						.pipe(
							catchError(() => of([])), // empty list on error
							tap(() => (this.vendorListLoading = false))
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
		this.rpt.rptGlobal.query.IDOwner = this.filter.IDOwner;
		this.rpt.rptGlobal.query.IDSeller = this.filter.IDSeller;
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

	ExportPurchaseOutletReport() {
		this.rpt.rptGlobal.query._cmd = 'ExportPurchaseOutletReport';
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

	IDOwnerDataSource = {
		searchProvider: this.staffProvider,
		loading: false,
		input$: new Subject<string>(),
		selected: [],
		items$: null,
		initSearch() {
			this.loading = false;
			this.items$ = concat(
				of(this.selected),
				this.input$.pipe(
					distinctUntilChanged(),
					tap(() => (this.loading = true)),
					switchMap((term) =>
						this.searchProvider
							.search({
								SortBy: ['Id_desc'],
								Take: 20,
								Skip: 0,
								Keyword: term,
							})
							.pipe(
								catchError(() => of([])), // empty list on error
								tap(() => (this.loading = false))
							)
					)
				)
			);
		},
	};

	IDSellerDataSource = {
		searchProvider: this.contactProvider,
		loading: false,
		input$: new Subject<string>(),
		selected: [],
		items$: null,
		initSearch() {
			this.loading = false;
			this.items$ = concat(
				of(this.selected),
				this.input$.pipe(
					distinctUntilChanged(),
					tap(() => (this.loading = true)),
					switchMap((term) =>
						this.searchProvider
							.search({
								SortBy: ['Id_desc'],
								Take: 20,
								Skip: 0,
								Keyword: term,
								IsVendor: true,
								SkipAddress: true,
							})
							.pipe(
								catchError(() => of([])), // empty list on error
								tap(() => (this.loading = false))
							)
					)
				)
			);
		},
	};
}
