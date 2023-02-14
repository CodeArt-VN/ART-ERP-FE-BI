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

    categoryData = [];
    categoryLabel = [];

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
        //     IDBranch: [''],
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

    segmentView = 's1';
    segmentChanged(ev: any) {
        this.segmentView = ev.detail.value;
    }

    async saveChange() {
        super.saveChange2();
    }

    loadedData(event?: any): void {

        this.reportQuery = {
            fromDate: this.rpt.rptGlobal.query.fromDate,
            toDate: this.rpt.rptGlobal.query.toDate,
            IDBranch: this.env.selectedBranch,
            // GroupBy: ''
        }; 

        let apiPath = {
            method: "GET",
            url: function () { return ApiSetting.apiDomain("POS/Report/Category") }
        };

        Promise.all([
            this.commonService.connect(apiPath.method, apiPath.url(), this.reportQuery).toPromise()
        ]).then(values => { 
            this.items = values[0];

            this.items.sort((a,b) => b.OrderedAmount - a.OrderedAmount);
            this.items = [...this.items];

            this.items.forEach(i => {
                i.TotalRevenue = Math.round(i.TotalRevenue);
            });

            this.buildCategoryData();
            
            super.loadedData(event);
        });
    }

    buildCategoryData() {
        this.categoryData = [];
        Object.assign(this.categoryResults, this.items);

        if (this.categoryResults.length) {

            this.categoryResults.sort((a,b) => a.TotalRevenue - b.TotalRevenue);

            this.categoryLabel = this.categoryResults.map(i => i.ItemGroup );
            
            let tempOrderedAmountData = this.categoryResults.map(i => i.OrderedAmount );

            let tempRevenueData = this.categoryResults.map(i => i.TotalRevenue );

            // this.categoryData.push({data: tempOrderedAmountData});

            this.categoryData = [{name: 'Revenue', data: tempRevenueData}]
            // this.categoryData.push({data: tempRevenueData});
            console.log(this.categoryData);
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
