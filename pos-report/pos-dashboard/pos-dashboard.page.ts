import { CommonService } from 'src/app/services/core/common.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { ReportService } from 'src/app/services/report.service';
import { lib } from 'src/app/services/static/global-functions';

@Component({
  selector: 'app-pos-dashboard',
  templateUrl: './pos-dashboard.page.html',
  styleUrls: ['./pos-dashboard.page.scss'],
})
export class PosDashboardPage extends PageBase {
  labelLineChart;
  dataLineChart;
  titleLineChart;
  typeLineChart;
  piedataRevenue;
  piedataReceipts;
  piedataCustomers;
  reportQuery;
  targetList = 0;
  totalRevenue = 0;
  totalReceipts = 0;
  totalCustomers = 0;
  totalRevenueText;
  totalReceiptsText;
  totalCustomersText;
  reportBranchList = [];
  mockdata = {
    targetList: [{ revernue: 5000000 }, { receipt: 2000 }, { customer: 1444 }],
    data: [
      { revernue: 220, receipt: 150, customer: 150 },
      { revernue: 182, receipt: 230, customer: 232 },
      { revernue: 191, receipt: 224, customer: 201 },
      { revernue: 234, receipt: 218, customer: 154 },
      { revernue: 290, receipt: 135, customer: 190 },
      { revernue: 330, receipt: 147, customer: 330 },
      { revernue: 310, receipt: 260, customer: 410 },
    ],
  };

  constructor(
    public env: EnvService,
    public navCtrl: NavController,
    public rpt: ReportService,
    public commonService: CommonService,
  ) {
    super();
    this.reportBranchList = this.env.branchList.filter((b) => b.Type == 'Company');
  }

  loadedData(event?: any): void {
    let report = 'Dashboard'; // Change here ( Product, Dashboard, Day, Receipt)
    let groupby;
    // this.segmentView = report;
    if (this.rpt.rptGlobal.query.frequency == 0) {
      groupby = 'Hour';
    }
    if (this.rpt.rptGlobal.query.frequency == 1) {
      groupby = 'Day';
    } else if (this.rpt.rptGlobal.query.frequency == 2) {
      groupby = 'Month';
    } else if (this.rpt.rptGlobal.query.frequency == 3) {
      groupby = 'Quarter';
    } else if (this.rpt.rptGlobal.query.frequency == 4) {
      groupby = 'Year';
    }
    this.reportQuery = {
      fromDate: this.rpt.rptGlobal.query.fromDate,
      toDate: this.rpt.rptGlobal.query.toDate,
      IDBranch: this.env.selectedBranchAndChildren,
      GroupBy: groupby, // Hour / Day / Month / Year
    };

    let apiPath = {
      method: 'GET',
      url: function () {
        return ApiSetting.apiDomain('POS/Report/Dashboard');
      },
    };

    Promise.all([this.commonService.connect(apiPath.method, apiPath.url(), this.reportQuery).toPromise()]).then(
      (values) => {
        this.items = values[0];
        this.items.forEach((i) => {
          i.Revenue = Math.round(i.Revenue);
          i.RevenueText = lib.currencyFormat(i.Revenue);
          i.Day = new Date(i.Date).getDate();
          i.Month = new Date(i.Date).getMonth() + 1;
          // i.Quarter = new Date(i.Date).getMonth() + 1;
          i.Year = new Date(i.Date).getFullYear();
        });

        this.totalRevenue = this.items.map((x) => x.Revenue).reduce((a, b) => +a + +b, 0);
        this.totalReceipts = this.items.map((x) => x.Receipts).reduce((a, b) => +a + +b, 0);
        this.totalCustomers = this.items.map((x) => x.Customers).reduce((a, b) => +a + +b, 0);
        this.totalCustomersText = lib.formatMoney(this.totalCustomers, 0, ',', '.');
        this.totalReceiptsText = lib.formatMoney(this.totalReceipts, 0, ',', '.');
        this.totalRevenueText = lib.currencyFormat(this.totalRevenue);

        this.buildCharts();

        super.loadedData(event);
      },
    );
  }

  changeFrequency(f) {
    this.rpt.rptGlobal.query.frequency = f.Id;
    this.changeDateFilter('setdone');
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

  buildCharts() {
    var dataLineChart = [];
    this.rpt.timeGroups.forEach((e) => {
      if (this.rpt.rptGlobal.query.frequency == 0) {
        let Data = this.items.filter((f) => f.GroupBy == e.Hour)[0]?.Revenue;
        dataLineChart.push(Data);
      } else if (this.rpt.rptGlobal.query.frequency == 1) {
        let Data = this.items.filter((f) => f.GroupBy == e.Day && f.Month == e.Month && f.Year == e.Year)[0]?.Revenue;
        dataLineChart.push(Data);
      } else if (this.rpt.rptGlobal.query.frequency == 2) {
        let Data = this.items.filter((f) => f.GroupBy == e.Month && f.Year == e.Year)[0]?.Revenue;
        dataLineChart.push(Data);
      } else if (this.rpt.rptGlobal.query.frequency == 3) {
        let Data = this.items.filter((f) => f.GroupBy == e.Quarter && f.Year == e.Year)[0]?.Revenue;
        dataLineChart.push(Data);
      } else if (this.rpt.rptGlobal.query.frequency == 4) {
        let Data = this.items.filter((f) => f.GroupBy == e.Year)[0]?.Revenue;
        dataLineChart.push(Data);
      }
    });
    (this.labelLineChart = this.rpt.timeGroups.map((m) => m.Label)),
      (this.dataLineChart = [
        {
          name: 'Revenue',
          data: dataLineChart,
        },
      ]);

    let title;
    if (this.rpt.rptGlobal.query.frequency == 0) {
      title = 'Hour';
    } else if (this.rpt.rptGlobal.query.frequency == 1) {
      title = 'Day';
    } else if (this.rpt.rptGlobal.query.frequency == 2) {
      title = 'Month';
    } else if (this.rpt.rptGlobal.query.frequency == 3) {
      title = 'Quarter';
    } else if (this.rpt.rptGlobal.query.frequency == 4) {
      title = 'Year';
    }

    this.titleLineChart = title;
    this.typeLineChart = 'BasicLine';

    this.piedataRevenue = this.calcPercent(this.totalRevenue, this.mockdata.targetList[0].revernue);

    this.piedataReceipts = this.calcPercent(this.totalReceipts, this.mockdata.targetList[1].receipt);

    this.piedataCustomers = this.calcPercent(this.totalCustomers, this.mockdata.targetList[2].customer);
  }

  calcPercent(rValue, tValue) {
    let present = ((rValue / tValue) * 100).toFixed(0);
    return present;
  }
}
