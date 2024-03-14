import { Component, ViewChild } from '@angular/core';
import {
  ActionSheetController,
  AlertController,
  LoadingController,
  PopoverController,
  NavController,
  Platform,
} from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { ReportService } from 'src/app/services/report.service';
import { lib } from 'src/app/services/static/global-functions';
import { CustomService } from 'src/app/services/custom.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
  selector: 'app-sale-outlet',
  templateUrl: 'sale-outlet.page.html',
  styleUrls: ['sale-outlet.page.scss'],
})
export class SaleOutletPage extends PageBase {
  today = '';
  reportQuery: any = {};

  constructor(
    public pageProvider: CommonService,
    public actionSheetController: ActionSheetController,
    public alertCtrl: AlertController,
    public loadingController: LoadingController,
    public env: EnvService,
    public navCtrl: NavController,
    private platform: Platform,
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
        IDOwner: data.saleman?.Id,
        IDContact: data.outlet?.Id,
        IsCalcShippedOnly: data.isCalcShippedOnly,
        saleman: data.saleman,
        outlet: data.outlet,
      };

      if (data._cmd == 'exportSaleProductReport') {
        this.exportSaleOutletReport();
      } else if (data._cmd == 'runReport') {
        this.readSaleOutletReport();
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

  readSaleOutletReport() {
    if (this.submitAttempt) {
      return;
    }

    this.submitAttempt = true;
    let apiPath = {
      method: 'GET',
      url: function () {
        return ApiSetting.apiDomain('SALE/Order/SaleOutletReport/');
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
            this.buildSheets(resp);
            super.loadedData();
          })
          .catch((err) => {
            if (err.message != null) {
              this.env.showMessage(err.message, 'danger');
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
          salemans: [],
          itemList: [],
          TotalBeforeDiscount: 0,
          TotalDiscount: 0,
          TotalAfterDiscount: 0,
        };
        this.warehouses.push(warehouse);
      }

      let saleitem = warehouse.itemList.find((d) => d.IDContact == r.IDContact);
      if (!saleitem) {
        saleitem = {
          IDContact: r.IDContact,
          ContactCode: r.ContactCode,
          ContactName: r.ContactName,
          WorkPhone: r.WorkPhone,
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

      let saleitem = saleman.itemList.find((d) => d.IDContact == r.IDContact);
      if (!saleitem) {
        saleitem = {
          IDContact: r.IDContact,
          ContactCode: r.ContactCode,
          ContactName: r.ContactName,
          WorkPhone: r.WorkPhone,
          TotalBeforeDiscount: 0.0,
          TotalDiscount: 0.0,
          TotalAfterDiscount: 0.0,
        };
        saleman.itemList.push(saleitem);
      }

      saleitem.TotalBeforeDiscount += r.TotalBeforeDiscount;
      saleitem.TotalDiscount += r.TotalDiscount;
      saleitem.TotalAfterDiscount += r.TotalAfterDiscount;

      saleitem.TotalBeforeDiscountText = lib.currencyFormat(saleitem.TotalBeforeDiscount);
      saleitem.TotalDiscountText = lib.currencyFormat(saleitem.TotalDiscount);
      saleitem.TotalAfterDiscountText = lib.currencyFormat(saleitem.TotalAfterDiscount);

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

  exportSaleOutletReport() {
    let apiPath = {
      getExport: {
        method: 'GET',
        url: function () {
          return ApiSetting.apiDomain('SALE/Order/ExportSaleOutletReport/');
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
              this.env.showMessage(err.message, 'danger');
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
