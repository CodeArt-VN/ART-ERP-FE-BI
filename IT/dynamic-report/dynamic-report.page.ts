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
    selector: 'app-dynamic-report',
    templateUrl: 'dynamic-report.page.html',
    styleUrls: ['dynamic-report.page.scss']
})
export class DynamicReportPage extends PageBase {
    //Chart element Id
    chartId;
    chart: any;
    reportConfig: BIReport;

    items: any[] = [];

    constructor(
        public rpt: ReportService,
        public modalController: ModalController,
        public popoverCtrl: PopoverController,
        public alertCtrl: AlertController,
        public loadingController: LoadingController,
        public env: EnvService,
        public navCtrl: NavController,
        public location: Location,
    ) {
        super();
        this.chartId = lib.generateCode();
        this.reportConfig = rpt.getReportConfig(1);
        this.subscriptions.push(
            this.rpt.regReportTrackingData(1).subscribe(ds => {
                this.items = ds.data;
                this.updateChart();
            }));
    }

    loadData(event?: any): void {
        this.rpt.getReportData(1, true);
        super.loadData(event);
    }

    ionViewDidEnter(): void {
        var chartDom = document.getElementById(this.chartId);
        this.chart = echarts.init(chartDom);

        this.updateChart();

        new ResizeObserver(() => this.chart.resize()).observe(chartDom);
    }

    updateChart() {
        if (this.items.length) {
            const chartOptions = this.generateChartOptions(this.reportConfig, ['Status', 'CalcTotal'], this.items);
            this.chart?.setOption(chartOptions);
        }
    }

    suggestChartType(reportConfig: BIReport, dimensions: string[], items: any[]): string {
        const intervalProperty = reportConfig.DataConfig.Interval.Title || reportConfig.DataConfig.Interval.Property;
        const legendProperty = dimensions[0];

        const numIntervals = new Set(items.map(item => item[intervalProperty])).size;
        const numLegends = new Set(items.map(item => item[legendProperty])).size;
        const numDataPoints = items.length;

        if (numLegends === numDataPoints && numIntervals === 1 && numDataPoints <= 10) {
            return 'pie';
        } else if (numDataPoints <= 50 && numLegends <= 10) {
            return 'bar';
        } else if (numDataPoints > 100 || numLegends <= 50) {
            return 'line';
        }
    }

    generateChartOptions(reportConfig: BIReport, dimensions: string[], items: any[]): any {
        const legendProperty = dimensions[0];
        const valueProperty = dimensions[1];
        const chartType = this.suggestChartType(reportConfig, dimensions, items);

        let chartOptions: echarts.EChartsOption;
        chartOptions = this.rpt.echartDefaultOption.getChartOption(chartType, 'full');

        if (chartType === 'pie') {
            Object.assign(chartOptions,
                {
                    series: {
                        type: chartType,
                        
                        data: items.map((item) => {
                            return {
                                name: item[legendProperty],
                                value: item[valueProperty]
                            };
                        })
                    }
                })
        }
        else if (chartType === 'bar' || chartType === 'line') {
            const intervalProperty = reportConfig.DataConfig.Interval.Title || reportConfig.DataConfig.Interval.Property;
            const numIntervals = new Set(items.map(item => item[intervalProperty])).size;
            const legendData = Array.from(new Set(items.map(item => item[legendProperty])));

            let xData: any[] = [];
            let series = [];


            if (numIntervals > 1) {
                switch (intervalProperty) {
                    case 'HourOfDay':
                        xData = this.rpt.commonOptions.hoursOfDay;
                        break;

                    case 'DayOfWeek':
                        xData = this.rpt.commonOptions.daysOfWeek;
                        break;

                    case 'MonthOfYear':
                        xData = this.rpt.commonOptions.monthsOfYear;
                        break;
                }

                let idx = 0;
                series = legendData.map(legend => {
                    idx++;
                    return {
                        name: legend,
                        type: chartType,
                        emphasis: { focus: 'series' },
                        data: xData.map(x => {
                            const item = items.find(item => item[legendProperty] === legend && item[intervalProperty].toLowerCase() === x.toLowerCase());
                            return item ? item[valueProperty] : 0;
                        })
                    }
                });
            }

            Object.assign(chartOptions,
                {
                    xAxis: {
                        type: 'category',
                        data: xData
                    },
                    series: series
                });

            console.log(chartOptions);

            return chartOptions;
        }
    }

}
