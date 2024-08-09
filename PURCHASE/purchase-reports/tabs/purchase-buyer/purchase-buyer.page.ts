import { Component } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, NavController, Platform } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { ReportService } from 'src/app/services/report.service';
import { lib } from 'src/app/services/static/global-functions';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
  selector: 'app-purchase-buyer',
  templateUrl: 'purchase-buyer.page.html',
  styleUrls: ['purchase-buyer.page.scss'],
})
export class PurchaseBuyerPage extends PageBase {
  today = '';
  reportQuery: any = {};

  constructor(
    public pageProvider: CommonService,
    public actionSheetController: ActionSheetController,
    public alertCtrl: AlertController,
    public loadingController: LoadingController,
    public env: EnvService,
    public navCtrl: NavController,
    public rpt: ReportService,
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
        this.readPurchaseBuyerReport();
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

  readPurchaseBuyerReport() {
    if (this.submitAttempt) {
      return;
    }

    this.submitAttempt = true;
    let apiPath = {
      method: 'GET',
      url: function () {
        return ApiSetting.apiDomain('PURCHASE/Order/PurchaseBuyerReport/');
      },
    };

    this.loadingController
      .create({
        cssClass: 'my-custom-class',
        message: 'Đang tạo bảng kê, xin vui lòng chờ giây lát...',
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
            super.loadedData();
          })
          .catch((err) => {
            if (err.message != null) {
              this.env.showTranslateMessage(err.message, 'danger');
            } else {
              this.env.showTranslateMessage('Cannot extract data', 'danger');
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
          itemList: [],
          TotalBeforeDiscount: 0,
          TotalDiscount: 0,
          TotalAfterDiscount: 0,
        };
        this.warehouses.push(warehouse);
      }

      let saleitem = warehouse.itemList.find((d) => d.IDOwner == r.IDOwner);
      if (!saleitem) {
        saleitem = {
          IDOwner: r.IDOwner,
          OwnerName: r.OwnerName,
          OwnerWorkPhone: r.OwnerWorkPhone,
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
        message: 'Đang tạo bảng kê, xin vui lòng chờ giây lát...',
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
              this.env.showTranslateMessage(err.message, 'danger');
            } else {
              this.env.showTranslateMessage('Cannot extract data', 'danger');
            }
            this.submitAttempt = false;
            if (loading) loading.dismiss();
            this.refresh();
          });
      });
  }
}
