import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { Location } from '@angular/common';
import * as echarts from 'echarts';
import { lib } from 'src/app/services/static/global-functions';
import { ReportService } from 'src/app/services/report.service';
import { BIReport, ReportDataConfig } from 'src/app/models/options-interface';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-dynamic-report',
    templateUrl: 'dynamic-report.page.html',
    styleUrls: ['dynamic-report.page.scss']
})
export class DynamicReportPage extends PageBase {
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
        public route: ActivatedRoute,
        public location: Location,
    ) {
        super();
        //this.pageConfig.isShowFeature = true;
        this.id = this.route.snapshot.paramMap.get('id');
    }

    preLoadData(event?: any): void {
        this.reportConfig = this.pageProvider.getReportConfig(this.id, this.pageConfig.pageName);
        this.subscriptions.push(
            this.pageProvider.regReportTrackingData(this.reportConfig.Id).subscribe(ds => {
                if (ds) {
                    this.items = ds?.data;
                }
                
                super.loadedData();
            }));
    }

    loadData(event?: any): void {
        this.pageProvider.getReportData(this.reportConfig.Id);
        super.loadedData(event);
    }

    runTestData: any = null;
    onRunReport(config: BIReport) {
        this.pageProvider.runTestReport(config.DataConfig).subscribe((resp: any) => {
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
        this.pageProvider.getDatasetFromServer(this.reportConfig.Id);
    }

    

    onViewDimensionChange(dimension){
        this.viewDimension = dimension;
    }


    onActive(e) {
        console.log(this.selectedItems);
        console.log(e);
    }


}
