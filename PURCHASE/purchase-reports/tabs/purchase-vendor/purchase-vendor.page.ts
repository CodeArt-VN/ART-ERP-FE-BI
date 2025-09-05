import { Component } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, NavController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { ReportService } from 'src/app/services/custom/report.service';
import { lib } from 'src/app/services/static/global-functions';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
	selector: 'app-purchase-vendor',
	templateUrl: 'purchase-vendor.page.html',
	styleUrls: ['purchase-vendor.page.scss'],
	standalone: false,
})
export class PurchaseVendorPage extends PageBase {
	today = '';
	reportQuery: any = {};

	constructor(
		public pageProvider: CommonService,
		public actionSheetController: ActionSheetController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public navCtrl: NavController,
		public rpt: ReportService
	) {
		super();
		this.today = lib.dateFormat(new Date(), 'hh:MM dd/mm/yyyy');

		this.pageConfig.subscribeReport = this.rpt.Tracking().subscribe((data) => {
			console.log('subscribeReport');
			this.reportQuery = {
				fromDate: data.fromDate,
				toDate: data.toDate,
				IDBranch: data.IDBranch,
				IsCalcShippedOnly: data.isCalcShippedOnly,
				IDSeller: data.IDSeller, // nhà cung cấp
				IDOwner: data.IDOwner, //nhân viên mua hàng
			};
			if (data._cmd == 'ExportPurchaseOutletReport') {
				this.ExportPurchaseOutletReport();
			} else if (data._cmd == 'runReport') {
				this.readPurchaseVendor();
			}
		});
	}

	ngOnDestroy() {
		this.pageConfig?.subscribeReport?.unsubscribe();
		super.ngOnDestroy();
	}

	loadData(event) {
		super.loadedData(event);
	}

	ionViewDidEnter() {
		this.buildCharts();
	}

	refresh() {
		this.buildCharts();
	}

	buildCharts() {
		this.chartNameBuild();
	}

	chartNameBuild() {}

	warehouses = [];

	readPurchaseVendor() {
		if (this.submitAttempt) {
			return;
		}

		this.submitAttempt = true;
		let apiPath = {
			method: 'GET',
			url: function () {
				return ApiSetting.apiDomain('PURCHASE/Order/PurchaseVendorReport/');
			},
		};

		this.loadingController
			.create({
				cssClass: 'my-custom-class',
				message: 'Please wait for a few moments',
			})
			.then((loading) => {
				loading.present();

				this.pageProvider
					.connect(apiPath.method, apiPath.url(), this.reportQuery)
					.toPromise()
					.then((resp: any) => {
						this.submitAttempt = false;
						if (loading) loading.dismiss();
						this.buildBranchesReport(resp);
						this.buildSheets(resp);
						super.loadedData();
					})
					.catch((err) => {
						if (err.message != null) {
							this.env.showMessage(err.message, 'danger');
						} else {
							this.env.showMessage('Cannot extract data', 'danger');
						}
						this.submitAttempt = false;
						if (loading) loading.dismiss();
						this.refresh();
					});
			});
	}

	buildBranchesReport(resp) {
		this.warehouses = [];
		for (let i = 0; i < resp.length; i++) {
			const r = resp[i];

			let warehouse = this.warehouses.find((d) => d.Id == r.IDBranch);
			if (!warehouse) {
				warehouse = {
					Id: r.IDBranch,
					Name: r.BranchName,
					count: 1,
					buyers: [],
					itemList: [],
					TotalBeforeDiscount: 0,
					TotalDiscount: 0,
					TotalAfterDiscount: 0,
				};
				this.warehouses.push(warehouse);
			}

			let saleitem = warehouse.itemList.find((d) => d.IDVendor == r.IDVendor);
			if (!saleitem) {
				saleitem = {
					IDContact: r.IDVendor,
					VendorCode: r.VendorCode,
					VendorName: r.VendorName,
					VendorWorkPhone: r.VendorWorkPhone,
					TotalBeforeDiscount: 0.0,
					TotalDiscount: 0.0,
					TotalAfterDiscount: 0.0,
				};
				warehouse.itemList.push(saleitem);
			}

			saleitem.TotalBeforeDiscount += r.TotalBeforeDiscount;
			saleitem.TotalDiscount += r.TotalDiscount;
			saleitem.TotalAfterDiscount += r.TotalAfterDiscount;

			saleitem.TotalBeforeDiscountText = lib.currencyFormat(saleitem.TotalBeforeDiscount);
			saleitem.TotalDiscountText = lib.currencyFormat(saleitem.TotalDiscount);
			saleitem.TotalAfterDiscountText = lib.currencyFormat(saleitem.TotalAfterDiscount);

			warehouse.TotalBeforeDiscount += r.TotalBeforeDiscount;
			warehouse.TotalDiscount += r.TotalDiscount;
			warehouse.TotalAfterDiscount += r.TotalAfterDiscount;
		}
		this.warehouses.forEach((w) => {
			w.TotalBeforeDiscountText = lib.currencyFormat(w.TotalBeforeDiscount);
			w.TotalDiscountText = lib.currencyFormat(w.TotalDiscount);
			w.TotalAfterDiscountText = lib.currencyFormat(w.TotalAfterDiscount);
			w.itemList.sort((a, b) => parseFloat(b.TotalAfterDiscount) - parseFloat(a.TotalAfterDiscount));
		});
	}

	buildSheets(resp) {
		this.items = [];
		for (let i = 0; i < resp.length; i++) {
			const r = resp[i];

			let warehouse: any = this.items.find((d) => d.Id == r.IDBranch);
			if (!warehouse) {
				warehouse = {
					Id: r.IDBranch,
					Name: r.BranchName,
					vendors: [],
				};
				this.items.push(warehouse);
			}

			let vendor = warehouse.vendors.find((d) => d.IDVendor == r.IDVendor);
			if (!vendor) {
				vendor = {
					IDVendor: r.IDVendor,
					VendorName: r.VendorName,
					itemList: [],
					TotalBeforeDiscount: 0,
					TotalDiscount: 0,
					TotalAfterDiscount: 0,
				};
				warehouse.vendors.push(vendor);
			}

			let saleitem = vendor.itemList.find((d) => d.IDVendor == r.IDVendor);
			if (!saleitem) {
				saleitem = {
					IDVendor: r.IDVendor,
					VendorCode: r.VendorCode,
					VendorName: r.VendorName,
					VendorWorkPhone: r.VendorWorkPhone,
					TotalBeforeDiscount: 0.0,
					TotalDiscount: 0.0,
					TotalAfterDiscount: 0.0,
				};
				vendor.itemList.push(saleitem);
			}

			saleitem.TotalBeforeDiscount += r.TotalBeforeDiscount;
			saleitem.TotalDiscount += r.TotalDiscount;
			saleitem.TotalAfterDiscount += r.TotalAfterDiscount;

			saleitem.TotalBeforeDiscountText = lib.currencyFormat(saleitem.TotalBeforeDiscount);
			saleitem.TotalDiscountText = lib.currencyFormat(saleitem.TotalDiscount);
			saleitem.TotalAfterDiscountText = lib.currencyFormat(saleitem.TotalAfterDiscount);

			vendor.TotalBeforeDiscount += r.TotalBeforeDiscount;
			vendor.TotalDiscount += r.TotalDiscount;
			vendor.TotalAfterDiscount += r.TotalAfterDiscount;
		}

		this.items.forEach((s) => {
			s.vendors.forEach((i) => {
				i.TotalBeforeDiscountText = lib.currencyFormat(i.TotalBeforeDiscount);
				i.TotalDiscountText = lib.currencyFormat(i.TotalDiscount);
				i.TotalAfterDiscountText = lib.currencyFormat(i.TotalAfterDiscount);
			});
		});
	}

	ExportPurchaseOutletReport() {
		let apiPath = {
			getExport: {
				method: 'GET',
				url: function () {
					return ApiSetting.apiDomain('PURCHASE/Order/ExportPurchaseOutletReport/');
				},
			},
		};

		this.loadingController
			.create({
				cssClass: 'my-custom-class',
				message: 'Please wait for a few moments',
			})
			.then((loading) => {
				loading.present();
				this.pageProvider
					.export(apiPath, this.reportQuery)
					.then((response: any) => {
						this.submitAttempt = false;
						if (loading) loading.dismiss();
						this.downloadURLContent(response);
					})
					.catch((err) => {
						if (err.message != null) {
							this.env.showMessage(err.message, 'danger');
						} else {
							this.env.showMessage('Cannot extract data', 'danger');
						}
						this.submitAttempt = false;
						if (loading) loading.dismiss();
						this.refresh();
					});
			});
	}
}
