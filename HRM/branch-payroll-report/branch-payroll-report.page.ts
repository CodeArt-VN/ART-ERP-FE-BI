import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { AC_CaseProvider, BI_HRM_PayrollPerBranchProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';

@Component({
    selector: 'app-branch-payroll-report',
    templateUrl: 'branch-payroll-report.page.html',
    styleUrls: ['branch-payroll-report.page.scss']
})
export class BranchPayrollReportPage extends PageBase {
    itemsState = [];
    isAllRowOpened = true;
    //itemsState: any = [];
    caseList = [];
    columns = [];

    constructor(
        public pageProvider: BI_HRM_PayrollPerBranchProvider,
        public caseProvider: AC_CaseProvider,
        public modalController: ModalController,
		public popoverCtrl: PopoverController,
        public alertCtrl: AlertController,
        public loadingController: LoadingController,
        public env: EnvService,
        public navCtrl: NavController,
        public location: Location,
    ) {
        super();
    }

    preLoadData(event?: any): void {
        this.query.Year = 2022;
        this.query.Month = 12;
        this.env.getBranch(this.env.selectedBranch, true).then(ls=>{
            this.itemsState = JSON.parse(JSON.stringify(ls));
        })
        
        this.caseProvider.read().then(result=>{
            this.caseList = result['data'];
            this.columns = [...new Map(this.caseList.map(i =>[i['Code'], {Code:i.Code, Name:i.Name}])).values()];
            super.preLoadData(event);
        })
    }

    loadedData(event?: any, ignoredFromGroup?: boolean): void {
        this.itemsState.forEach(b => {
            b._data = this.items.find(d => b.Id == d.IDBranch);
        });

        // this.items.forEach(i => {
        //     let it = this.itemsState.find(d => d.Id == i.IDBranch);
        //     if (it) {
        //         //i._BranchName = it.Name;
        //         it._data = i;
        //     }
        //     // Object.keys(i).forEach(function (key) {
        //     //     let c = this.caseList.find(d=>d.Code == key && d.IDBranch == d.IDBranch);
        //     //     if (c) {
                    
        //     //     }
        //     // });
        // });
        
        
        super.loadedData(event, ignoredFromGroup);
    }
    toggleRowAll() {
        this.isAllRowOpened = !this.isAllRowOpened;
        this.itemsState.forEach(i => {
            i.showdetail = !this.isAllRowOpened;
            this.toggleRow(this.itemsState, i, true);
        });
    }
}
