import { Component, ViewChild } from '@angular/core';
import { ActionSheetController, NavController, Platform } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { ReportService } from 'src/app/services/report.service';
import { lib } from 'src/app/services/static/global-functions';
import Chart from 'chart.js';
import { CustomService } from 'src/app/services/custom.service';


@Component({
    selector: 'app-sale-insignts',
    templateUrl: 'sale-insignts.page.html',
    styleUrls: ['sale-insignts.page.scss']
})
export class SaleInsigntsPage extends PageBase {
    isShowFeature = true;

    funnelChart: any;
    @ViewChild('funnelCanvas') funnelCanvas;

    constructor(
        private pageService: CustomService,
        public actionSheetController: ActionSheetController,
        public env: EnvService,
        public navCtrl: NavController,
        private platform: Platform,
        public rpt: ReportService,
    ) {
        super();
    }

    loadedData() {
       
    }

    toogleBranchDataset(b) {
        b.IsHidden = !b.IsHidden;

        let charts = [
            //this.doanhThuChiTieuChart, 
           
        ];

        charts.forEach(c => {
            c.data.datasets.forEach(function (ds) {
                if (ds.IDBranch == b.Id) {
                    ds.hidden = b.IsHidden;
                }
            });
            c.update();
        });
    }

    
}
