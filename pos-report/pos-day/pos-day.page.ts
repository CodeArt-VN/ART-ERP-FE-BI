import { Component, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { CustomService } from 'src/app/services/custom.service';
import { ReportService } from 'src/app/services/report.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { lib } from 'src/app/services/static/global-functions';

@Component({
    selector: 'app-pos-day',
    templateUrl: './pos-day.page.html',
    styleUrls: ['./pos-day.page.scss'],
})
export class PosDayPage extends PageBase {

    labelLineChart;
    typeLineChart;

    paymentItems;

    PaymentData = [];
    PaymentChartData = [];

    PaymentAmountData = [];
    PaymentAmountChartData = [];

    RevenueData = [];
    RevenueChartData;
    ReceiptsData = [];
    ReceiptsChartData;
    
    reportQuery: any = {};

    reportPaymentQuery;

    ChartType = 'Pie';

    ChartStyle = {
        width: 300,
        height: 300,
    }

    ChartStyle2 = {
        width: '100%',
        'min-height': '300px',
    }

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
        SeriesName: 'Total Revenue',

        Legend: false,
        // Data: this.ChartData,
        Type: 'Pie',
        Style: this.ChartStyle2
    }

    constructor(
        public pageProvider: CustomService,
        public branchProvider: BRA_BranchProvider,
        public env: EnvService,
        public navCtrl: NavController,
        public rpt: ReportService,

        public route: ActivatedRoute,
        public alertCtrl: AlertController,
        public formBuilder: FormBuilder,
        public cdr: ChangeDetectorRef,
        public loadingController: LoadingController,
        public commonService: CommonService,
    ) {
        super();
        this.pageConfig.isDetailPage = true;
    }

    segmentView = 's1';
    segmentChanged(ev: any) {
        this.segmentView = ev.detail.value;
    }

    async saveChange() {
        super.saveChange2();
    }

    loadedData(event?: any): void {

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
        else if (this.rpt.rptGlobal.query.frequency == 4) {
            groupby = "Year"
        }
        this.reportQuery = {
            fromDate: this.rpt.rptGlobal.query.fromDate,
            toDate: this.rpt.rptGlobal.query.toDate,
            IDBranch: this.env.selectedBranch,
            GroupBy: groupby   // Hour / Day / Week / Month / Year
        };

        this.reportPaymentQuery = {
            fromDate: this.rpt.rptGlobal.query.fromDate,
            toDate: this.rpt.rptGlobal.query.toDate,
            IDBranch: this.env.selectedBranch,
            GroupBy: 'Day',  // Hour / Day / Week / Month / Year
            isCalcReceiptPayment: true,
        };


        let apiPath = {
            method: "GET",
            url: function () { return ApiSetting.apiDomain("POS/Report/Day") }
        };

        let apiPath2 = {
            method: "GET",
            url: function () { return ApiSetting.apiDomain("POS/Report/Payment") }
        };

        Promise.all([
            this.commonService.connect(apiPath.method, apiPath.url(), this.reportQuery).toPromise(),
            this.commonService.connect(apiPath2.method, apiPath2.url(), this.reportPaymentQuery).toPromise(),
        ]).then(values => {

            this.items = values[0];

            this.paymentItems = values[1];

            this.items.sort((a,b) => b.OrderedAmount - a.OrderedAmount);
            this.items = [...this.items];

            this.items.forEach(i => {
                i.RevenueText = lib.currencyFormat(i.Revenue);
                i.TipsText = lib.currencyFormat(i.Tips);
                i.TaxText = lib.currencyFormat(i.Tax);
                i.DateText = lib.dateFormat((i.Date || i.StartsAt), 'yyyy/mm/dd');
                i.StartsAtText = lib.dateFormat(i.StartsAt, 'hh:MM');
                i.EndsAtText = lib.dateFormat(i.EndsAt, 'hh:MM');
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
        this.RevenueData = [];
        Object.assign(this.RevenueData, this.items);

        let dataLineChart = this.RevenueData.map(i => i.Revenue );
        this.RevenueChartData = [
            {
                name: 'Revenue',
                data: dataLineChart,
            }
        ]
    }

    buildReceiptsData() {
        this.ReceiptsData = [];
        Object.assign(this.ReceiptsData, this.items);

        if (this.ReceiptsData.length) {
            let dataLineChart = this.ReceiptsData.map(i => i.Receipts );
            this.ReceiptsChartData = [
                {
                    name: 'Receipts',
                    data: dataLineChart,
                }
            ]
        }
    }

    buildPaymentData() {
        this.PaymentData = [];
        Object.assign(this.PaymentData, this.paymentItems);

        if (this.PaymentData) {
            this.PaymentChartData = this.PaymentData.map(i => ({ value: i.TotalQuantity, name: i.IDType }));
        }
    }

    buildPaymentAmountData() {
        this.PaymentAmountData = [];
        Object.assign(this.PaymentAmountData, this.paymentItems);

        if (this.PaymentAmountData) {
            this.PaymentAmountChartData = this.PaymentAmountData.map(i => ({ value: i.TotalReceive, name: i.IDType }));
        }
    }

    changeDateFilter(type) {
        this.rpt.dateQuery(type).then(_ => {
            this.preLoadData(null);
        }).catch(err => { let a = err });
    }

    changeFrequency(f) {
        this.rpt.rptGlobal.query.frequency = f.Id;

        if (f.Id == 1) {
            this.changeDateFilter('dw');
        }
        else if (f.Id == 2) {
            this.changeDateFilter('m');
        }
    }

    toogleBranchDataset(b) {
        b.IsHidden = !b.IsHidden;
    }
}
