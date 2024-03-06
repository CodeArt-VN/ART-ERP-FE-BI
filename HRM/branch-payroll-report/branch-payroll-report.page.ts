import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { AC_CaseProvider, BI_HRM_PayrollPerBranchProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-branch-payroll-report',
  templateUrl: 'branch-payroll-report.page.html',
  styleUrls: ['branch-payroll-report.page.scss'],
})
export class BranchPayrollReportPage extends PageBase {
  itemsState = [];
  isAllRowOpened = true;
  //itemsState: any = [];
  caseList = [];
  columns = [];

  selectedCycle;
  cycles = [];

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

    for (let i = 0; i < 12; i++) {
      let d = new Date();
      let rd = new Date(d.setMonth(d.getMonth() - i));

      this.cycles.push({
        Name: rd.getMonth() + 1 + '-' + rd.getFullYear(),
        Month: rd.getMonth() + 1,
        Year: rd.getFullYear(),
      });
    }

    this.selectedCycle = this.cycles[1];

    this.query.Year = this.selectedCycle.Year;
    this.query.Month = this.selectedCycle.Month;
  }

  preLoadData(event?: any): void {
    this.env.getBranch(this.env.selectedBranch, true).then((ls) => {
      this.itemsState = JSON.parse(JSON.stringify(ls));
    });

    this.caseProvider.read().then((result) => {
      this.caseList = result['data'];
      this.columns = [...new Map(this.caseList.map((i) => [i['Code'], { Code: i.Code, Name: i.Name }])).values()];
      super.preLoadData(event);
    });
  }

  loadedData(event?: any, ignoredFromGroup?: boolean): void {
    this.itemsState.forEach((b) => {
      b._data = this.items.find((d) => b.Id == d.IDBranch);
    });
    super.loadedData(event, ignoredFromGroup);
  }

  changeCycle() {
    this.query.Year = this.selectedCycle.Year;
    this.query.Month = this.selectedCycle.Month;
    super.refresh();
  }

  toggleRowAll() {
    this.isAllRowOpened = !this.isAllRowOpened;
    this.itemsState.forEach((i) => {
      i.showdetail = !this.isAllRowOpened;
      this.toggleRow(this.itemsState, i, true);
    });
  }

  syncFromHR() {
    this.env
      .showLoading(
        'Đang đồng bộ dữ liệu, xin vui lòng chờ',
        this.pageProvider.commonService
          .connect('GET', environment.appDomain + 'api/JOBS/SyncHRPayrollPerBranch', {
            Month: this.selectedCycle.Month,
            Year: this.selectedCycle.Year,
          })
          .toPromise(),
      )
      .then((resp) => {
        this.refresh();
      })
      .catch((err) => {});
  }

  syncToSAP() {
    this.env
      .showLoading(
        'Đang đồng bộ dữ liệu, xin vui lòng chờ',
        this.pageProvider.commonService
          .connect('GET', environment.appDomain + 'api/JOBS/SyncHRPayrollPerBranchToSAP', {
            Month: this.selectedCycle.Month,
            Year: this.selectedCycle.Year,
          })
          .toPromise(),
      )
      .then((resp) => {
        this.env.showMessage('Đã đồng bộ xong.');
      })
      .catch((err) => {});
  }
}
