import { Component, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, PopoverController, NavController, Platform } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { ReportService } from 'src/app/services/report.service';
import { lib } from 'src/app/services/static/global-functions';
import Chart from 'chart.js';
import 'chartjs-plugin-labels';
import { CustomService } from 'src/app/services/custom.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
    selector: 'app-revenue',
    templateUrl: 'revenue.page.html',
    styleUrls: ['revenue.page.scss']
})
export class RevenuePage extends PageBase {
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
        public rpt: ReportService,
    ) {
        super();
        this.today = lib.dateFormat(new Date, 'hh:MM dd/mm/yyyy');
        this.charts = {
            chartName: { IsLoading: true, IsNoData: false, Chart: null },
        };

        this.pageConfig.subscribeReport = this.rpt.Tracking().subscribe((data) => {
            console.log('subscribeReport');
            this.reportQuery = {
                InvoiceDateFrom: data.fromDate,
                InvoiceDateTo: data.toDate,
                frequency: data.frequency,
                IDBranch: data.IDBranch,
                SelectedBranch: this.env.selectedBranch,
            };

            if (data._cmd == 'exportInvoiceReport') {
                this.exportInvoiceReport();
            }
            else if (data._cmd == 'runReport') {
                this.readInvoiceReport();
            };
        })
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

    chartNameBuild() {

    }

    branches = [];

    readInvoiceReport() {
        if (this.submitAttempt) {
            return;
        }

        this.submitAttempt = true;
        let apiPath = {
            method: "GET",
            url: function () { return ApiSetting.apiDomain("AC/ARInvoice/ARInvoiceReport") }
        };

        this.loadingController.create({
            cssClass: 'my-custom-class',
            message: 'Đang tạo bảng kê, xin vui lòng chờ giây lát...'
        }).then(loading => {
            loading.present();

            this.pageProvider.connect(apiPath.method, apiPath.url(), this.reportQuery).toPromise()
                .then((resp: any) => {
                    this.submitAttempt = false;
                    if (loading) loading.dismiss();
                    this.buildBranchesReport(resp);
                    super.loadedData();

                }).catch(err => {
                    if (err.message != null) {
                        this.env.showMessage(err.message, 'danger');
                    }
                    else {
                        this.env.showTranslateMessage('erp.app.pages.bi.sales-report.message.can-not-get-data','danger');
                    }
                    this.submitAttempt = false;
                    if (loading) loading.dismiss();
                    this.refresh();
                })
        });
    }

    buildBranchesReport(resp) {
        this.branches = [];
        for (let i = 0; i < resp.length; i++) {
            const r = resp[i];

            let branch = this.branches.find(d => d.Id == r.IDBranch);
            if (!branch) {
                branch = {
                    Id: r.IDBranch,
                    Name: this.env.branchList.find(b => b.Id == r.IDBranch).Name,
                    count: 1,
                    itemList: [],
                    TotalAfterDiscount: 0,
                    Tax: 0,
                    TotalAfterTax: 0,
                };
                this.branches.push(branch);
            }

            let invoice:any = {
                IDAR: r.Id,
                IDSO: r.IdSaleOrder,
                InvoiceNo : r.InvoiceNo,
                InvoiceDate : r.InvoiceDate,
                IDCustomer: r.IDBusinessPartner,
                CustomerName: r.CustomerName,
                TotalAfterDiscount: r.TotalAfterDiscount,
                Tax: r.Tax,
                TotalAfterTax: r.TotalAfterTax,
                Remark: r.Remark
            }
            branch.itemList.push(invoice);
            invoice.TotalAfterDiscountText = lib.formatMoney(invoice.TotalAfterDiscount, 0, ',', '.');
            invoice.TaxText = lib.formatMoney(invoice.Tax, 0, ',', '.');
            invoice.TotalAfterTaxText = lib.formatMoney(invoice.TotalAfterTax, 0, ',', '.');

            branch.TotalAfterDiscount += r.TotalAfterDiscount;
            branch.Tax += r.Tax;
            branch.TotalAfterTax += r.TotalAfterTax;
        }
        
        this.branches.forEach(b => {
            b.TotalAfterDiscountText = lib.formatMoney(b.TotalAfterDiscount, 0, ',', '.');
            b.TaxText = lib.formatMoney(b.Tax, 0, ',', '.');
            b.TotalAfterTaxText = lib.formatMoney(b.TotalAfterTax, 0, ',', '.');

            b.itemList.sort((a, b) => new Date(b.InvoiceDate).getTime() - new Date(a.InvoiceDate).getTime());
        });
    }

    exportInvoiceReport() {
        let apiPath = {
            getExport: {
                method: "GET",
                url: function () { return ApiSetting.apiDomain("AC/ARInvoice/Export") }
            }
        };

        this.loadingController.create({
            cssClass: 'my-custom-class',
            message: 'Đang tạo bảng kê, xin vui lòng chờ giây lát...'
        }).then(loading => {
            loading.present();
            this.pageProvider.export(apiPath, this.reportQuery).then((response: any) => {
                this.submitAttempt = false;
                if (loading) loading.dismiss();
                this.downloadURLContent(ApiSetting.mainService.base + response);
            }).catch(err => {
				if (err.message != null) {
					this.env.showMessage(err.message, 'danger');
				}
				else {
					this.env.showTranslateMessage('erp.app.pages.bi.sales-report.message.can-not-get-data','danger');
				}
                this.submitAttempt = false;
                if (loading) loading.dismiss();
                this.refresh();
            });

        });

    }
}
