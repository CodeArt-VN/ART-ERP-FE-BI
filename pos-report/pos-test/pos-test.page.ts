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
    selector: 'app-pos-test',
    templateUrl: './pos-test.page.html',
    styleUrls: ['./pos-test.page.scss'],
})
export class PosTestPage extends PageBase {

    reportQuery: any = {};

    itemsData = [];

    topSellingProduct = [];
    topRevenueProducts = [];

	// ChartData = [
    //     { value: 335, name: 'Direct' },
    //     { value: 310, name: 'Email' },
    //     { value: 274, name: 'Union Ads' },
    //     { value: 235, name: 'Video Ads' },
    //     { value: 400, name: 'Search Engine' }
    // ]

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
        Id: 'TopSellingProducts',
        Title: 'Top Selling Products',
        Subtext: '',
        SeriesName: 'Ordered Quantity',

        Legend: false,
        // Data:  this.topSellingProduct,
        Type: 'Pie',
        Style: this.ChartStyle2
    }

    Chart2 = {
        Id: 'Top10ProductRevenueComparison',
        Title: 'Top 10 Product Revenue Comparison',
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

        // this.formGroup = formBuilder.group({
        //     IDBranch: [this.env.selectedBranch],
        //     Id: new FormControl({ value: '', disabled: true }),
        //     Code: [''],
        //     Name: ['', Validators.required],
        //     Remark: [''],
        //     Sort: [''],
        //     IsDisabled: new FormControl({ value: '', disabled: true }),
        //     IsDeleted: new FormControl({ value: '', disabled: true }),
        //     CreatedBy: new FormControl({ value: '', disabled: true }),
        //     CreatedDate: new FormControl({ value: '', disabled: true }),
        //     ModifiedBy: new FormControl({ value: '', disabled: true }),
        //     ModifiedDate: new FormControl({ value: '', disabled: true }),
        // });
    }

    segmentView = 'Product';
    segmentChanged(ev: any) {
        this.segmentView = ev.detail.value;
    }

    async saveChange() {
        super.saveChange2();
    }

    preLoadData(event?: any): void {
        // this.buildChartsData();
        this.buildPieChartsData();
        super.preLoadData(event);
    }

    loadedData(event?: any): void {

        let report = 'Receipt';  // Change here ( Product, Dashboard, Day, Receipt)
        this.segmentView = report;

        this.reportQuery = {
            fromDate: this.rpt.rptGlobal.query.fromDate,
            toDate: this.rpt.rptGlobal.query.toDate,
            IDBranch: this.env.selectedBranch,
            // SortBy: this.query.SortBy,
            // GroupBy: 'Day',  // Hour / Day / Week / Month / Year

            Take: 100,
            Skip: this.itemsData.length
        }; 

        //// TESTING Environment

        let apiPath = {
            method: "GET",
            url: function () { return ApiSetting.apiDomain("POS/Report/" + "ReceiptList") }
        };
        debugger
        Promise.all([
            this.commonService.connect(apiPath.method, apiPath.url(), this.reportQuery).toPromise()
        ]).then((values:any) => { 

            if (report == 'Dashboard') {
                debugger
                this.itemsData = values[0]['Data'];

                this.itemsData.forEach(i => {
                    i.RevenueText = lib.currencyFormat(i.Revenue);
                });
            }
            else {
                debugger
                if (values[0].length == 0) {
                    this.pageConfig.isEndOfData = true;
                }
                if (values[0].length > 0) { 
                    // this.itemsData = values[0];
                    let firstRow = values[0][0];

                    //Fix dupplicate rows
                    if (this.itemsData.findIndex(d => d.ReceiptID == firstRow.ReceiptID) == -1) {
                        this.itemsData = [...this.itemsData, ...values[0]];
                    }
                }



                // this.items = values[0];
            }

            console.log(this.itemsData);

            // this.items.sort((a,b) => b.ShippedQuantity - a.ShippedQuantity);
            // this.items = [...this.items];



            // this.buildTopSellingProducts();
            // this.buildTopRevenueProducts();
            super.loadedData(event);
        });
    }

    buildChartsData() {
        // BuildChartData
        debugger
    
        let report = 'Receipt';  // Change here ( Product, Dashboard, Day, Receipt)
        this.segmentView = report;

        this.reportQuery = {
            fromDate: this.rpt.rptGlobal.query.fromDate,
            toDate: this.rpt.rptGlobal.query.toDate,
            IDBranch: this.env.selectedBranch,
            // SortBy: this.query.SortBy,
            GroupBy: 'Day',  // Hour / Day / Week / Month / Year
        }; 

        //// TESTING Environment

        let apiPath = {
            method: "GET",
            url: function () { return ApiSetting.apiDomain("POS/Report/" + report) }
        };
        debugger
        Promise.all([
            this.commonService.connect(apiPath.method, apiPath.url(), this.reportQuery).toPromise()
        ]).then((values:any) => { 

            if (report == 'Dashboard') {
                this.itemsData = values[0]['Data'];

                this.itemsData.forEach(i => {
                    i.RevenueText = lib.currencyFormat(i.Revenue);
                });
            }
            else {
                // // this.itemsData = values[0];
                // let firstRow = values[0][0];

                // //Fix dupplicate rows
                // if (this.itemsData.findIndex(d => d.Id == firstRow.Id) == -1) {
                //     this.itemsData = [...this.itemsData, ...values[0]];
                // }

                this.items = values[0];
            }

            console.log(this.items);

            // this.items.sort((a,b) => b.ShippedQuantity - a.ShippedQuantity);
            // this.items = [...this.items];



            // this.buildTopSellingProducts();
            // this.buildTopRevenueProducts();
        });
    }

    buildPieChartsData() {
        // BuildChartData
        debugger
    
        let report = 'Receipt';  // Change here ( Product, Dashboard, Day, Receipt)
        this.segmentView = report;

        this.reportQuery = {
            fromDate: this.rpt.rptGlobal.query.fromDate,
            toDate: this.rpt.rptGlobal.query.toDate,
            IDBranch: this.env.selectedBranch,
            // SortBy: this.query.SortBy,
            GroupBy: 'Day',  // Hour / Day / Week / Month / Year
        }; 

        //// TESTING Environment

        let apiPath = {
            method: "GET",
            url: function () { return ApiSetting.apiDomain("POS/Report/" + "Payment") }
        };
        debugger
        Promise.all([
            this.commonService.connect(apiPath.method, apiPath.url(), this.reportQuery).toPromise()
        ]).then((values:any) => { 

            if (report == 'Dashboard') {
                this.itemsData = values[0]['Data'];

                this.itemsData.forEach(i => {
                    i.RevenueText = lib.currencyFormat(i.Revenue);
                });
            }
            else {
                // // this.itemsData = values[0];
                // let firstRow = values[0][0];

                // //Fix dupplicate rows
                // if (this.itemsData.findIndex(d => d.Id == firstRow.Id) == -1) {
                //     this.itemsData = [...this.itemsData, ...values[0]];
                // }

                this.items = values[0];
            }

            console.log(this.items);

            // this.items.sort((a,b) => b.ShippedQuantity - a.ShippedQuantity);
            // this.items = [...this.items];



            // this.buildTopSellingProducts();
            // this.buildTopRevenueProducts();
        });
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
