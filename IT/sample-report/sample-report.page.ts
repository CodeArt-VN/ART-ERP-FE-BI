import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { Location } from '@angular/common';
import * as echarts from 'echarts';
import { lib } from 'src/app/services/static/global-functions';
import { ReportService } from 'src/app/services/report.service';
import { ReportDataConfig } from 'src/app/models/options-interface';

@Component({
    selector: 'app-sample-report',
    templateUrl: 'sample-report.page.html',
    styleUrls: ['sample-report.page.scss']
})
export class SampleReportPage extends PageBase {
    /** Chart element Id */
    elId: string = '';

    /** switch between Dimensions */
    viewDimension = 'Count';

    /** Toggle show full chart options */
    showFullChart = false;

    /** Chart object */
    myChart = null;

    /** Chart options */
    chartOption: echarts.EChartsOption = {
        tooltip: { trigger: 'item' },
        series: [
            {
                name: 'Sale order status',
                type: 'pie',
                radius: ['40%', '60%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 6, borderColor: 'transparent', borderWidth: 2 },
                label: { show: true, formatter: '{b}: {@' + this.viewDimension + '} ({d}%)' },
            }
        ]
    }

    reportConfig: ReportDataConfig = {
        ReprotInfo: { Id: 1, Code: 'SampleReport', Name: 'POS SO Status', Type: 'pie' },
        TimeFrame: { Dimension: 'OrderDate', From: { Type: 'Relative', IsPastDate: true, Period: 'Hour', Amount: 7 }, To: { Type: 'Relative', IsPastDate: true, Period: 'Day', Amount: 0 } },
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
        this.elId = lib.generateCode();
        this.subscriptions.push(
            this.pageProvider.regReportTrackingData(1).subscribe(ds => {
                this.items = ds.data;//[...this.items, ...ds.data];
                console.log(this.items);
                this.buildDataset();
                super.loadedData();
            }));
    }

    loadData(event?: any): void {
        this.pageProvider.getReportData(1, true);
    }

    ionViewDidEnter(): void {
        let that = this;
        var chartDom = document.getElementById(this.elId);
        this.myChart = echarts.init(chartDom);
        this.myChart.on('click', function (params) {
            console.log(params.name);
            that.query.Title = params.name;
            that.query.InvoiceDate = lib.dateFormat(new Date());
            that.refresh();
        });

        this.buildDataset();
        new ResizeObserver(() => this.myChart.resize()).observe(chartDom);
    }


    /**
     * Toggle chart full option view / mini chart view
     */
    toggleMiniChart() {
        this.showFullChart = !this.showFullChart;
        var chartDom = document.getElementById(this.elId);
        chartDom.parentElement.classList.toggle("show-full");

        this.loadChart();
    }

    buildDataset(dimention = null) {
        if (dimention) {
            this.viewDimension = dimention;
        }

        this.chartOption.dataset = {
            dimensions: [this.reportConfig.DataConfig.CompareBy[0].Property, this.viewDimension],
            source: this.items
        };
        this.loadChart();
    }

    loadChart() {
        // Set show full chart options
        if (this.showFullChart) {
            this.chartOption.toolbox = {
                show: true,
                feature: {
                    magicType: { show: true, type: ['line', 'bar'] },
                    restore: { show: true },
                }
            };
            this.chartOption.legend = { show: true, padding: [16, 16, 16, 16], textStyle: { color: lib.getCssVariableValue('--ion-color-dark') } },
                this.chartOption.series[0].label = { show: true, formatter: '{b}: {@' + this.viewDimension + '} ({d}%)' };
        }
        else {
            this.chartOption.legend = { show: false }
            this.chartOption.series[0].label.show = false;
        }

        this.myChart?.setOption(this.chartOption);
    }

    onActive(e) {
        console.log(this.selectedItems);

        console.log(e);
    }


}
