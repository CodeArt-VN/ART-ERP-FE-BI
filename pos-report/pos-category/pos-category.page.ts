import { Component, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { CustomService } from 'src/app/services/custom.service';
import { ReportService } from 'src/app/services/report.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { lib } from 'src/app/services/static/global-functions';

@Component({
  selector: 'app-pos-category',
  templateUrl: './pos-category.page.html',
  styleUrls: ['./pos-category.page.scss'],
})
export class PosCategoryPage extends PageBase {
  reportQuery: any = {};

  categoryResults = [];

  categoryData = [];
  categoryLabel = [];

  reportBranchList = [];

  constructor(
    public pageProvider: CustomService,
    public branchProvider: BRA_BranchProvider,
    public env: EnvService,
    public navCtrl: NavController,
    public rpt: ReportService,

    public route: ActivatedRoute,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef,
    public loadingController: LoadingController,
    public commonService: CommonService,
  ) {
    super();
    this.pageConfig.isDetailPage = true;

    this.reportBranchList = this.env.branchList.filter((b) => b.Type == 'Company');
  }

  segmentView = 's1';
  segmentChanged(ev: any) {
    this.segmentView = ev.detail.value;
  }

  async saveChange() {
    super.saveChange2();
  }

  loadedData(event?: any): void {
    this.reportQuery = {
      fromDate: this.rpt.rptGlobal.query.fromDate,
      toDate: this.rpt.rptGlobal.query.toDate,
      IDBranch: this.env.selectedBranchAndChildren,
      // GroupBy: ''
    };

    let apiPath = {
      method: 'GET',
      url: function () {
        return ApiSetting.apiDomain('POS/Report/Category');
      },
    };

    Promise.all([this.commonService.connect(apiPath.method, apiPath.url(), this.reportQuery).toPromise()]).then(
      (values) => {
        this.items = values[0];

        this.items.sort((a, b) => b.OrderedAmount - a.OrderedAmount);
        this.items = [...this.items];

        this.items.forEach((i) => {
          i.TotalRevenue = Math.round(i.TotalRevenue);
        });

        this.buildCategoryData();

        super.loadedData(event);
      },
    );
  }

  buildCategoryData() {
    this.categoryData = [];
    Object.assign(this.categoryResults, this.items);

    if (this.categoryResults.length) {
      this.categoryResults.sort((a, b) => a.TotalRevenue - b.TotalRevenue);

      this.categoryLabel = this.categoryResults.map((i) => i.ItemGroup);
      let tempRevenueData = this.categoryResults.map((i) => i.TotalRevenue);

      this.categoryData = [{ name: 'Revenue', data: tempRevenueData }];
    }
  }

  changeDateFilter(type) {
    this.rpt
      .dateQuery(type)
      .then((_) => {
        this.preLoadData(null);
      })
      .catch((err) => {
        let a = err;
      });
  }

  changeFrequency(f) {
    this.rpt.rptGlobal.query.frequency = f.Id;
    this.changeDateFilter('setdone');
  }

  toogleBranchDataset(b) {
    let currentBranch = this.reportBranchList.find((rp) => rp.Id == b.Id);
    this.reportBranchList.forEach((rp) => {
      if (rp.Id != b.Id) {
        rp.IsHidden = true;
      } else {
        rp.IsHidden = false;
      }
    });

    if (!currentBranch.IsHidden) {
      this.env.selectedBranchAndChildren = currentBranch.Query;
    } else {
      this.env.selectedBranchAndChildren = '0';
    }
    this.loadData();
  }
}
