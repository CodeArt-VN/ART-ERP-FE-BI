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
    selector: 'app-pos-revenue',
    templateUrl: './pos-revenue.page.html',
    styleUrls: ['./pos-revenue.page.scss'],
})
export class PosRevenuePage extends PageBase {

    reportQuery: any = {};

    revenueData = [];
    revenueChartData = [];

    summaryData = [];
    summaryInfo;

    reportBranchList = [];

    ChartStyle2 = {
        width: '100%',
        'min-height': '300px',
    }

    Chart1 = {
        Id: 'RevenueReports',
        Title: 'Revenue Reports',
        Subtext: '',
        SeriesName: 'Revenue',

        Legend: false,
        // Data:  this.topSellingProduct,
        Type: 'Treemap',
        Tooltip: 'Percent',
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
        this.reportBranchList = this.env.branchList.filter(b => b.Type == 'Company');
    }

    segmentView = 'Item';
    segmentChanged(ev: any) {
        this.segmentView = ev.detail.value;
        this.preLoadData(null);
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
            GroupBy: groupby,
            GroupItemBy: this.segmentView,
        }; 

        let apiPath = {
            method: "GET",
            url: function () { return ApiSetting.apiDomain("POS/Report/Revenue") }
        };

        Promise.all([
            this.commonService.connect(apiPath.method, apiPath.url(), this.reportQuery).toPromise(),
        ]).then((values:any) => { 
            this.items = values[0]['Categories'];

            this.summaryData = values[0]['Summary'];

            this.items.sort((a,b) => b.OrderedAmount - a.OrderedAmount);
            this.items = [...this.items];

            this.items.forEach(i => {
                i.TotalRevenue = Math.round(i.TotalRevenue);
            });

            this.buildSummaryData();
            this.buildRenenueData();
            super.loadedData(event);
        });
    }

    buildRenenueData() {
        Object.assign(this.revenueData, this.items);

        if (this.revenueData.length) {
            this.revenueChartData = [];

            let tempIDItemGroupList = [...new Set(this.revenueData.map(r => r.IDItemGroup))];

            if (tempIDItemGroupList.length) {
                for (let index = 0; index < tempIDItemGroupList.length; index++) {
                    let Id = tempIDItemGroupList[index];

                    let tempList = this.revenueData.filter(d => d.IDItemGroup == Id);
                    let tempParentValue = tempList.map(x => x.TotalRevenue).reduce((a, b) => (+a) + (+b), 0);
                    let tempChild;
                    let tempParentObject;

                    if (this.segmentView == "Item") {
                        tempChild = tempList.map(i => ({ name: i.Name, value: i.TotalRevenue, percent: ((i.TotalRevenue / this.summaryInfo.TotalRevenue) * 100).toFixed(2) }));

                        tempParentObject = {
                            name: tempList[0].ItemGroup, 
                            value: tempParentValue,
                            children: tempChild
                        };
                    }
                    else {
                        tempChild = tempList.map(i => ({ name: i.Name, value: i.TotalRevenue, percent: ((i.TotalRevenue / this.summaryInfo.TotalRevenue) * 100).toFixed(2)  }));

                        tempParentObject = {
                            name: tempList[0].ItemGroup, 
                            value: tempParentValue,
                            children: [{name: tempList[0].ItemGroup, value: tempParentValue, percent: ((tempParentValue / this.summaryInfo.TotalRevenue) * 100).toFixed(2)  }]
                        };
                    }

                    this.revenueChartData.push(tempParentObject);
                }
            }
        }
    }

    buildSummaryData() {
        this.summaryData;

        this.summaryInfo = {};

        this.summaryInfo.TotalRevenue =  this.summaryData.map(x => x.Revenue).reduce((a, b) => (+a) + (+b), 0);
        this.summaryInfo.TotalReceipt =  this.summaryData.map(x => x.Receipts).reduce((a, b) => (+a) + (+b), 0);
        this.summaryInfo.TotalCustomer =  this.summaryData.map(x => x.Customers).reduce((a, b) => (+a) + (+b), 0);

        this.summaryInfo.TotalRevenueText = lib.formatMoney(this.summaryInfo.TotalRevenue, 0, '.', ',');
        this.summaryInfo.AveragePerReceiptText = lib.formatMoney((this.summaryInfo.TotalRevenue / this.summaryInfo.TotalReceipt), 0, '.', ',');
        this.summaryInfo.AveragePerCustomerText = lib.formatMoney((this.summaryInfo.TotalRevenue / this.summaryInfo.TotalCustomer), 0, '.', ',');
        console.log(this.summaryData);
    }



    changeDateFilter(type) {
        this.rpt.dateQuery(type).then(_ => {
            this.preLoadData(null);
        }).catch(err => { let a = err });
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
        this.loadData();
    }
}
