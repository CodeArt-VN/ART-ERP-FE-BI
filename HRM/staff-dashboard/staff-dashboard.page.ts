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

    ionViewDidEnter() {
        this.buildCharts();
    }

    refresh() {
        this.updateChart();
    }

    changeDateFillter(type) {
        this.rpt.dateQuery(type).then(_ => {
            this.updateChart();
        }).catch(err => { let a = err });
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

        this.changeDateFillter('setdone');

    }

    updateChart() {

        this.buildCharts();
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
        this.buildTopSum();
    }

    buildCharts() {
        
        this.buildTopSum();
      
        
    }

    buildTopSum() {

        this.pageData.NumberOfEvents = 0;
        this.pageData.NumberOfGuests = 0;
        this.pageData.DoanhThu = 0;
        let datasets = this.rpt.buildDataset();
        let sumAll = 0;
        let sumAllDoanhThu = 0;
        let sumAllGuest = 0;
        for (let i = 0; i < datasets.length; i++) {
            const ds = datasets[i];
            if (!ds.hidden && ds.IDBranch != 1) {
                this.pageData.DoanhThu += ds.Data.map(m => m.DoanhThu).reduce((a, b) => a + b, 0);
                this.pageData.NumberOfEvents += ds.Data.map(m => m.Event).reduce((a, b) => a + b, 0);
                this.pageData.NumberOfGuests += ds.Data.map(m => m.NumberOfGuest).reduce((a, b) => a + b, 0);
                if (ds.IDBranch == 1) {
                    sumAll = ds.Data.map(m => m.Event).reduce((a, b) => a + b, 0);
                    sumAllDoanhThu = ds.Data.map(m => m.DoanhThu).reduce((a, b) => a + b, 0);
                    sumAllGuest = ds.Data.map(m => m.NumberOfGuest).reduce((a, b) => a + b, 0);
                }
            }

        }
        if (sumAll > 0) {
            this.pageData.NumberOfEvents = sumAll;
            this.pageData.NumberOfGuests = sumAllGuest;
            this.pageData.DoanhThu = sumAllDoanhThu;
        }
        this.pageData.DoanhThu = Math.round(this.pageData.DoanhThu / 100000000) / 10;
        this.pageData.NumberOfGuests = Math.round(this.pageData.NumberOfGuests / 1000);


    }

   
    open(i){
        this.nav(i.Form)
    }


}
