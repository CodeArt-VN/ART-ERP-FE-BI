import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { Location } from '@angular/common';
import * as echarts from 'echarts';
import { lib } from 'src/app/services/static/global-functions';
import { ReportService } from 'src/app/services/report.service';
import { ReportConfig } from 'src/app/models/options-interface';

@Component({
    selector: 'app-bill-status-report',
    templateUrl: 'bill-status-report.page.html',
    styleUrls: ['bill-status-report.page.scss']
})
export class BillStatusReportPage extends PageBase {
    viewDimension = '';

    reportConfig: ReportConfig = {
        ReprotInfo: { Id: 1, Code: 'BillStatusReport', Name: 'POS SO Status', Type: 'pie' },
        TimeFrame: { Dimension: 'OrderDate', From: { Type: 'Relative', IsPastDate: true, Period: 'Day', Amount: 0 }, To: { Type: 'Relative', IsPastDate: true, Period: 'Day', Amount: 0 } },
        CompareTo: { Type: 'Relative', IsPastDate: true, Period: 'Week', Amount: 1 },
        Schema: { Id: 1, Code: 'SALE_Order', Name: 'Sale orders' },
        Transform: {
            Filter: {
                Dimension: 'logical', Operator: 'AND',
                Logicals: [
                    { Dimension: 'IDBranch', Operator: 'IN', Value: this.env.selectedBranchAndChildren },
                    { Dimension: 'Status', Operator: 'IN', Value: JSON.stringify(['New', 'Confirmed', 'Scheduled', 'Picking', 'Delivered', 'Done', 'Cancelled', 'InDelivery']) }, //'Splitted', 'Merged',
                    { Dimension: 'CalcTotal', Operator: '>', Value: '0' },
                    // { Dimension: 'OrderDate', Operator: '>=', Value: '2023-08-19' }, auto from timeframe
                    // { Dimension: 'OrderDate', Operator: '<=', Value: new Date() },
                    {
                        Dimension: 'logical', Operator: 'OR', Logicals: [
                            { Dimension: 'Type', Operator: '=', Value: 'POSOrder' },
                            // { Dimension: 'Type', Operator: '=', Value: 'FMCG' },
                        ]
                    },
                ]
            },
        },
        Interval: { Property: 'OrderDate', Type: 'Day', Title: 'OrderDate-Hour' },
        CompareBy: [
            //{ Property: 'IDBranch' },
            { Property: 'Status' },
        ],
        //isGroupByCompareProperties: true, //=> chưa dùng đến
        MeasureBy: [
            { Property: 'Id', Method: 'count', Title: 'Count' },

            // { Property: 'TotalBeforeDiscount', Method: 'sum', Title: 'BeforeDiscount' },
            // { Property: 'TotalDiscount', Method: 'sum', Title: 'TotalDiscount' },
            // { Property: 'TotalAfterDiscount', Method: 'sum', Title: 'AfterDiscount' },
            // { Property: 'Tax', Method: 'sum', Title: 'Tax' },
            // { Property: 'TotalAfterTax', Method: 'sum', Title: 'TotalAfterTax' },
            // { Property: 'Received', Method: 'sum', Title: 'Received' },
            // { Property: 'Debt', Method: 'sum', Title: 'Debt' },
            // { Property: 'CalcTotalAdditions', Method: 'sum', Title: 'Additions' },
            { Property: 'CalcTotal', Method: 'sum', Title: 'CalcTotal' },
        ]
    }

    constructor(
        public pageProvider: ReportService,
        public modalController: ModalController,
        public popoverCtrl: PopoverController,
        public alertCtrl: AlertController,
        public loadingController: LoadingController,
        public env: EnvService,
        public navCtrl: NavController,
        public location: Location,
    ) {
        super();
        this.pageConfig.isShowFeature = true;
        this.subscriptions.push(
            this.pageProvider.regReportTrackingData(1).subscribe(ds => {
                this.items = ds.data;
                super.loadedData();
            }));
    }

    loadData(event?: any): void {
        this.pageProvider.getReportData(1);
    }

    runTestData: any = null;
    onRunReport(config) {
        this.pageProvider.runTestReport(config).subscribe((resp: any) => {
            this.runTestData = {
                ...{
                    dataFetchDate: resp.LastModifiedDate,
                    data: resp.Data
                }
            };
            this.items = resp['Data'];
        }, error => { console.log(error); });
    }

    onSave(config) {
        this.pageProvider.saveReportConfig(config);
        this.pageProvider.getDatasetFromServer(1);
    }

    

    onViewDimensionChange(dimension){
        this.viewDimension = dimension;
    }


    onActive(e) {
        console.log(this.selectedItems);
        console.log(e);
    }


}
