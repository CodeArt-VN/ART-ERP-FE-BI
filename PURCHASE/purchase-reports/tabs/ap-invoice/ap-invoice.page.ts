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
  selector: 'app-ap-invoice',
  templateUrl: 'ap-invoice.page.html',
  styleUrls: ['ap-invoice.page.scss'],
})
export class ApInvoicePage extends PageBase {
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

      if (data._cmd == 'ExportPurchaseOutletReport') {
        this.exportApInvoiceReport();
      } else if (data._cmd == 'runReport') {
        this.readApInvoiceReport();
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

  readApInvoiceReport() {
    if (this.submitAttempt) {
      return;
    }

    this.submitAttempt = true;
    let apiPath = {
      method: 'GET',
      url: function () {
        return ApiSetting.apiDomain('PURCHASE/Order/APInvoiceReport/');
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
            // this.buildSheets(resp);
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
          BranchLogoURL : r.BranchLogoURL,
          count: 1,
          salemans: [],
          itemList: [],
          TotalBeforeDiscount: 0,
          TotalDiscount: 0,
          TotalAfterDiscount: 0,
          Tax: 0,
        };
        this.warehouses.push(warehouse);
      }

      let saleitem = warehouse.itemList.find((d) => d.IDBranch == r.IDBranch && d.InvoiceNo == r.InvoiceNo);
      if (!saleitem) {
        saleitem = {
          IDBranch : r.IDBranch,
          IDContact: r.IDSeller,
          // SellerTaxCode: r.SellerTaxCode,
          SellerName: r.SellerName,
          InvoiceNo: r.InvoiceNo,
          InvoiceDateText: lib.dateFormat(r.InvoiceDate, 'dd/mm/yyyy'),
          TotalDiscount:lib.currencyFormat(r.TotalDiscount),
          TotalBeforeDiscount: lib.currencyFormat(r.TotalBeforeDiscount),
          Tax: lib.currencyFormat(r.Tax),
          Remark: r.Remark,
        };
        warehouse.itemList.push(saleitem);
      }

      warehouse.TotalBeforeDiscount += r.TotalBeforeDiscount;
      warehouse.TotalDiscount += r.TotalDiscount;
      warehouse.Tax += r.Tax;
      // warehouse.TotalAfterDiscount += r.TotalAfterDiscount;
    }
    this.warehouses.forEach(w=>{
      w.TotalBeforeDiscount = lib.currencyFormat(w.TotalBeforeDiscount);
      w.TotalDiscount =lib.currencyFormat(w.TotalDiscount);
      w.Tax = lib.currencyFormat(w.Tax);
      // w.TotalAfterDiscount = lib.currencyFormatlib(w.TotalAfterDiscount);
    })
    // this.warehouses.forEach((w) => {
    //   w.TotalBeforeDiscountText = lib.currencyFormat(w.TotalBeforeDiscount);
    //   w.TotalDiscountText = lib.currencyFormat(w.TotalDiscount);
    //   w.TotalAfterDiscountText = lib.currencyFormat(w.TotalAfterDiscount);
    //   w.TaxText = lib.currencyFormat(w.Tax);
    //   w.itemList.sort((a, b) => parseFloat(b.TotalAfterDiscount) - parseFloat(a.TotalAfterDiscount));
    // });
  }

  // buildSheets(resp) {
  //   this.items = [];
  //   for (let i = 0; i < resp.length; i++) {
  //     const r = resp[i];

  //     let warehouse = this.items.find((d) => d.Id == r.IDBranch);
  //     if (!warehouse) {
  //       warehouse = {
  //         Id: r.IDBranch,
  //         Name: r.BranchName,
  //         salemans: [],
  //       };
  //       this.items.push(warehouse);
  //     }

  //     let saleman = warehouse.salemans.find((d) => d.IDBuyer == r.IDBuyer);
  //     if (!saleman) {
  //       saleman = {
  //         IDSaleman: r.IDBuyer,
  //         FullName: r.FullName,
  //         itemList: [],
  //         TotalBeforeDiscount: 0,
  //         TotalDiscount: 0,
  //         TotalAfterDiscount: 0,
  //         Tax: 0,
  //       };
  //       warehouse.salemans.push(saleman);
  //     }

  //     let saleitem = saleman.itemList.find((d) => d.IDSeller == r.IDSeller);
  //     if (!saleitem) {
  //       saleitem = {
  //         IDContact: r.IDSeller,
  //         SellerTaxCode: r.SellerTaxCode,
  //         ContactName: r.SellerName,
  //         WorkPhone: r.WorkPhone,
  //         TotalBeforeDiscount: 0.0,
  //         TotalDiscount: 0.0,
  //         TotalAfterDiscount: 0.0,
  //         Tax: 0.0,
  //       };
  //       saleman.itemList.push(saleitem);
  //     }

  //     saleitem.TotalBeforeDiscount += r.TotalBeforeDiscount;
  //     saleitem.TotalDiscount += r.TotalDiscount;
  //     saleitem.TotalAfterDiscount += r.TotalAfterDiscount;
  //     saleitem.Tax += r.Tax;

  //     saleitem.TotalBeforeDiscountText = lib.currencyFormat(saleitem.TotalBeforeDiscount);
  //     saleitem.TotalDiscountText = lib.currencyFormat(saleitem.TotalDiscount);
  //     saleitem.TotalAfterDiscountText = lib.currencyFormat(saleitem.TotalAfterDiscount);
  //     saleitem.TaxText = lib.currencyFormat(saleitem.Tax);

  //     saleman.TotalBeforeDiscount += r.TotalBeforeDiscount;
  //     saleman.TotalDiscount += r.TotalDiscount;
  //     saleman.TotalAfterDiscount += r.TotalAfterDiscount;
  //     saleman.Tax += r.Tax;
  //   }

  //   this.items.forEach((s) => {
  //     s.salemans.forEach((i) => {
  //       i.TotalBeforeDiscountText = lib.currencyFormat(i.TotalBeforeDiscount);
  //       i.TotalDiscountText = lib.currencyFormat(i.TotalDiscount);
  //       i.TotalAfterDiscountText = lib.currencyFormat(i.TotalAfterDiscount);
  //       i.TaxText = lib.currencyFormat(i.Tax);
  //     });
  //   });
  // }

  exportApInvoiceReport() {
    let apiPath = {
      getExport: {
        method: 'GET',
        url: function () {
          return ApiSetting.apiDomain('PURCHASE/Order/ExportAPInvoiceReport/');
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
