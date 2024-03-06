import { Component, ViewChild } from '@angular/core';
import { ActionSheetController, NavController, Platform } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { ReportService } from 'src/app/services/report.service';
import { lib } from 'src/app/services/static/global-functions';
import { CustomService } from 'src/app/services/custom.service';

@Component({
  selector: 'app-finance-management',
  templateUrl: 'finance-management.page.html',
  styleUrls: ['finance-management.page.scss'],
})
export class FinanceManagementPage extends PageBase {
  isShowFeature = true;

  dataRatio = [];
  headerPnL = [];
  dataPnL = [];
  dataEBITDA = [];
  headerCashFlow = [];
  dataCashFlow = [];
  dataFullRatio = [];

  reportBranchList = [];
  colorList = [
    '#84ff00',
    '#772727',
    '#00ffae',
    '#ff4200',
    '#ffe400',
    '#2b9a00',
    '#ff00ae',
    '#c000ff',
    '#FF5733',
    '#5DADE2',
  ];

  pnlChart: any;
  @ViewChild('pnlCanvas') pnlCanvas;

  cashFlowChart: any;
  @ViewChild('cashFlowCanvas') cashFlowCanvas;

  constructor(
    private pageService: CustomService,
    public actionSheetController: ActionSheetController,
    public env: EnvService,
    public navCtrl: NavController,
    private platform: Platform,
    public rpt: ReportService,
  ) {
    super();

    let template = {
      ShowBtn: false,
      IsHidden: false,
      IsHiddenDetailColumn: true,
    };
    this.reportBranchList = this.env.branchList.filter((b) => b.Type == 'Company');
    for (let index = 0; index < this.reportBranchList.length; index++) {
      let val = this.reportBranchList[index];
      Object.assign(val, template);
      val.Color = this.colorList[index];
    }
  }

  loadData() {
    this.preBuildPnLTree();
    this.preBuildCFTree();
  }

  refresh() {
    super.preLoadData(null);
  }

  preBuildCFTree() {
    let treeState = this.dataCashFlow;
    let treeItems = [];
    let listItems = [];
    return new Promise((resolve) => {
      this.pageService
        .getSAP_RPT_ManagementCashFlow(
          this.rpt.rptGlobal.query.fromDate,
          this.rpt.rptGlobal.query.toDate,
          this.rpt.rptGlobal.query.frequency,
          this.rpt.rptGlobal.query.branch,
          2,
        )
        .toPromise()
        .then((resp: any) => {
          this.headerCashFlow = [];

          if (resp.length) {
            for (let i = 0; i < resp.length; i++) {
              const it = resp[i];
              it.Id = it.ID;
            }

            for (var key in resp[0]) {
              this.headerCashFlow.push(key);
            }

            let removePros = [
              'IDParent',
              'IDBranch',
              'Id',
              'ID',
              'Code',
              'Name',
              'ForeignName',
              'Remark',
              'ForeignRemark',
              'Sort',
              'IsDisabled',
              'IsDeleted',
              'CreatedBy',
              'ModifiedBy',
              'CreatedDate',
              'ModifiedDate',
              'IsRevenue',
              'Type',
              'IsDividedByWeeks',
              'IDAccount',
              'AccountCode',
              'CostCenter',
              'IDBranch1',
              'DistributionRule',
              'CashFlowID',
              'RefCFWId',
            ];
            this.headerCashFlow = this.headerCashFlow.filter((d) => removePros.findIndex((i) => i == d) == -1);

            this.headerCashFlow = this.headerCashFlow.map((h) => {
              let branch = this.reportBranchList.find((f) => {
                return h.indexOf(f.Code) == 0 || h.indexOf('TOTAL-' + f.Code) == 0;
              });
              return {
                Name: h,
                Branch: branch,
                IsTotal: h.indexOf('TOTAL-') == 0,
                IsAll: h.indexOf('INGROUP') == 0,
              };
            });

            console.log(this.headerCashFlow);
          }

          let flatHeader = this.headerCashFlow.map((e) => e.Name);
          listItems = resp;
          listItems.sort((a, b) => (a.Sort > b.Sort ? 1 : b.Sort > a.Sort ? -1 : 0));
          treeItems = [];
          this.buildTree(listItems, treeItems, null, flatHeader);

          //load saved state
          let currentParent = null;
          treeItems.forEach((i) => {
            currentParent = treeItems.find((d) => d.Id == i.IDParent);

            let f = treeState.find((d) => d.Id == i.Id);
            if (f) {
              i.show = !currentParent ? true : currentParent.showdetail && f.show ? true : false;
              i.showdetail = f.showdetail ? true : false;
            } else {
              i.show = !currentParent ? true : currentParent.showdetail;
              i.showdetail = false;
            }
          });

          //resolve(true);

          let needCalcItems = treeItems.filter((i) => {
            return i.Code ? i.Code.indexOf('=') > -1 : false;
          });

          flatHeader.forEach((h) => {
            needCalcItems.forEach((c) => {
              let fomular = c.Code.split('=')[1];
              let groups = fomular.match(/(\([0-9]+\))/g);
              groups.forEach((g) => {
                fomular = fomular
                  .split(g)
                  .join('treeItems.find(i=> i.Code && i.Code.indexOf("' + g + '")==0)["' + h + '"]');
              });

              try {
                c[h] = eval(fomular);
              } catch (error) {
                debugger;
              }
            });
          });

          treeItems.forEach((i) => {
            i.HasChild = resp.findIndex((d) => d.IDParent == i.Id) > -1;
            flatHeader.forEach((h) => {
              if (i[h]) {
                i[h] = lib.formatMoney(i[h], 0, '', ',');
              } else {
                i[h] = 0;
              }
            });
          });

          this.dataCashFlow = treeItems;
          console.log(this.dataCashFlow);
        })
        .catch((err) => {
          console.log();
        });
    });
  }

  preBuildPnLTree() {
    let treeState = this.dataPnL;
    let treeItems = [];
    let listItems = [];
    return new Promise((resolve) => {
      this.pageService
        .getSAP_RPT_ManagementPnL(
          this.rpt.rptGlobal.query.fromDate,
          this.rpt.rptGlobal.query.toDate,
          this.rpt.rptGlobal.query.frequency,
          this.rpt.rptGlobal.query.branch,
          1,
        )
        .toPromise()
        .then((resp: any) => {
          this.headerPnL = [];

          if (resp.length) {
            for (let i = 0; i < resp.length; i++) {
              const it = resp[i];
              it.Id = it.ID;
            }

            for (var key in resp[0]) {
              this.headerPnL.push(key);
            }
            let removePros = [
              'IDParent',
              'IDBranch',
              'Id',
              'ID',
              'Code',
              'Name',
              'ForeignName',
              'Remark',
              'ForeignRemark',
              'Sort',
              'IsDisabled',
              'IsDeleted',
              'CreatedBy',
              'ModifiedBy',
              'CreatedDate',
              'ModifiedDate',
              'IsRevenue',
              'Type',
              'IsDividedByWeeks',
              'IDAccount',
              'AccountCode',
              'CostCenter',
              'IDBranch1',
              'DistributionRule',
            ];
            this.headerPnL = this.headerPnL.filter((d) => removePros.findIndex((i) => i == d) == -1);

            this.headerPnL = this.headerPnL.map((h) => {
              let branch = this.reportBranchList.find((f) => {
                return h.indexOf(f.Code) == 0 || h.indexOf('TOTAL-' + f.Code) == 0;
              });
              return {
                Name: h,
                Branch: branch,
                IsTotal: h.indexOf('TOTAL-') == 0,
                IsAll: h.indexOf('INGROUP') == 0,
              };
            });
            console.log('header PnL');
            console.log(this.headerPnL);
          }

          let flatHeaderPnL = this.headerPnL.map((e) => e.Name);
          listItems = resp;
          listItems.sort((a, b) => (a.Sort > b.Sort ? 1 : b.Sort > a.Sort ? -1 : 0));
          treeItems = [];
          this.buildTree(listItems, treeItems, null, flatHeaderPnL);

          //load saved state
          let currentParent = null;
          treeItems.forEach((i) => {
            currentParent = treeItems.find((d) => d.Id == i.IDParent);

            let f = treeState.find((d) => d.Id == i.Id);
            if (f) {
              i.show = !currentParent ? true : currentParent.showdetail && f.show ? true : false;
              i.showdetail = f.showdetail ? true : false;
            } else {
              i.show = !currentParent ? true : currentParent.showdetail;
              i.showdetail = false;
            }
          });

          //resolve(true);

          let r1 = {
            Name: 'Tăng trưởng doanh thu',
            ForeignName: 'Revenue Growth',
            Code: null,
          };
          let r2 = {
            Name: 'Tỷ lệ biến phí',
            ForeignName: 'Variable Cost',
            Code: '(201)= Math.floor((2)/(1)*100) + "%"',
          };
          let r3 = {
            Name: 'Biên lợi nhuận gộp',
            ForeignName: 'Gross Margin',
            Code: '(202)= Math.floor((3)/(1)*100) + "%"',
          };
          let r4 = {
            Name: 'Biên lợi nhuận hoạt động',
            ForeignName: 'Operating Margin',
            Code: '(203)= Math.floor((5)/(1)*100) + "%"',
          };
          let r5 = {
            Name: 'Biên lợi nhuận trước lãi vay, thuế và khấu hao',
            ForeignName: 'EBITDA Margin',
            Code: '(204)= Math.floor((6)/(1)*100) + "%"',
          };
          let r6 = {
            Name: 'Biên lợi nhuận sau thuế',
            ForeignName: 'EAT Margin',
            Code: '(205)= Math.floor((10)/(1)*100) + "%"',
          };

          this.dataRatio = [];
          this.dataRatio.push(r1, r2, r3, r4, r5, r6);

          let needCalcItems = treeItems.filter((i) => {
            return i.Code ? i.Code.indexOf('=') > -1 : false;
          });
          needCalcItems.push(r2, r3, r4, r5, r6);

          flatHeaderPnL.forEach((h) => {
            needCalcItems.forEach((c) => {
              let fomular = c.Code.split('=')[1];
              let groups = fomular.match(/(\([0-9]+\))/g);
              groups.forEach((g) => {
                fomular = fomular
                  .split(g)
                  .join('treeItems.find(i=> i.Code && i.Code.indexOf("' + g + '")==0)["' + h + '"]');
              });

              try {
                c[h] = eval(fomular);
              } catch (error) {
                debugger;
              }
            });
          });

          treeItems.forEach((i) => {
            i.HasChild = resp.findIndex((d) => d.IDParent == i.Id) > -1;
            flatHeaderPnL.forEach((h) => {
              if (i[h]) {
                i[h] = lib.formatMoney(i[h], 0, '', ',');
              } else {
                i[h] = 0;
              }
            });
          });

          this.dataPnL = treeItems;
          console.log(this.dataPnL);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  buildTree(listItem, treeItems, item, hierarchicalSumCols = []) {
    let idp = item == null ? null : item.Id;
    let childrent = listItem.filter((d) => d.IDParent == idp);
    let level = item && item.level >= 0 ? item.level + 1 : 1;

    if (item) {
      item.count = childrent.length;
    }

    let index = treeItems.findIndex((d) => d.Id == idp);
    treeItems.splice(index + 1, 0, ...childrent);

    childrent.forEach((i) => {
      i.levels = Array(level).fill('');
      i.level = level;
      i.show = item == null ? true : false;
      i.showdetail = false;

      this.buildTree(listItem, treeItems, i, hierarchicalSumCols);

      if (item) {
        hierarchicalSumCols.forEach((col) => {
          if (!i[col]) {
            i[col] = 0;
          }
          // if(!item.IsRevenue){
          //     i[col] = i[col] * -1;
          // }
          item[col] += i[col];
        });
      }
    });
  }

  toggleRow(ls, ite, toogle = false) {
    if (ite && ite.showdetail && toogle) {
      //hide
      ite.showdetail = false;
      this.showHideAllNestedFolder(ls, ite.Id, false, ite.showdetail);
    } else if (ite && !ite.showdetail && toogle) {
      //show loaded
      ite.showdetail = true;
      this.showHideAllNestedFolder(ls, ite.Id, true, ite.showdetail);
    }
  }

  showHideAllNestedFolder(ls, Id, isShow, showDetail) {
    ls.filter((d) => d.IDParent == Id).forEach((i) => {
      if (!isShow || showDetail) {
        i.show = isShow;
      }
      this.showHideAllNestedFolder(ls, i.Id, isShow, i.showdetail);
    });
  }

  loadedData() {
    super.loadedData();
    // this.buildPnLChart();
    // this.buildCashFlowChart();
  }

  // buildPnLChart() {
  //     let ctx = this.pnlCanvas.nativeElement;
  //     //ctx.height = 255;
  //     var width = ctx.width;
  //     var height = ctx.height;
  //     ctx = ctx.getContext("2d");

  //     var data = {
  //         labels: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
  //         datasets: []
  //     };

  //     //Lines Gross profit
  //     this.rpt.rptGlobal.branch.forEach(b => {
  //         data.datasets.push({
  //             hidden: b.IsHidden,
  //             IDBranch: b.Id,
  //             type: 'line',
  //             showLine: true,
  //             fill: false,
  //             label: b.Name + ' - Gross profit',
  //             borderColor: b.Color + '77',
  //             backgroundColor: b.Color + '77',
  //             hoverBackgroundColor: b.Color + 'CC',
  //             data: [this.rpt.randomScalingFactor(), this.rpt.randomScalingFactor(), this.rpt.randomScalingFactor(), this.rpt.randomScalingFactor(), this.rpt.randomScalingFactor(), this.rpt.randomScalingFactor(), this.rpt.randomScalingFactor()]
  //         });
  //     });

  //     for (let i = 0; i < data.datasets[0].data.length; i++) {
  //         data.datasets[0].data[i] = 0;
  //         for (let j = 1; j < data.datasets.length; j++) {
  //             const ds = data.datasets[j];
  //             data.datasets[0].data[i] += ds.data[i];
  //         }
  //     }

  //     //stack Revenue
  //     this.rpt.rptGlobal.branch.forEach(b => {
  //         data.datasets.push({
  //             hidden: b.IsHidden,
  //             IDBranch: b.Id,
  //             // type: 'bar',
  //             stack: b.Name + 'Revenue',
  //             label: b.Name + ' - Revenue',
  //             fill: true,
  //             borderWidth: 2,
  //             borderColor: b.Color,
  //             backgroundColor: this.rpt.createVerticalGradientStroke(ctx, height * 3, '#37d16a'), //'#37d16a',
  //             hoverBackgroundColor: b.Color,
  //             data: [
  //                 this.rpt.randomScalingFactor(60, 100), this.rpt.randomScalingFactor(20, 30),
  //                 this.rpt.randomScalingFactor(40, 70), this.rpt.randomScalingFactor(50, 80),
  //                 this.rpt.randomScalingFactor(40, 80), this.rpt.randomScalingFactor(60, 90),
  //                 this.rpt.randomScalingFactor(60, 100)]
  //         });
  //     });

  //     for (let i = 0; i < data.datasets[4].data.length; i++) {
  //         data.datasets[4].data[i] = 0;
  //         for (let j = 5; j < data.datasets.length; j++) {
  //             const ds = data.datasets[j];
  //             data.datasets[4].data[i] += ds.data[i];
  //         }
  //     }

  //     //stack COGS - Fixed cost
  //     this.rpt.rptGlobal.branch.forEach(b => {
  //         data.datasets.push({
  //             hidden: b.IsHidden,
  //             IDBranch: b.Id,
  //             // type: 'bar',
  //             stack: b.Name + 'COGS',
  //             label: b.Name + ' - Fixed cost',
  //             fill: true,
  //             borderWidth: 2,
  //             borderColor: b.Color,
  //             backgroundColor: this.rpt.createVerticalGradientStroke(ctx, height * 9, '#ffce00'),
  //             hoverBackgroundColor: b.Color,
  //             data: [
  //                 this.rpt.randomScalingFactor(0, 10), this.rpt.randomScalingFactor(0, 10),
  //                 this.rpt.randomScalingFactor(0, 10), this.rpt.randomScalingFactor(0, 10),
  //                 this.rpt.randomScalingFactor(0, 10), this.rpt.randomScalingFactor(0, 10),
  //                 this.rpt.randomScalingFactor(0, 10)]
  //         });
  //     });

  //     for (let i = 0; i < data.datasets[8].data.length; i++) {
  //         data.datasets[8].data[i] = 0;
  //         for (let j = 9; j < data.datasets.length; j++) {
  //             const ds = data.datasets[j];
  //             data.datasets[8].data[i] += ds.data[i];
  //         }
  //     }

  //     //stack COGS - Variable cost
  //     this.rpt.rptGlobal.branch.forEach(b => {
  //         data.datasets.push({
  //             hidden: b.IsHidden,
  //             IDBranch: b.Id,
  //             // type: 'bar',
  //             stack: b.Name + 'COGS',
  //             label: b.Name + ' - Variable cost',
  //             fill: true,
  //             borderWidth: 2,
  //             borderColor: b.Color,
  //             backgroundColor: this.rpt.createVerticalGradientStroke(ctx, height * 9, '#de4848'),
  //             hoverBackgroundColor: b.Color,
  //             data: [
  //                 this.rpt.randomScalingFactor(0, 30), this.rpt.randomScalingFactor(0, 30),
  //                 this.rpt.randomScalingFactor(0, 30), this.rpt.randomScalingFactor(0, 30),
  //                 this.rpt.randomScalingFactor(0, 30), this.rpt.randomScalingFactor(0, 30),
  //                 this.rpt.randomScalingFactor(0, 30)]

  //         });
  //     });

  //     for (let i = 0; i < data.datasets[12].data.length; i++) {
  //         data.datasets[12].data[i] = 0;
  //         for (let j = 13; j < data.datasets.length; j++) {
  //             const ds = data.datasets[j];
  //             data.datasets[12].data[i] += ds.data[i];
  //         }
  //     }

  //     //Gross profit CALC

  //     for (let j = 0; j < data.labels.length; j++) {

  //         //Gross profit             //Revenue                  //Fixed cost                //Variable cost
  //         data.datasets[0].data[j] = data.datasets[4].data[j] - data.datasets[8].data[j] - data.datasets[12].data[j]; //All
  //         data.datasets[1].data[j] = data.datasets[5].data[j] - data.datasets[9].data[j] - data.datasets[13].data[j]; //GEM
  //         data.datasets[2].data[j] = data.datasets[6].data[j] - data.datasets[10].data[j] - data.datasets[14].data[j]; //WP
  //         data.datasets[3].data[j] = data.datasets[7].data[j] - data.datasets[11].data[j] - data.datasets[15].data[j]; //PVD

  //     }

  //     this.pnlChart = new Chart(ctx, {
  //         type: 'bar',
  //         options: {
  //             maintainAspectRatio: false,
  //             responsive: true,

  //             layout: {
  //                 padding: {
  //                     top: 20,
  //                 }
  //             },
  //             legend: {
  //                 display: true,
  //                 labels: {
  //                     // fontColor: '#FFF',
  //                     usePointStyle: true,
  //                     boxWidth: 8,

  //                 }
  //             },
  //             tooltips: {
  //                 mode: 'index',
  //                 intersect: false,
  //                 backgroundColor: 'rgba(0, 0, 0, 0.5)',
  //             },
  //             hover: {
  //                 mode: 'index',
  //                 intersect: false
  //             },
  //             elements: {
  //                 point: {
  //                     radius: 0,
  //                     hoverRadius: 4,
  //                     backgroundColor: ()=>lib.getCssVariableValue('--ion-color-primary') + 'e6',
  //                     borderWidth: 1,
  //                     hoverBorderWidth: 2
  //                 },
  //                 line: {
  //                     borderWidth: 3
  //                 }
  //             },
  //             scales: {
  //                 yAxes: [
  //                     {
  //                         ticks: {
  //                             fontColor: ()=>lib.getCssVariableValue('--ion-color-primary'),
  //                             fontSize: 12,
  //                             maxTicksLimit: 8,
  //                             padding: 20
  //                         },
  //                         gridLines: {
  //                             color: ()=>lib.getCssVariableValue('--ion-color-primary') + '80',
  //                             display: true,
  //                             drawTicks: false,
  //                             drawBorder: false,
  //                             zeroLineColor: ()=>lib.getCssVariableValue('--ion-color-primary') + 'e6',
  //                         }
  //                     }
  //                 ],
  //                 xAxes: [
  //                     {
  //                         ticks: {
  //                             fontColor: ()=>lib.getCssVariableValue('--ion-color-primary'),
  //                             fontSize: 10,
  //                             //maxTicksLimit: 7,
  //                             padding: 15
  //                         },
  //                         gridLines: {

  //                             display: false,
  //                             drawTicks: false,
  //                             drawBorder: false,
  //                         }
  //                     }
  //                 ]
  //             },
  //             plugins: {
  //                 labels: {
  //                     render: () => { },
  //                     fontSize: 12,

  //                 },
  //             },
  //         },
  //         data: data,
  //     });
  // }

  // buildCashFlowChart() {
  //     let ctx = this.cashFlowCanvas.nativeElement;
  //     //ctx.height = 255;
  //     var width = ctx.width;
  //     var height = ctx.height;
  //     ctx = ctx.getContext("2d");

  //     var data = {
  //         labels: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
  //         datasets: []
  //     };

  //     //Lines Operating Ratio
  //     this.rpt.rptGlobal.branch.forEach(b => {
  //         data.datasets.push({
  //             yAxisID: 'y-axis-2',
  //             hidden: b.IsHidden,
  //             IDBranch: b.Id,
  //             type: 'line',
  //             showLine: true,
  //             fill: false,
  //             label: b.Name + ' Operating Ratio',
  //             borderColor: b.Color + '77',
  //             backgroundColor: b.Color + '77',
  //             hoverBackgroundColor: b.Color + 'CC',
  //             data: [0, 0, 0, 0, 0, 0, 0]
  //         });
  //     });

  //     //stack NetSale
  //     this.rpt.rptGlobal.branch.forEach(b => {
  //         data.datasets.push({
  //             hidden: true,
  //             IDBranch: b.Id,
  //             // type: 'bar',
  //             stack: b.Name + 'NetSale',
  //             label: b.Name + ' Net sale',
  //             fill: true,
  //             borderWidth: 2,
  //             borderColor: b.Color,
  //             backgroundColor: this.rpt.createVerticalGradientStroke(ctx, height * 3, '#37d16a'), //'#37d16a',
  //             hoverBackgroundColor: b.Color,
  //             data: [
  //                 this.rpt.randomScalingFactor(60, 100) * 10000000, this.rpt.randomScalingFactor(20, 30) * 10000000,
  //                 this.rpt.randomScalingFactor(40, 70) * 10000000, this.rpt.randomScalingFactor(50, 80) * 10000000,
  //                 this.rpt.randomScalingFactor(40, 80) * 10000000, this.rpt.randomScalingFactor(60, 90) * 10000000,
  //                 this.rpt.randomScalingFactor(60, 100) * 10000000]
  //         });
  //     });

  //     for (let i = 0; i < data.datasets[4].data.length; i++) {
  //         data.datasets[4].data[i] = 0;
  //         for (let j = 5; j < data.datasets.length; j++) {
  //             const ds = data.datasets[j];
  //             data.datasets[4].data[i] += ds.data[i];
  //         }
  //     }

  //     //stack Salary
  //     this.rpt.rptGlobal.branch.forEach(b => {
  //         data.datasets.push({
  //             hidden: b.IsHidden,
  //             IDBranch: b.Id,
  //             // type: 'bar',
  //             stack: b.Name + 'Salary',
  //             label: b.Name + ' Salary',
  //             fill: true,
  //             borderWidth: 2,
  //             borderColor: b.Color,
  //             backgroundColor: this.rpt.createVerticalGradientStroke(ctx, height * 9, '#ffce00'),
  //             hoverBackgroundColor: b.Color,
  //             data: [
  //                 this.rpt.randomScalingFactor(20, 30) * 1000000, this.rpt.randomScalingFactor(20, 30) * 1000000,
  //                 this.rpt.randomScalingFactor(20, 30) * 1000000, this.rpt.randomScalingFactor(20, 30) * 1000000,
  //                 this.rpt.randomScalingFactor(20, 30) * 1000000, this.rpt.randomScalingFactor(20, 30) * 1000000,
  //                 this.rpt.randomScalingFactor(20, 30) * 1000000,]
  //         });
  //     });

  //     for (let i = 0; i < data.datasets[8].data.length; i++) {
  //         data.datasets[8].data[i] = 0;
  //         for (let j = 9; j < data.datasets.length; j++) {
  //             const ds = data.datasets[j];
  //             data.datasets[8].data[i] += ds.data[i];
  //         }
  //     }

  //     //stack Rental
  //     this.rpt.rptGlobal.branch.forEach(b => {
  //         data.datasets.push({
  //             hidden: b.IsHidden,
  //             IDBranch: b.Id,
  //             // type: 'bar',
  //             stack: b.Name + 'Rental',
  //             label: b.Name + ' Rental',
  //             fill: true,
  //             borderWidth: 2,
  //             borderColor: b.Color,
  //             backgroundColor: this.rpt.createVerticalGradientStroke(ctx, height * 9, '#37d16a'),
  //             hoverBackgroundColor: b.Color,
  //             data: [
  //                 this.rpt.randomScalingFactor(20, 30) * 1000000, this.rpt.randomScalingFactor(20, 30) * 1000000,
  //                 this.rpt.randomScalingFactor(20, 30) * 1000000, this.rpt.randomScalingFactor(20, 30) * 1000000,
  //                 this.rpt.randomScalingFactor(20, 30) * 1000000, this.rpt.randomScalingFactor(20, 30) * 1000000,
  //                 this.rpt.randomScalingFactor(20, 30) * 1000000,]
  //         });
  //     });

  //     for (let i = 0; i < data.datasets[12].data.length; i++) {
  //         data.datasets[12].data[i] = 0;
  //         for (let j = 13; j < data.datasets.length; j++) {
  //             const ds = data.datasets[j];
  //             data.datasets[12].data[i] += ds.data[i];
  //         }
  //     }

  //     //stack Depreciation
  //     this.rpt.rptGlobal.branch.forEach(b => {
  //         data.datasets.push({
  //             hidden: b.IsHidden,
  //             IDBranch: b.Id,
  //             // type: 'bar',
  //             stack: b.Name + 'Depreciation',
  //             label: b.Name + ' Depreciation',
  //             fill: true,
  //             borderWidth: 2,
  //             borderColor: b.Color,
  //             backgroundColor: this.rpt.createVerticalGradientStroke(ctx, height * 9, '#4267b2'),
  //             hoverBackgroundColor: b.Color,
  //             data: [
  //                 this.rpt.randomScalingFactor(2, 3) * 1000000, this.rpt.randomScalingFactor(2, 3) * 1000000,
  //                 this.rpt.randomScalingFactor(2, 3) * 1000000, this.rpt.randomScalingFactor(2, 3) * 1000000,
  //                 this.rpt.randomScalingFactor(2, 3) * 1000000, this.rpt.randomScalingFactor(2, 3) * 1000000,
  //                 this.rpt.randomScalingFactor(2, 3) * 1000000,]
  //         });
  //     });

  //     for (let i = 0; i < data.datasets[16].data.length; i++) {
  //         data.datasets[16].data[i] = 0;
  //         for (let j = 17; j < data.datasets.length; j++) {
  //             const ds = data.datasets[j];
  //             data.datasets[16].data[i] += ds.data[i];
  //         }
  //     }

  //     //stack Others
  //     this.rpt.rptGlobal.branch.forEach(b => {
  //         data.datasets.push({
  //             hidden: b.IsHidden,
  //             IDBranch: b.Id,
  //             // type: 'bar',
  //             stack: b.Name + 'Others',
  //             label: b.Name + ' Others',
  //             fill: true,
  //             borderWidth: 2,
  //             borderColor: b.Color,
  //             backgroundColor: this.rpt.createVerticalGradientStroke(ctx, height * 9, '#f15a24'),
  //             hoverBackgroundColor: b.Color,
  //             data: [
  //                 this.rpt.randomScalingFactor(30, 50) * 1000000, this.rpt.randomScalingFactor(30, 50) * 1000000,
  //                 this.rpt.randomScalingFactor(30, 50) * 1000000, this.rpt.randomScalingFactor(30, 50) * 1000000,
  //                 this.rpt.randomScalingFactor(30, 50) * 1000000, this.rpt.randomScalingFactor(30, 50) * 1000000,
  //                 this.rpt.randomScalingFactor(30, 50) * 1000000,]
  //         });
  //     });

  //     for (let i = 0; i < data.datasets[20].data.length; i++) {
  //         data.datasets[20].data[i] = 0;
  //         for (let j = 21; j < data.datasets.length; j++) {
  //             const ds = data.datasets[j];
  //             data.datasets[20].data[i] += ds.data[i];
  //         }
  //     }

  //     //Cash balance CALC
  //     for (let j = 0; j < data.labels.length; j++) {

  //         //Gross profit                       //Out
  //         data.datasets[0].data[j] = (data.datasets[8].data[j] + data.datasets[12].data[j] + data.datasets[16].data[j] + data.datasets[20].data[j]) / data.datasets[4].data[j] * 100; //All
  //         data.datasets[1].data[j] = (data.datasets[9].data[j] + data.datasets[13].data[j] + data.datasets[17].data[j] + data.datasets[21].data[j]) / data.datasets[5].data[j] * 100; //GEM
  //         data.datasets[2].data[j] = (data.datasets[10].data[j] + data.datasets[14].data[j] + data.datasets[18].data[j] + data.datasets[22].data[j]) / data.datasets[6].data[j] * 100; //WP
  //         data.datasets[3].data[j] = (data.datasets[11].data[j] + data.datasets[15].data[j] + data.datasets[19].data[j] + data.datasets[23].data[j]) / data.datasets[7].data[j] * 100; //PVD

  //     }

  //     this.cashFlowChart = new Chart(ctx, {
  //         type: 'bar',
  //         options: {
  //             maintainAspectRatio: false,
  //             responsive: true,

  //             layout: {
  //                 padding: {
  //                     top: 20,
  //                 }
  //             },
  //             legend: {
  //                 display: true,
  //                 labels: {

  //                     usePointStyle: true,
  //                     boxWidth: 8,

  //                 }
  //             },
  //             tooltips: {
  //                 mode: 'index',
  //                 intersect: false,
  //                 backgroundColor: 'rgba(0, 0, 0, 0.5)',
  //             },
  //             hover: {
  //                 mode: 'index',
  //                 intersect: false
  //             },
  //             elements: {
  //                 point: {
  //                     radius: 0,
  //                     hoverRadius: 4,
  //                     backgroundColor: ()=>lib.getCssVariableValue('--ion-color-primary') + 'e6',
  //                     borderWidth: 1,
  //                     hoverBorderWidth: 2
  //                 },
  //                 line: {
  //                     borderWidth: 3
  //                 }
  //             },
  //             scales: {
  //                 yAxes: [
  //                     {
  //                         ticks: {
  //                             fontColor: ()=>lib.getCssVariableValue('--ion-color-primary'),
  //                             fontSize: 12,
  //                             maxTicksLimit: 8,
  //                             padding: 20,
  //                         },
  //                         gridLines: {
  //                             color: ()=>lib.getCssVariableValue('--ion-color-primary') + '80',
  //                             display: true,
  //                             drawTicks: false,
  //                             drawBorder: false,
  //                             zeroLineColor: ()=>lib.getCssVariableValue('--ion-color-primary') + 'e6',
  //                         }
  //                     },
  //                     {
  //                         type: 'linear',
  //                         display: true,
  //                         position: 'right',
  //                         id: 'y-axis-2',
  //                         ticks: {
  //                             fontColor: ()=>lib.getCssVariableValue('--ion-color-primary'),
  //                             fontSize: 12,
  //                             maxTicksLimit: 8,
  //                             padding: 20,
  //                         },
  //                         gridLines: {
  //                             color: ()=>lib.getCssVariableValue('--ion-color-primary') + '80',
  //                             display: false,
  //                             drawTicks: false,
  //                             drawBorder: false,
  //                             zeroLineColor: ()=>lib.getCssVariableValue('--ion-color-primary') + 'e6',
  //                         }
  //                     }
  //                 ],

  //                 xAxes: [
  //                     {
  //                         ticks: {
  //                             fontColor: ()=>lib.getCssVariableValue('--ion-color-primary'),
  //                             fontSize: 10,
  //                             //maxTicksLimit: 7,
  //                             padding: 15
  //                         },
  //                         gridLines: {

  //                             display: false,
  //                             drawTicks: false,
  //                             drawBorder: false,
  //                         }
  //                     }
  //                 ]
  //             },
  //             plugins: {
  //                 labels: {
  //                     render: () => { },
  //                     fontSize: 12,

  //                 },
  //             },
  //         },
  //         data: data,
  //     });
  // }

  changeDateFillter(type) {
    this.rpt
      .dateQuery(type)
      .then((_) => {
        this.loadData();
      })
      .catch((err) => {
        let a = err;
      });
  }

  changeFrequency(f) {
    this.rpt.rptGlobal.query.frequency = f.Id;
    this.loadData();
  }

  toogleBranchDataset(b) {
    b.IsHidden = !b.IsHidden;

    this.loadData();
  }

  randomScalingFactor(min = 30, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  createHorizontalGradientStroke(ctx, width, color) {
    var gradientStroke = ctx.createLinearGradient(width, 0, 0, 0);
    gradientStroke.addColorStop(0, color + 'FF');
    gradientStroke.addColorStop(0.9, color + '00');
    gradientStroke.addColorStop(1, color + '00');
    return gradientStroke;
  }

  createVerticalGradientStroke(ctx, height, color) {
    var gradientStroke = ctx.createLinearGradient(0, 0, 0, height);
    gradientStroke.addColorStop(0, color + 'FF');
    gradientStroke.addColorStop(0.9, color + '00');
    gradientStroke.addColorStop(1, color + '00');
    return gradientStroke;
  }
}
