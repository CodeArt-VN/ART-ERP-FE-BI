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
            let dimensions = [this.reportConfig.DataConfig.CompareBy[0].Title, this.reportConfig.DataConfig.MeasureBy[0].Title];
            //const chartOptions = this.generateChartOptions(this.reportConfig, ['Status', 'CalcTotal'], this.items);
            const chartOptions = this.rpt.echartDefaultOption.getChartOption('auto', 'full', this.reportConfig.DataConfig.Interval.Title, this.reportConfig.DataConfig.Interval.Type, dimensions, this.items);
            this.chart?.setOption(chartOptions);
        }
    }

  



}
