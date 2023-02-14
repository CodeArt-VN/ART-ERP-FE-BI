import { CommonService } from 'src/app/services/core/common.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { ReportService } from 'src/app/services/report.service';
import { lib } from 'src/app/services/static/global-functions';
import { find } from '@amcharts/amcharts5/.internal/core/util/Array';

@Component({
    selector: 'app-pos-dashboard',
    templateUrl: './pos-dashboard.page.html',
    styleUrls: ['./pos-dashboard.page.scss'],
})
export class PosDashboardPage extends PageBase {

    labelLineChart;
    dataLineChart;
    titleLineChart;
    typeLineChart;
    piedataRevenue
    piedataReceipts
    piedataCustomers
    reportQuery;
    targetList = 0
    totalRevenue =0
    totalReceipts =0
    totalCustomers=0
    totalRevenueText
    totalReceiptsText
    totalCustomersText
    constructor(
        // public pageProvider: WMS_ZoneProvider,
        // public branchProvider: BRA_BranchProvider,
        // public modalController: ModalController,
        // public popoverCtrl: PopoverController,
        // public alertCtrl: AlertController,
        // public loadingController: LoadingController,
        public env: EnvService,
        public navCtrl: NavController,
        public rpt: ReportService,
        public commonService: CommonService,
        // public location: Location,
    ) {
        super();
    }

    loadedData(event?: any): void {

        let report = 'Dashboard';  // Change here ( Product, Dashboard, Day, Receipt)
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
            //  SortBy: this.query.SortBy,
            GroupBy: groupby  // Hour / Day / Week / Month / Year
        };
        //// TESTING Environment

        let apiPath = {
            method: "GET",
            url: function () { return ApiSetting.apiDomain("POS/Report/Dashboard") }
        };

        Promise.all([
            this.commonService.connect(apiPath.method, apiPath.url(), this.reportQuery).toPromise()
        ]).then(values => {

            if (report == 'Dashboard') {
                this.items = values[0];
                this.items.forEach(i => {
                    i.RevenueText = lib.currencyFormat(i.Revenue);
                });
            }
            else {
                this.items = values[0];
            };

            // this.items.sort((a,b) => b.ShippedQuantity - a.ShippedQuantity);
            // this.items = [...this.items];


            this.totalRevenue =  this.items.map(x => x.Revenue).reduce((a, b) => (+a) + (+b), 0);
            this.totalReceipts =  this.items.map(x => x.Receipts).reduce((a, b) => (+a) + (+b), 0);
            this.totalCustomers =  this.items.map(x => x.Customers).reduce((a, b) => (+a) + (+b), 0);
            this.totalCustomersText = lib.formatMoney(this.totalCustomers , 2, '.', ',');
            this.totalReceiptsText =lib.formatMoney(this.totalReceipts, 2, '.', ',');
            this.totalRevenueText =lib.formatMoney(this.totalRevenue, 2, '.', ',');
            
            // this.buildTopSellingProducts();
            // this.buildTopRevenueProducts();
            this.targetList = values[0]['targetList']
            this.buildCharts();

            super.loadedData(event);
        });
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
    changeDateFilter(type) {

        this.rpt.dateQuery(type).then(_ => {
            this.preLoadData(null);
        }).catch(err => { let a = err });
    }
    toogleBranchDataset(b) {
        // b.IsHidden = !b.IsHidden; console.log(b)
        // for (var key in this.charts) {
        //     let c = this.charts[key].Chart;

        //     c?.data.datasets.forEach(function (ds) {
        //         if (ds.IDBranch == b.Id) {
        //             ds.hidden = b.IsHidden;
        //         }
        //     });
        //     c?.update();
        // }
        // this.buildTopSum();
        // this.buildCalendarHeatmapChart();
    }
    changeBranchBtn() {
        if (this.env.selectedBranch == 16) {
            this.rpt.rptGlobal.branch.forEach(b => {
                b.ShowBtn = true;
                b.IsHidden = false;
            });
        }
        else {
            let currentBranch = this.rpt.rptGlobal.branch.find(b => b.Id == this.env.selectedBranch);
            this.rpt.rptGlobal.branch.forEach(b => {
                b.ShowBtn = false;
                b.IsHidden = true;
            });
            if (currentBranch) {
                currentBranch.ShowBtn = true;
                currentBranch.IsHidden = false;
            };
        }
    }
    mockdata = {
        targetList: [{ revernue: 5000000 }, { receipt: 2000 }, { customer: 1444 }],
        data: [
            { revernue: 220, receipt: 150, customer: 150 },
            { revernue: 182, receipt: 230, customer: 232 },
            { revernue: 191, receipt: 224, customer: 201 },
            { revernue: 234, receipt: 218, customer: 154 },
            { revernue: 290, receipt: 135, customer: 190 },
            { revernue: 330, receipt: 147, customer: 330 },
            { revernue: 310, receipt: 260, customer: 410 },
        ]
    }

    buildCharts() {
        var dataLineChart = []
        this.rpt.timeGroups.forEach(e => {
            if (this.rpt.rptGlobal.query.frequency == 1){
                dataLineChart.push(this.items.filter(f => f.GroupBy == e.Day)[0]?.Revenue)      
            }
            if (this.rpt.rptGlobal.query.frequency == 2) {
                dataLineChart.push(this.items.filter(f => f.GroupBy ==e.Month )[0]?.Revenue)               
            }

        });
        this.labelLineChart = this.rpt.timeGroups.map(m => m.Label),
        this.dataLineChart = [
            {
                name: 'Revenue',
                data: dataLineChart,
            }]
            let title
            if (this.rpt.rptGlobal.query.frequency == 1) {
                title = "Day"
            } else if (this.rpt.rptGlobal.query.frequency == 2) {
                title = "Month"
            }
        this.titleLineChart = title
        this.typeLineChart = "BasicLine"

        this.piedataRevenue =this.calcPercent(this.totalRevenue,this.mockdata.targetList[0].revernue)
       
        this.piedataReceipts =this.calcPercent(this.totalReceipts,this.mockdata.targetList[1].receipt)
       
        this.piedataCustomers =this.calcPercent(this.totalCustomers,this.mockdata.targetList[2].customer)
        
    }
    calcPercent(rValue,tValue){
        let present = (rValue/tValue*100).toFixed(0);  
       return present
    }

}
