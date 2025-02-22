import { Component, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, PopoverController, NavController, Platform } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { ReportService } from 'src/app/services/report.service';
import { lib } from 'src/app/services/static/global-functions';
import { CustomService } from 'src/app/services/custom.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
	selector: 'app-sale-product',
	templateUrl: 'sale-product.page.html',
	styleUrls: ['sale-product.page.scss'],
	standalone: false,
})
export class SaleProductPage extends PageBase {
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
		private platform: Platform,
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
				IDOwner: data.saleman?.Id,
				IDContact: data.outlet?.Id,
				IsCalcShippedOnly: data.isCalcShippedOnly,
				saleman: data.saleman,
				outlet: data.outlet,
			};

			if (data._cmd == 'exportSaleProductReport') {
				this.exportSaleProductReport();
			} else if (data._cmd == 'runReport') {
				this.readSaleProductReport();
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

	readSaleProductReport() {
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
					.connect('GET', ApiSetting.apiDomain('SALE/Order/SaleProductReport/'), this.reportQuery)
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
					salemans: [],
					itemList: [],
					TotalBeforeDiscount: 0,
					TotalDiscount: 0,
					TotalAfterDiscount: 0,
				};
				this.warehouses.push(warehouse);
			}

			// let saleman = warehouse.itemList.find(d => d.IDSaleman == r.IDSaleman);
			// if(!saleman){
			//     saleman = {
			//         IDSaleman: r.IDSaleman,
			//         Name : r.FullName,
			//         itemList: [],
			//         TotalBeforeDiscount: 0,
			//         TotalDiscount: 0,
			//         TotalAfterDiscount: 0,
			//     }
			// }

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
					ShippedQuantity: r.ShippedQuantity,
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

			// let saleman = warehouse.salemans.find(d => d.Id == r.IDSaleman)
			// if(!saleman){
			//     saleman = {
			//         Id: r.IDSaleman,
			//         Name: r.FullName,
			//         itemList: []
			//     }
			//     warehouse.salemans.push(saleman);
			// }
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
					salemans: [],
				};
				this.items.push(warehouse);
			}

			let saleman = warehouse.salemans.find((d) => d.IDSaleman == r.IDSaleman);
			if (!saleman) {
				saleman = {
					IDSaleman: r.IDSaleman,
					FullName: r.FullName,
					itemList: [],
					TotalBeforeDiscount: 0,
					TotalDiscount: 0,
					TotalAfterDiscount: 0,
				};
				warehouse.salemans.push(saleman);
			}

			let saleitem = saleman.itemList.find((d) => d.IDItem == r.IDItem);
			if (!saleitem) {
				saleitem = {
					IDItem: r.IDItem,
					ItemCode: r.ItemCode,
					ItemName: r.ItemName,
					UoMs: [],
				};
				saleman.itemList.push(saleitem);
			}

			let itemUoM = saleitem.UoMs.find((d) => d.Id == r.IDUoM);
			if (!itemUoM) {
				itemUoM = {
					Id: r.IDUoM,
					Name: r.UoM,
					ShippedQuantity: r.ShippedQuantity,
					TotalBeforeDiscount: r.TotalBeforeDiscount,
					TotalDiscount: r.TotalDiscount,
					TotalAfterDiscount: r.TotalAfterDiscount,

					TotalBeforeDiscountText: lib.currencyFormat(r.TotalBeforeDiscount),
					TotalDiscountText: lib.currencyFormat(r.TotalDiscount),
					TotalAfterDiscountText: lib.currencyFormat(r.TotalAfterDiscount),
				};
				saleitem.UoMs.push(itemUoM);
			}

			saleman.TotalBeforeDiscount += r.TotalBeforeDiscount;
			saleman.TotalDiscount += r.TotalDiscount;
			saleman.TotalAfterDiscount += r.TotalAfterDiscount;
		}

		this.items.forEach((s) => {
			s.salemans.forEach((i) => {
				i.TotalBeforeDiscountText = lib.currencyFormat(i.TotalBeforeDiscount);
				i.TotalDiscountText = lib.currencyFormat(i.TotalDiscount);
				i.TotalAfterDiscountText = lib.currencyFormat(i.TotalAfterDiscount);
			});
		});
	}

	exportSaleProductReport() {
		let apiPath = {
			getExport: {
				method: 'GET',
				url: function () {
					return ApiSetting.apiDomain('SALE/Order/ExportSaleProductReport/');
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
