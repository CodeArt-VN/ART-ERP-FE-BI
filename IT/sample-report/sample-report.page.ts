import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { Location } from '@angular/common';
import * as echarts from 'echarts';
import { lib } from 'src/app/services/static/global-functions';
import { ReportService } from 'src/app/services/report.service';
import { BIReport, ReportDataConfig } from 'src/app/models/options-interface';

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

    reportConfig: BIReport;
    

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


/*
var legendList = ['New', 'Done', 'Cancelled'];

option = {
  backgroundColor: '',
  textStyle: { color: '#1b1a16' },
  legend: {
    show: true,
    bottom: 0,
    type: 'scroll',
    padding: [16, 16, 16, 16],
    icon: 'circle',
    textStyle: { color: '#1b1a16' },
    //data: legendList.map(m=>{return {name: m}})
  },
  tooltip: {
    appendToBody: true,
    extraCssText: 'width:auto; max-width: 250px; white-space:pre-wrap;',
    textStyle: { color: '#1b1a16' },
    
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
    
  },
  toolbox: {
    show: false,
    orient: 'vertical',
    right: 16,
    itemSize: 20,
    feature: { magicType: { type: ['line', 'bar', 'stack'] }, saveAsImage: {} },
    iconStyle: { color: '#9dbc01', borderColor: '#9dbc01' }
  },
  xAxis: { type: 'date' },
  yAxis: { type: 'value' },
  series: [
    {
      name: 'New',
      type: 'bar',
      stack: 'x',
      encode: { x: 'OrderDate-Hour', y: 'CalcTotal' },
      datasetIndex: 1
    },
    {
      name: 'Done',
      type: 'bar',
      stack: 'x',
      encode: { x: 'OrderDate-Hour', y: 'CalcTotal' },
      datasetIndex: 2
    },{
      name: 'Cancelled',
      type: 'bar',
      stack: 'x',
      encode: { x: 'OrderDate-Hour', y: 'CalcTotal' },
      datasetIndex: 3
    }
  ],
  dataset: [
    {
      dimensions: ['Status', 'OrderDate-Hour', 'CalcTotal'],
      source: [
        {
          Status: 'Cancelled',
          'OrderDate-Hour': '2023-09-13',
          Count: 2,
          CalcTotal: 494991
        },
        {
          Status: 'Done',
          'OrderDate-Hour': '2023-09-13',
          Count: 2,
          CalcTotal: 430920
        },
        {
          Status: 'Done',
          'OrderDate-Hour': '2023-09-14',
          Count: 2,
          CalcTotal: 504504
        },
        {
          Status: 'Done',
          'OrderDate-Hour': '2023-09-15',
          Count: 3,
          CalcTotal: 27783
        },
        {
          Status: 'Cancelled',
          'OrderDate-Hour': '2023-09-16',
          Count: 1,
          CalcTotal: 164430
        },
        {
          Status: 'Cancelled',
          'OrderDate-Hour': '2023-09-19',
          Count: 1,
          CalcTotal: 164430
        },
        {
          Status: 'Done',
          'OrderDate-Hour': '2023-09-19',
          Count: 1,
          CalcTotal: 18144
        },
        {
          Status: 'New',
          'OrderDate-Hour': '2023-09-19',
          Count: 1,
          CalcTotal: 73710
        }
      ]
    },
    {
      transform: {
        type: 'filter',
        config: { dimension: 'Status', value: 'New' }
      }
    },
    {
      transform: {
        type: 'filter',
        config: { dimension: 'Status', value: 'Done' }
      }
    },
    {
      transform: {
        type: 'filter',
        config: { dimension: 'Status', value: 'Cancelled' }
      }
    },
    
    
    
  ]
};
*/