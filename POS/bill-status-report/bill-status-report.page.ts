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
    selector: 'app-bill-status-report',
    templateUrl: 'bill-status-report.page.html',
    styleUrls: ['bill-status-report.page.scss']
})
export class BillStatusReportPage extends PageBase {
    viewDimension = '';

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
        this.pageConfig.isShowFeature = true;
        
    }

    preLoadData(event?: any): void {
        this.reportConfig = this.pageProvider.getReportConfig(1);
        this.subscriptions.push(
            this.pageProvider.regReportTrackingData(1).subscribe(ds => {
                this.items = ds.data;
                super.loadedData();
            }));
    }

    loadData(event?: any): void {
        this.pageProvider.getReportData(1);
        super.loadedData(event);
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
