import { Component, ViewChild } from '@angular/core';
import { ActionSheetController, NavController, Platform } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { ReportService } from 'src/app/services/report.service';
import { lib } from 'src/app/services/static/global-functions';

import { CustomService } from 'src/app/services/custom.service';

@Component({
    selector: 'app-staff-dashboard',
    templateUrl: 'staff-dashboard.page.html',
    styleUrls: ['staff-dashboard.page.scss']
})
export class StaffDashboardPage extends PageBase {
    isShowFeature = true;
    pageData: any = {};
    calendarHeatmapData: any = {};
    selectedHeatNode = { value: 5, color: ()=>lib.getCssVariableValue('--ion-color-primary'), opacity: 'ff' };

    slideOpts = {
        slidesPerView: 'auto',
        spaceBetween: 30,
        centeredSlides: true,
        freeMode: false,
        pagination: { clickable: true },
        navigation: true,
        scrollbar: { draggable: true },

    };

    btns = [
        {Icon:'person-circle', Title: 'Hồ sơ', Form: 'profile'},
        {Icon:'calendar', Title: 'Lịch làm việc', Form: 'personal-scheduler'},
        {Icon:'paper-plane', Title: 'Đề xuất', Form: 'request'},
        {Icon:'qr-code', Title: 'Chấm công', Form: 'checkin'},
        {Icon:'ribbon', Title: 'Bảng lương', Form: 'payroll'},
        {Icon:'list', Title: 'Tasks', Form: 'todo'},
    ]

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




    changeFrequency(f) {
        this.rpt.rptGlobal.query.frequency = f.Id;

        if (f.Id == 1) {
            this.rpt.rptGlobal.query.fromDate = '2020-01-06';
            this.rpt.rptGlobal.query.toDate = '2020-01-12';
        }
        else if (f.Id == 2) {
            this.rpt.rptGlobal.query.fromDate = '2020-01-01';
            this.rpt.rptGlobal.query.toDate = '2020-01-31';
        }

    }

    toogleBranchDataset(b) {
        b.IsHidden = !b.IsHidden;
        // for (var key in this.charts) {
        //     let c = this.charts[key].Chart;

        //     c.data.datasets.forEach(function (ds) {
        //         if (ds.IDBranch == b.Id) {
        //             ds.hidden = b.IsHidden;
        //         }
        //     });
        //     c.update();
        // }
    }
   
    open(i){
        this.nav(i.Form)
    }


}
