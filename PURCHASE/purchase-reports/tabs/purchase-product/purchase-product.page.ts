import { Component, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, NavController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { ReportService } from 'src/app/services/report.service';
import { lib } from 'src/app/services/static/global-functions';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
	selector: 'app-purchase-product',
	templateUrl: 'purchase-product.page.html',
	styleUrls: ['purchase-product.page.scss'],
	standalone: false,
})
export class PurchaseProductPage extends PageBase {
	today = '';
	charts;
	reportQuery: any = {};
	@ViewChild('chartName') chartName;

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
		this.charts = {
			chartName: { IsLoading: true, IsNoData: false, Chart: null },
		};

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
				this.readPurchaseProductReport();
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
		for (var key in this.charts) {
			let c = this.charts[key].Chart;
			c?.destroy();
		}
		this.buildCharts();
	}

	buildCharts() {
		this.chartNameBuild();
	}

	chartNameBuild() {}

	warehouses = [];

	readPurchaseProductReport() {
		if (this.submitAttempt) {
			return;
		}

		this.submitAttempt = true;
		this.loadingController
			.create({
				cssClass: 'my-custom-class',
				message: 'Please wait for a few moments',
			})
			.then((loading) => {
				loading.present();

				this.pageProvider
					.connect('GET', ApiSetting.apiDomain('PURCHASE/Order/PurchaseProductReport/'), this.reportQuery)
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

			let saleitem = warehouse.itemList.find((d) => d.IDItem == r.IDItem);
			if (!saleitem) {
				saleitem = {
					IDItem: r.IDItem,
					ItemCode: r.ItemCode,
					ItemName: r.ItemName,
					UoMs: [],
				};
				warehouse.itemList.push(saleitem);
			}

			let itemUoM = saleitem.UoMs.find((d) => d.Id == r.IDUoM);
			if (!itemUoM) {
				itemUoM = {
					Id: r.IDUoM,
					Name: r.UoM,
					UoMQuantityExpected: r.UoMQuantityExpected, // r.ShippedQuantity,
					TotalBeforeDiscount: r.TotalBeforeDiscount,
					TotalDiscount: r.TotalDiscount,
					TotalAfterDiscount: r.TotalAfterDiscount,

					TotalBeforeDiscountText: lib.currencyFormat(r.TotalBeforeDiscount),
					TotalDiscountText: lib.currencyFormat(r.TotalDiscount),
					TotalAfterDiscountText: lib.currencyFormat(r.TotalAfterDiscount),
				};
				saleitem.UoMs.push(itemUoM);
			}

			warehouse.TotalBeforeDiscount += r.TotalBeforeDiscount;
			warehouse.TotalDiscount += r.TotalDiscount;
			warehouse.TotalAfterDiscount += r.TotalAfterDiscount;
		}
		this.warehouses.forEach((i) => {
			i.TotalBeforeDiscountText = lib.currencyFormat(i.TotalBeforeDiscount);
			i.TotalDiscountText = lib.currencyFormat(i.TotalDiscount);
			i.TotalAfterDiscountText = lib.currencyFormat(i.TotalAfterDiscount);
		});
	}

	buildSheets(resp) {
		this.items = [];
		for (let i = 0; i < resp.length; i++) {
			const r = resp[i];

			let warehouse = this.items.find((d) => d.Id == r.IDBranch);
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

			let saleitem = vendor.itemList.find((d) => d.IDItem == r.IDItem);
			if (!saleitem) {
				saleitem = {
					IDItem: r.IDItem,
					ItemCode: r.ItemCode,
					ItemName: r.ItemName,
					UoMs: [],
				};
				vendor.itemList.push(saleitem);
			}

			let itemUoM = saleitem.UoMs.find((d) => d.Id == r.IDUoM);
			if (!itemUoM) {
				itemUoM = {
					Id: r.IDUoM,
					Name: r.UoM,
					UoMQuantityExpected: r.UoMQuantityExpected, //r.ShippedQuantity,
					TotalBeforeDiscount: r.TotalBeforeDiscount,
					TotalDiscount: r.TotalDiscount,
					TotalAfterDiscount: r.TotalAfterDiscount,

					TotalBeforeDiscountText: lib.currencyFormat(r.TotalBeforeDiscount),
					TotalDiscountText: lib.currencyFormat(r.TotalDiscount),
					TotalAfterDiscountText: lib.currencyFormat(r.TotalAfterDiscount),
				};
				saleitem.UoMs.push(itemUoM);
			}

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

		this.pageProvider
			.export(apiPath, this.reportQuery)
			.then((response: any) => {
				this.downloadURLContent(response);
			})
			.catch((err) => {
				console.log(err);
			});
	}
}
