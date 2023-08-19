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
    
    showFilterChart = false;

    /** Chart object */
    myChart = null;

    /** Chart options */
    chartOption: echarts.EChartsOption = {
        tooltip: { trigger: 'item' },
        legend: { show: false, right: 16, orient: 'vertical', textStyle: { color: lib.getCssVariableValue('--ion-color-dark') } },
        series: [
            {
                name: 'Sale order status',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 6, borderColor: 'transparent', borderWidth: 2 },
                label: { show: true, formatter: '{b}: {@' + this.viewDimension + '} ({d}%)' },
            }
        ]
    }

    reportConfig: ReportConfig = {
        ReprotInfo: { Id: 1, Code: 'SampleReport', Type: 'pie' },
        TimeFrame: { From: { Type: '-7D' }, To: { Type: '-1D' } },
        CompareTo: { Type: '-1W', Value: null },
        Schema: { Id: 1, Code: 'SALE_Order', Name: 'Sale orders' },
        Transform: {
            Filter: {
                Dimension: 'logical', Operator: 'AND',
                Logicals: [
                    { Dimension: 'IDBranch', Operator: 'IN', Value: this.env.selectedBranchAndChildren },
                    { Dimension: 'OrderDate', Operator: '>=', Value: '2023-08-19' },
                    { Dimension: 'OrderDate', Operator: '<=', Value: new Date() },
                    { Dimension: 'logical', Operator: 'OR', Logicals: [
                        { Dimension: 'Type', Operator: '=', Value: 'POSOrder' },
                        { Dimension: 'Type', Operator: '=', Value: 'FMCG' },
                    ] },
                ]
            },
        },
        Interval: { Property: 'OrderDate', Type: 'Year' },
        CompareBy: [
            //{ Property: 'IDBranch' },
            { Property: 'Status' },
        ],
        //isGroupByCompareProperties: true, //=> chưa dùng đến
        MeasureBy: [
            { Property: 'Id', Method: 'count', Title: 'Count' },
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

    }

    loadData(event?: any): void {
        this.pageProvider.getReportDataset(this.reportConfig).subscribe(ds => {
            this.items = ds.data;
            this.buildDataset();
            super.loadedData(event);
        });
    }

    refresh(event?: any): void {
        this.pageProvider.getReportDataset(this.reportConfig, true).subscribe(ds => {
            this.items = ds.data;
            this.buildDataset();
            super.loadedData(event);
        });
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

    toggleChartFilter(status: boolean) {
        this.showFilterChart = status
    }

    buildDataset(dimention = null) {
        if (dimention) {
            this.viewDimension = dimention;
        }

        this.chartOption.dataset = {
            dimensions: [this.reportConfig.CompareBy[0].Property, this.viewDimension],
            source: this.items
        };
        this.loadChart();
    }

    loadChart() {
        // Set show full chart options
        if (this.showFullChart) {
            this.chartOption.legend = { show: true }
            this.chartOption.series[0].label = { show: true, formatter: '{b}: {@' + this.viewDimension + '} ({d}%)' };
        }
        else {
            this.chartOption.legend = { show: false }
            this.chartOption.series[0].label.show = false;
        }

        this.myChart?.setOption(this.chartOption);
    }


}
