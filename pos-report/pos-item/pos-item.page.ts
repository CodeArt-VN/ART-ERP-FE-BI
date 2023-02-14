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
    selector: 'app-pos-item',
    templateUrl: './pos-item.page.html',
    styleUrls: ['./pos-item.page.scss'],
})
export class PosItemPage extends PageBase {

    reportQuery: any = {};

    topSellingProduct = [];
    topRevenueProducts = [];

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
            toDate: this.rpt.rptGlobal.query.toDate + ' 23:59:59',
            IDBranch: this.env.selectedBranch,
            // GroupBy: ''
        }; 

        let apiPath = {
            method: "GET",
            url: function () { return ApiSetting.apiDomain("POS/Report/Product") }
        };

        Promise.all([
            this.commonService.connect(apiPath.method, apiPath.url(), this.reportQuery).toPromise()
        ]).then(values => { 

            this.items = values[0];

            this.items.sort((a,b) => b.OrderedAmount - a.OrderedAmount);
            this.items = [...this.items];

            this.items.forEach(i => {
                i.PriceText = lib.currencyFormat(i.Price);
                i.TakeawayPriceText = lib.currencyFormat(i.TakeawayPrice);
                i.DeliveryPriceText = lib.currencyFormat(i.DeliveryPrice);
                i.TotalRevenueText = lib.currencyFormat(i.TotalRevenue);
            });

            this.buildTopSellingProducts();
            this.buildTopRevenueProducts();
            
            super.loadedData(event);
        });
    }

    topSellingProductLabel = [];
    topSellingProductData;
    buildTopSellingProducts() {
        Object.assign(this.topSellingProduct, this.items);

        if (this.topSellingProduct.length) {

            this.topSellingProduct.sort((a,b) => b.OrderedAmount - a.OrderedAmount);
            this.topSellingProduct = this.topSellingProduct.splice(0, 10);

            this.topSellingProductLabel = this.topSellingProduct.map(i => i.Product );
            
            let tempData = this.topSellingProduct.map(i => i.OrderedAmount );
            this.topSellingProductData = [{name: 'Ordered Quantity', data: tempData}]
        }
    }
    
    buildTopRevenueProducts() {
        Object.assign(this.topRevenueProducts, this.items);

        if (this.topRevenueProducts.length) {

            this.topRevenueProducts.sort((a,b) => b.TotalRevenue - a.TotalRevenue);
            this.topRevenueProducts = this.topRevenueProducts.splice(0, 10);

            this.topRevenueProducts = this.topRevenueProducts.map(i => ({ value: i.TotalRevenue, name: i.Product }));
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
