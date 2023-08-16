import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, WMS_ZoneProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import * as echarts from 'echarts';
import { lib } from 'src/app/services/static/global-functions';
import { ReportService } from 'src/app/services/report.service';

@Component({
    selector: 'app-sample-report',
    templateUrl: 'sample-report.page.html',
    styleUrls: ['sample-report.page.scss']
})
export class SampleReportPage extends PageBase {
    /** Chart element Id */
    elId: string = '';

    /** switch between dimensions */
    viewDimension = 'Count';

    /** Toggle show full chart options */
    showFullChart = false;

    /** Chart object */
    myChart = null;

    /** Chart options */
    option: echarts.EChartsOption = {
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

    reportConfig: any = {
        timeFrame: { From: '-7D', To: 0 },
        compareTo: '-1W',
        performedBy: {Schema: 'SaleOrder'},
        transform: {
            type: 'filter',
            config: {
                and: [
                    { dimension: 'IDBranch', operator: '=', value: 1 },
                    { dimension: 'Type', operator: '=', value: 'POS' },
                    { dimension: 'OrderDate', operator: '>=', value: 'calcFromTimeFrame' },
                    { dimension: 'OrderDate', operator: '<=', value: 'calcToTimeFrame' }
                ]
            }
        },
        interval: {type: 'Day'},
        compareBy: [
            { property: 'IDBranch' },
            { property: 'Title' },
        ],
        measureBy: [
            { property: 'Id', method: 'count'},
            { property: 'Discount', method: 'sum', title: 'Sum of discount'},
        ]
    }



    constructor(
        public pageProvider: ReportService,
        public branchProvider: BRA_BranchProvider,
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
        this.items = [
            { Id: 1, Title: 'New', Count: 37, Total: 23000000, Discount: 9800000 },
            { Id: 2, Title: 'Approved', Count: 23, Total: 45600000, Discount: 6700000 },
            { Id: 3, Title: 'Shipping', Count: 56, Total: 8700000, Discount: 2500000 },
            { Id: 4, Title: 'Done', Count: 87, Total: 89000000, Discount: 1500000 },
            { Id: 5, Title: 'Done', Count: 87, Total: 89000000, Discount: 1500000 },
        ];

        let gs = this.pageProvider.groupByArray(this.items, 'Title');
        console.log(gs);

        let gb = this.pageProvider.groupBy(this.items, g=>g)
        

        let ts = this.items.map((m)=>  {
            let i:any = {};
            this.reportConfig.compareBy.forEach(c => {
                i[c.property] = m[c.property];
            });
            return i;
        })


        console.log(ts);
        




        
        
        super.loadedData(event);
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

        this.option.dataset = {
            dimensions: ['Title', this.viewDimension],
            source: this.items
        };
        this.loadChart();
    }

    loadChart() {
        // Set show full chart options
        if (this.showFullChart) {
            this.option.legend = { show: true }
            this.option.series[0].label = { show: true, formatter: '{b}: {@' + this.viewDimension + '} ({d}%)' };
        }
        else {
            this.option.legend = { show: false }
            this.option.series[0].label.show = false;
        }

        this.myChart.setOption(this.option);
    }


}
