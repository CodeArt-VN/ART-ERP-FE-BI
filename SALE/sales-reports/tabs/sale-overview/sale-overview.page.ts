import { Component } from '@angular/core';
import { ActionSheetController, NavController, Platform } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { CustomService } from 'src/app/services/custom.service';
import { ReportService } from 'src/app/services/report.service';

@Component({
    selector: 'app-sale-overview',
    templateUrl: 'sale-overview.page.html',
    styleUrls: ['sale-overview.page.scss']
})
export class SaleOverviewPage extends PageBase {

  

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

}
