import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { CommonService } from 'src/app/services/core/common.service';
import { ReportService } from 'src/app/services/report.service';
import { lib } from 'src/app/services/static/global-functions';


@Component({
    selector: 'app-pos-receipt-report',
    templateUrl: 'pos-receipt-report.page.html',
    styleUrls: ['pos-receipt-report.page.scss']
})
export class POSReceiptReportPage extends PageBase {
    hostImage = environment.appDomain;
    reportQuery;
    reportPaymentQuery;
    ChartData;

    labelLineChart;
    typeLineChart;

    paymentItems;

    PaymentData = [];
    PaymentChartData = [];

    PaymentAmountData = [];
    PaymentAmountChartData = [];

    RevenueData = [];
    RevenueChartData = [];
    ReceiptsData = [];
    ReceiptsChartData = [];

    reportBranchList = [];

    paymentList = [];

    ChartStyle2 = {
        width: '100%',
        'min-height': '300px',
    }
    ChartPayment = [];
    ChartPaymentAmount = [];
    Chart1 = {
        Id: 'Payment',
        Title: 'Payment',
        Subtext: '',
        SeriesName: 'Quantity',

        Legend: false,
        // Data:  this.topSellingProduct,
        Type: 'Pie',
        Style: this.ChartStyle2
    }
    Chart2 = {
        Id: 'PaymentAmount',
        Title: 'Payment Amount',
        Subtext: '',
        SeriesName: 'Amount',

        Legend: false,
        // Data:  this.topSellingProduct,
        Type: 'Pie',
        Style: this.ChartStyle2
    }

    constructor(
        public modalController: ModalController,
        public popoverCtrl: PopoverController,
        public alertCtrl: AlertController,
        public loadingController: LoadingController,
        public env: EnvService,
        public navCtrl: NavController,
        public location: Location,
        public commonService :CommonService,
        public rpt: ReportService,
    ) {
        super();
        this.reportBranchList = this.env.branchList.filter(b => b.Type == 'Company');
    }
    changeDateFilter(type) {
        this.rpt.dateQuery(type).then(_ => {
            this.preLoadData(null);
        }).catch(err => { let a = err });
        console.log(this.rpt.rptGlobal.query);
    }

    changeFrequency(f) {
        this.rpt.rptGlobal.query.frequency = f.Id;
        this.changeDateFilter('setdone');
    }

    toogleBranchDataset(b) {
        let currentBranch = this.reportBranchList.find(rp => rp.Id == b.Id);
        this.reportBranchList.forEach(rp => {
            if (rp.Id != b.Id) {
                rp.IsHidden = true;
            }
            else {
                rp.IsHidden = false;
            }
        });

        if(!currentBranch.IsHidden) {
            this.env.selectedBranchAndChildren = currentBranch.Query;
        }
        else {
            this.env.selectedBranchAndChildren = "0";
        }
        this.loadData(null);
    }

    preLoadData(event?: any): void {
        Promise.all([
            this.env.getType('PaymentType')
        ]).then((results:any) => {
            this.paymentList = results[0];

            this.buildPieChartsData();
            super.preLoadData(event);
        });
    }
    
    loadData(event): void {
        this.RevenueChartData = [];
        this.ReceiptsChartData = [];
        this.PaymentChartData = [];
        this.PaymentAmountChartData = [];
        super.loadData(event);
    }

    loadedData(event?: any): void {

        this.reportQuery = {
            fromDate: this.rpt.rptGlobal.query.fromDate,
            toDate: this.rpt.rptGlobal.query.toDate + ' 23:59:59',
            IDBranch: this.env.selectedBranchAndChildren,
            SortBy: ['Id_desc'],
            Skip: 0
        };


        let apiPath = {
            method: "GET",
            url: function () { return ApiSetting.apiDomain("POS/Report/ReceiptList") }
        };

        this.reportQuery.Skip = this.items.length;

        Promise.all([
            this.commonService.connect(apiPath.method, apiPath.url(), this.reportQuery).toPromise()
        ]).then((values:any) => {
            let Data = values[0];

            if (Data.length == 0) {
                this.pageConfig.isEndOfData = true;
            }

            if (Data.length > 0) {
                let firstRow = Data[0];

                //Fix dupplicate rows
                if (this.items.findIndex(d => d.ReceiptID == firstRow.ReceiptID) == -1) {
                    this.items = [...this.items, ...Data];
                }

                this.items.forEach(i => {
                    i.CreatedOnText = lib.dateFormat((i.Date || i.CreatedOn), 'yyyy/mm/dd');
                    i.PaymentName = (this.paymentList.find(p => p.Code == i.PaymentType)?.Name || 'Còn nợ');
                    i.PaymentsText = lib.currencyFormat(i.Payments);
                    i.TotalPriceText = lib.currencyFormat(i.TotalPrice);
                });
            }

            super.loadedData(event); 
        });
    }

    buildPieChartsData(event?: any): void {

        let groupby
        // this.segmentView = report;
        if (this.rpt.rptGlobal.query.frequency == 0) {
            groupby = "Hour"
        } 
        if (this.rpt.rptGlobal.query.frequency == 1) {
            groupby = "Day"
        } 
        else if (this.rpt.rptGlobal.query.frequency == 2) {
            groupby = "Month"
        }
        else if (this.rpt.rptGlobal.query.frequency == 3) {
            groupby = "Quarter"
        }
        else if (this.rpt.rptGlobal.query.frequency == 4) {
            groupby = "Year"
        }
        this.reportQuery = {
            fromDate: this.rpt.rptGlobal.query.fromDate,
            toDate: this.rpt.rptGlobal.query.toDate,
            IDBranch: this.env.selectedBranchAndChildren,
            GroupBy: groupby,   // Hour / Day / Week / Month / Year
            isCalcReceiptPayment: true,
        };

        let apiPath = {
            method: "GET",
            url: function () { return ApiSetting.apiDomain("POS/Report/Day") }
        };

        Promise.all([
            this.commonService.connect(apiPath.method, apiPath.url(), this.reportQuery).toPromise(),
        ]).then(values => {

            // this.items = values[0]['Data'];
            this.RevenueData = values[0]['Revenue'];
            this.ReceiptsData = values[0]['Receipts'];
            this.PaymentData = values[0]['PaymentMethods'];
            this.PaymentAmountData = values[0]['PaymentAmounts'];

            this.RevenueData.forEach(i => {
                i.Revenue = Math.round(i.Revenue);
                i.Day = new Date(i.Date).getDate();
                i.Month = new Date(i.Date).getMonth() + 1;
                // i.Quarter = new Date(i.Date).getMonth() + 1;
                i.Year = new Date(i.Date).getFullYear();
            });

            this.ReceiptsData.forEach(i => {
                i.Day = new Date(i.Date).getDate();
                i.Month = new Date(i.Date).getMonth() + 1;
                // i.Quarter = new Date(i.Date).getMonth() + 1;
                i.Year = new Date(i.Date).getFullYear();
            });

            this.PaymentData.forEach(i => {
                i.PaymentName = (this.paymentList.find(p => p.Code == i.PaymentType)?.Name || 'Còn nợ');
            });

            this.PaymentAmountData.forEach(i => {
                i.PaymentName = (this.paymentList.find(p => p.Code == i.PaymentType)?.Name || 'Còn nợ');
            });

            this.buildRevenueData();
            this.buildReceiptsData();
            this.buildPaymentData();
            this.buildPaymentAmountData();
            
            this.labelLineChart = this.rpt.timeGroups.map(m => m.Label);
            this.typeLineChart = "BasicLine";
            
            super.loadedData(event);
        });
    }

    buildRevenueData() {
        var dataLineChart = []
        this.rpt.timeGroups.forEach(e => {
            if (this.rpt.rptGlobal.query.frequency == 0){
                let Data = this.RevenueData.filter(f => f.GroupBy == e.Hour)[0]?.Revenue;
                dataLineChart.push(Data);
            }
            else if (this.rpt.rptGlobal.query.frequency == 1) {
                let Data = this.RevenueData.filter(f => f.GroupBy == e.Day && f.Month == e.Month && f.Year == e.Year)[0]?.Revenue;
                dataLineChart.push(Data);
            }
            else if (this.rpt.rptGlobal.query.frequency == 2) {
                let Data = this.RevenueData.filter(f => f.GroupBy == e.Month && f.Year == e.Year)[0]?.Revenue;
                dataLineChart.push(Data);
            }
            else if (this.rpt.rptGlobal.query.frequency == 3) {
                let Data = this.RevenueData.filter(f => f.GroupBy == e.Quarter && f.Year == e.Year)[0]?.Revenue;
                dataLineChart.push(Data);
            }
            else if (this.rpt.rptGlobal.query.frequency == 4) {
                let Data = this.RevenueData.filter(f => f.GroupBy == e.Year)[0]?.Revenue;
                dataLineChart.push(Data);
            }
        });
        this.labelLineChart = this.rpt.timeGroups.map(m => m.Label),
        this.RevenueChartData = [
            {
                name: 'Revenue',
                data: dataLineChart,
            }
        ];
    }

    buildReceiptsData() {
        var dataLineChart = []
        this.rpt.timeGroups.forEach(e => {
            if (this.rpt.rptGlobal.query.frequency == 0){
                let Data = this.ReceiptsData.filter(f => f.GroupBy == e.Hour)[0]?.Receipts;
                dataLineChart.push(Data);
            }
            else if (this.rpt.rptGlobal.query.frequency == 1) {
                let Data = this.ReceiptsData.filter(f => f.GroupBy == e.Day && f.Month == e.Month && f.Year == e.Year)[0]?.Receipts;
                dataLineChart.push(Data);
            }
            else if (this.rpt.rptGlobal.query.frequency == 2) {
                let Data = this.ReceiptsData.filter(f => f.GroupBy == e.Month && f.Year == e.Year)[0]?.Receipts;
                dataLineChart.push(Data);
            }
            else if (this.rpt.rptGlobal.query.frequency == 3 ) {
                let Data = this.ReceiptsData.filter(f => f.GroupBy == e.Quarter && f.Year == e.Year)[0]?.Receipts;
                dataLineChart.push(Data);
            }
            else if (this.rpt.rptGlobal.query.frequency == 4) {
                let Data = this.ReceiptsData.filter(f => f.GroupBy == e.Year)[0]?.Receipts;
                dataLineChart.push(Data);
            }
        });
        this.labelLineChart = this.rpt.timeGroups.map(m => m.Label),
        this.ReceiptsChartData = [
            {
                name: 'Receipts',
                data: dataLineChart,
            }
        ];
    }

    buildPaymentData() {
        if (this.PaymentData) {
            this.PaymentChartData = this.PaymentData.map(i => ({ value: i.TotalQuantity, name: i.PaymentName }));
        }
    }

    buildPaymentAmountData() {
        if (this.PaymentAmountData) {
            this.PaymentAmountChartData = this.PaymentAmountData.map(i => ({ value: i.TotalReceive, name: i.PaymentName }));
        }
    }

}
