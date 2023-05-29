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
    selector: 'app-pos-category',
    templateUrl: './pos-category.page.html',
    styleUrls: ['./pos-category.page.scss'],
})
export class PosCategoryPage extends PageBase {

    reportQuery: any = {};

    categoryResults = [];
    sumCategoryResults = [];

    categoryData = [];
    categoryLabel = [];

    reportBranchList = [];

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

    segmentView = 's1';
    segmentChanged(ev: any) {
        this.segmentView = ev.detail.value;
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
            isCalcReceiptPayment: true
        }; 

        Promise.all([
            this.commonService.connect('GET', 'POS/Report/Category', this.reportQuery).toPromise()
        ]).then(values => { 
            this.items = values[0]['Sum'];
            this.categoryResults = values[0]['Data'];
            this.items.sort((a,b) => b.OrderedAmount - a.OrderedAmount);
            this.items = [...this.items];

            this.items.forEach(i => {
                i.TotalBeforeDiscount = Math.round(i.TotalBeforeDiscount);
                i.Day = new Date(i.Date).getDate();
                i.Month = new Date(i.Date).getMonth() + 1;
                // i.Quarter = new Date(i.Date).getMonth() + 1;
                i.DateText = lib.dateFormat((i.Date), 'yyyy/mm/dd');
                i.Year = new Date(i.Date).getFullYear();
                i.BeverageText = lib.currencyFormat(i.Beverage);
                i.FoodText = lib.currencyFormat(i.Food);
                i.SumTotalDiscountText = lib.currencyFormat(i.SumTotalDiscount);
                i.SumTotalAfterDiscountText = lib.currencyFormat(i.SumTotalAfterDiscount);
                i.SumTotalSVCText = lib.currencyFormat(i.SumTotalSVC);
            });

            this.categoryResults.forEach(i => {
                i.TotalBeforeDiscount = Math.round(i.TotalBeforeDiscount);
                i.Day = new Date(i.Date).getDate();
                i.Month = new Date(i.Date).getMonth() + 1;
                // i.Quarter = new Date(i.Date).getMonth() + 1;
                i.Year = new Date(i.Date).getFullYear();
            });

            Object.assign(this.sumCategoryResults, this.items);

            this.buildCategoryData();
            
            super.loadedData(event);
        });
    }

    buildCategoryData() {
        this.categoryData = [];

        if (this.categoryResults.length) {

            const ItemGroupList = [...new Map(this.categoryResults.map((item: any) => [item['ItemGroup'], item.ItemGroup])).values()];
            for (let index = 0; index < ItemGroupList.length; index++) {
                let group = ItemGroupList[index];
                let tempGroupData = this.categoryResults.filter(d => d.ItemGroup == group );
                var dataStackedChart = []
                this.rpt.timeGroups.forEach(e => {
                    if (this.rpt.rptGlobal.query.frequency == 0){
                        let Data = tempGroupData.filter(f => f.GroupBy == e.Hour)[0]?.TotalBeforeDiscount;
                        dataStackedChart.push(Data);
                    }
                    else if (this.rpt.rptGlobal.query.frequency == 1) {
                        let Data = tempGroupData.filter(f => f.GroupBy == e.Day && f.Month == e.Month && f.Year == e.Year)[0]?.TotalBeforeDiscount;
                        dataStackedChart.push(Data);
                    }
                    else if (this.rpt.rptGlobal.query.frequency == 2) {
                        let Data = tempGroupData.filter(f => f.GroupBy == e.Month && f.Year == e.Year)[0]?.TotalBeforeDiscount;
                        dataStackedChart.push(Data);
                    }
                    else if (this.rpt.rptGlobal.query.frequency == 3) {
                        let Data = tempGroupData.filter(f => f.GroupBy == e.Quarter && f.Year == e.Year)[0]?.TotalBeforeDiscount;
                        dataStackedChart.push(Data);
                    }
                    else if (this.rpt.rptGlobal.query.frequency == 4) {
                        let Data = tempGroupData.filter(f => f.GroupBy == e.Year)[0]?.TotalBeforeDiscount;
                        dataStackedChart.push(Data);
                    }
                });

                this.categoryData.push(
                    {
                        name: group,
                        data: dataStackedChart
                    }
                );
            }
            this.categoryLabel = this.rpt.timeGroups.map(m => m.Label);
        }
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
