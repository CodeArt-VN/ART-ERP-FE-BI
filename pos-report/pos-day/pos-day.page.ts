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
  selector: 'app-pos-day',
  templateUrl: './pos-day.page.html',
  styleUrls: ['./pos-day.page.scss'],
})
export class PosDayPage extends PageBase {
  labelLineChart;
  typeLineChart;

  paymentItems;

  PaymentData = [];
  PaymentChartData = [];

  PaymentAmountData = [];
  PaymentAmountChartData = [];

  RevenueData = [];
  RevenueChartData = [];
  ReceiptsData = [];
  ReceiptsChartData = [];

  reportBranchList = [];

  paymentList = [];

  reportQuery: any = {};

  reportPaymentQuery;

  ChartType = 'Pie';

  ChartStyle = {
    width: 300,
    height: 300,
  };

  ChartStyle2 = {
    width: '100%',
    'min-height': '300px',
  };

  Chart1 = {
    Id: 'Payment',
    Title: 'Payment',
    Subtext: '',
    SeriesName: 'Quantity',

    Legend: false,
    // Data:  this.topSellingProduct,
    Type: 'Pie',
    Style: this.ChartStyle2,
  };

  Chart2 = {
    Id: 'PaymentAmount',
    Title: 'Payment Amount',
    Subtext: '',
    SeriesName: 'Total Revenue',

    Legend: false,
    // Data: this.ChartData,
    Type: 'Pie',
    Style: this.ChartStyle2,
  };

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

  preLoadData(event?: any): void {
    Promise.all([this.env.getType('PaymentType')]).then((results: any) => {
      this.paymentList = results[0];

      super.preLoadData(event);
    });
  }

  loadData(event): void {
    this.RevenueChartData = [];
    this.ReceiptsChartData = [];
    this.PaymentChartData = [];
    this.PaymentAmountChartData = [];
    super.loadData(event);
  }

  loadedData(event?: any): void {
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
      GroupBy: groupby, // Hour / Day / Week / Month / Year
      isCalcReceiptPayment: true,
    };

    let apiPath = {
      method: 'GET',
      url: function () {
        return ApiSetting.apiDomain('POS/Report/Day');
      },
    };

    Promise.all([this.commonService.connect(apiPath.method, apiPath.url(), this.reportQuery).toPromise()]).then(
      (values) => {
        this.items = values[0]['Data'];
        this.RevenueData = values[0]['Revenue'];
        this.ReceiptsData = values[0]['Receipts'];
        this.PaymentData = values[0]['PaymentMethods'];
        this.PaymentAmountData = values[0]['PaymentAmounts'];

        this.items.sort((a, b) => b.OrderedAmount - a.OrderedAmount);
        this.items = [...this.items];

        this.items.forEach((i) => {
          i.Revenue = Math.round(i.Revenue);
          i.RevenueText = lib.currencyFormat(i.Revenue);
          i.PaymentsText = lib.currencyFormat(i.Payments);
          i.TipsText = lib.currencyFormat(i.Tips);
          i.TaxText = lib.currencyFormat(i.Tax);
          i.DateText = lib.dateFormat(i.Date || i.StartsAt, 'yyyy/mm/dd');
          i.StartsAtText = lib.dateFormat(i.StartsAt, 'hh:MM');
          i.EndsAtText = lib.dateFormat(i.EndsAt, 'hh:MM');
          i.Day = new Date(i.Date).getDate();
          i.Month = new Date(i.Date).getMonth() + 1;
          // i.Quarter = new Date(i.Date).getMonth() + 1;
          i.Year = new Date(i.Date).getFullYear();
        });

        this.RevenueData.forEach((i) => {
          i.Revenue = Math.round(i.Revenue);
          i.Day = new Date(i.Date).getDate();
          i.Month = new Date(i.Date).getMonth() + 1;
          // i.Quarter = new Date(i.Date).getMonth() + 1;
          i.Year = new Date(i.Date).getFullYear();
        });

        this.ReceiptsData.forEach((i) => {
          i.Day = new Date(i.Date).getDate();
          i.Month = new Date(i.Date).getMonth() + 1;
          // i.Quarter = new Date(i.Date).getMonth() + 1;
          i.Year = new Date(i.Date).getFullYear();
        });

        this.PaymentData.forEach((i) => {
          i.PaymentName = this.paymentList.find((p) => p.Code == i.PaymentType)?.Name || 'Còn nợ';
        });

        this.PaymentAmountData.forEach((i) => {
          i.PaymentName = this.paymentList.find((p) => p.Code == i.PaymentType)?.Name || 'Còn nợ';
        });

        this.buildRevenueData();
        this.buildReceiptsData();
        this.buildPaymentData();
        this.buildPaymentAmountData();

        this.labelLineChart = this.rpt.timeGroups.map((m) => m.Label);
        this.typeLineChart = 'BasicLine';

        super.loadedData(event);
      },
    );
  }

  buildRevenueData() {
    this.RevenueData;

    var dataLineChart = [];
    this.rpt.timeGroups.forEach((e) => {
      if (this.rpt.rptGlobal.query.frequency == 0) {
        let Data = this.RevenueData.filter((f) => f.GroupBy == e.Hour)[0]?.Revenue;
        dataLineChart.push(Data);
      } else if (this.rpt.rptGlobal.query.frequency == 1) {
        let Data = this.RevenueData.filter((f) => f.GroupBy == e.Day && f.Month == e.Month && f.Year == e.Year)[0]
          ?.Revenue;
        dataLineChart.push(Data);
      } else if (this.rpt.rptGlobal.query.frequency == 2) {
        let Data = this.RevenueData.filter((f) => f.GroupBy == e.Month && f.Year == e.Year)[0]?.Revenue;
        dataLineChart.push(Data);
      } else if (this.rpt.rptGlobal.query.frequency == 3) {
        let Data = this.RevenueData.filter((f) => f.GroupBy == e.Quarter && f.Year == e.Year)[0]?.Revenue;
        dataLineChart.push(Data);
      } else if (this.rpt.rptGlobal.query.frequency == 4) {
        let Data = this.RevenueData.filter((f) => f.GroupBy == e.Year)[0]?.Revenue;
        dataLineChart.push(Data);
      }
    });
    (this.labelLineChart = this.rpt.timeGroups.map((m) => m.Label)),
      (this.RevenueChartData = [
        {
          name: 'Revenue',
          data: dataLineChart,
        },
      ]);
  }

  buildReceiptsData() {
    var dataLineChart = [];
    this.rpt.timeGroups.forEach((e) => {
      if (this.rpt.rptGlobal.query.frequency == 0) {
        let Data = this.ReceiptsData.filter((f) => f.GroupBy == e.Hour)[0]?.Receipts;
        dataLineChart.push(Data);
      } else if (this.rpt.rptGlobal.query.frequency == 1) {
        let Data = this.ReceiptsData.filter((f) => f.GroupBy == e.Day && f.Month == e.Month && f.Year == e.Year)[0]
          ?.Receipts;
        dataLineChart.push(Data);
      } else if (this.rpt.rptGlobal.query.frequency == 2) {
        let Data = this.ReceiptsData.filter((f) => f.GroupBy == e.Month && f.Year == e.Year)[0]?.Receipts;
        dataLineChart.push(Data);
      } else if (this.rpt.rptGlobal.query.frequency == 3) {
        let Data = this.ReceiptsData.filter((f) => f.GroupBy == e.Quarter && f.Year == e.Year)[0]?.Receipts;
        dataLineChart.push(Data);
      } else if (this.rpt.rptGlobal.query.frequency == 4) {
        let Data = this.ReceiptsData.filter((f) => f.GroupBy == e.Year)[0]?.Receipts;
        dataLineChart.push(Data);
      }
    });
    (this.labelLineChart = this.rpt.timeGroups.map((m) => m.Label)),
      (this.ReceiptsChartData = [
        {
          name: 'Receipts',
          data: dataLineChart,
        },
      ]);
  }

  buildPaymentData() {
    if (this.PaymentData) {
      this.PaymentChartData = this.PaymentData.map((i) => ({
        value: i.TotalQuantity,
        name: i.PaymentName,
      }));
    }
  }

  buildPaymentAmountData() {
    if (this.PaymentAmountData) {
      this.PaymentAmountChartData = this.PaymentAmountData.map((i) => ({
        value: i.TotalReceive,
        name: i.PaymentName,
      }));
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
    this.loadData(null);
  }
}
