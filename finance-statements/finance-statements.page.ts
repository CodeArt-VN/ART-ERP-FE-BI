import { Component, ViewChild } from '@angular/core';
import { ActionSheetController, NavController, Platform } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { ReportService } from 'src/app/services/report.service';
import { lib } from 'src/app/services/static/global-functions';
import { CustomService } from 'src/app/services/custom.service';

@Component({
  selector: 'app-finance-statements',
  templateUrl: 'finance-statements.page.html',
  styleUrls: ['finance-statements.page.scss'],
})
export class FinanceStatementsPage extends PageBase {
  isShowFeature = true;

  selectedBranchID = 22;
  pageBranch = this.rpt.rptGlobal.branch;

  revenue = 246859000000;

  rawBalanceSheet = [];

  dataBalanceSheet = [];

  rawIncomStatement = [];

  dataIncomeStatement = [];

  rawCashFlow = [];
  dataCashFlow = [];

  constructor(
    private pageService: CustomService,
    public actionSheetController: ActionSheetController,
    public env: EnvService,
    public navCtrl: NavController,
    private platform: Platform,
    public rpt: ReportService,
  ) {
    super();

    //initial branch filter
    //this.pageBranch.splice(0,1);
    this.pageBranch.forEach((element, index) => {
      if (index != 0) this.pageBranch[index].IsHidden = true;
    });

    this.selectedBranchID = this.pageBranch[0].Id;

    this.loadData();
  }

  refresh() {
    super.preLoadData(null);
  }

  loadData() {
    console.log(this.selectedBranchID);
    this.preBuildBSTree();
    this.preBuildIncomeTree();
    this.preBuildCFTree();
  }

  preBuildCFTree() {
    let treeState = this.dataCashFlow;
    let treeItems = [];
    let listItems = [];
    return new Promise((resolve) => {
      this.pageService
        .getSAP_RPT_StatementCashFlow(
          this.rpt.rptGlobal.query.fromDate,
          this.rpt.rptGlobal.query.toDate,
          this.selectedBranchID,
          13,
          this.rpt.rptGlobal.query.reportType,
        )
        .toPromise()
        .then((resp: any) => {
          listItems = resp;

          let flatHeader = ['EB', 'OB'];
          treeItems = [];
          try {
            this.buildTree(listItems, treeItems, null, flatHeader);
          } catch (error) {
            console.log(error);
            debugger;
          }
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

          let needCalcItems = treeItems.filter((i) => {
            return i.Name ? i.Name.indexOf('=') > -1 : false;
          });

          flatHeader.forEach((h) => {
            needCalcItems.forEach((c) => {
              let fomular = c.Name.split('=')[1];
              let groups = fomular.match(/([0-9]+)/g);
              groups.forEach((g) => {
                //console.log(g)
                fomular = fomular
                  .split(g)
                  .join('treeItems.find(i=> i.Code && i.Code.indexOf("' + g + '")==0)["' + h + '"]');
                //console.log(fomular)
              });

              try {
                //console.log(c[h])
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
        })
        .catch((err) => {
          console.log(err);
          if (err.message != null) {
            this.env.showTranslateMessage(err.message, 'danger');
          } else {
            this.env.showTranslateMessage('Không thể lấy được dữ liệu!', 'danger');
          }
        });
    });
  }

  preBuildBSTree() {
    let treeState = this.dataBalanceSheet;
    let treeItems = [];
    let listItems = [];
    return new Promise((resolve) => {
      this.pageService
        .getSAP_RPT_StatementBalanceSheet(
          this.rpt.rptGlobal.query.fromDate,
          this.rpt.rptGlobal.query.toDate,
          this.selectedBranchID,
          10,
          this.rpt.rptGlobal.query.reportType,
        )
        .toPromise()
        .then((resp: any) => {
          listItems = resp;

          let flatHeader = ['EB', 'OB'];
          treeItems = [];
          try {
            this.buildTree(listItems, treeItems, null, flatHeader);
          } catch (error) {
            console.log(error);
            debugger;
          }
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

          let needCalcItems = treeItems.filter((i) => {
            return i.Name ? i.Name.indexOf('=') > -1 : false;
          });

          flatHeader.forEach((h) => {
            needCalcItems.forEach((c) => {
              let fomular = c.Name.split('=')[1];
              let groups = fomular.match(/([0-9]+)/g);
              groups.forEach((g) => {
                console.log(g);
                fomular = fomular
                  .split(g)
                  .join('treeItems.find(i=> i.Code && i.Code.indexOf("' + g + '")==0)["' + h + '"]');
                console.log(fomular);
              });

              try {
                console.log(c[h]);
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

          this.dataBalanceSheet = treeItems;
        })
        .catch((err) => {
          console.log(err);
          if (err.message != null) {
            this.env.showTranslateMessage(err.message, 'danger');
          } else {
            this.env.showTranslateMessage('Không thể lấy được dữ liệu!', 'danger');
          }
        });
    });
  }
  preBuildIncomeTree() {
    let treeState = this.dataIncomeStatement;
    let treeItems = [];
    let listItems = [];
    return new Promise((resolve) => {
      this.pageService
        .getSAP_RPT_StatementIncome(
          this.rpt.rptGlobal.query.fromDate,
          this.rpt.rptGlobal.query.toDate,
          this.selectedBranchID,
          11,
          this.rpt.rptGlobal.query.reportType,
        )
        .toPromise()
        .then((resp: any) => {
          listItems = resp;

          let flatHeader = ['EB', 'OB'];
          treeItems = [];
          try {
            this.buildTree(listItems, treeItems, null, flatHeader);
          } catch (error) {
            console.log(error);
            debugger;
          }
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

          let needCalcItems = treeItems.filter((i) => {
            return i.Name ? i.Name.indexOf('=') > -1 : false;
          });

          flatHeader.forEach((h) => {
            needCalcItems.forEach((c) => {
              let fomular = c.Name.split('=')[1];
              let groups = fomular.match(/([0-9]+)/g);
              groups.forEach((g) => {
                //console.log(g)
                fomular = fomular
                  .split(g)
                  .join('treeItems.find(i=> i.Code && i.Code.indexOf("' + g + '")==0)["' + h + '"]');
                //console.log(fomular)
              });

              try {
                //console.log(c[h])
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

          this.dataIncomeStatement = treeItems;
        })
        .catch((err) => {
          console.log(err);
          if (err.message != null) {
            this.env.showTranslateMessage(err.message, 'danger');
          } else {
            this.env.showTranslateMessage('Không thể lấy được dữ liệu!', 'danger');
          }
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

  changeTypeFillter(type) {
    this.rpt.rptGlobal.query.reportType = type;
    this.loadData();
  }

  toogleBranchDataset(b) {
    b.IsHidden = false;
    this.selectedBranchID = b.Id;

    this.pageBranch.forEach((element, index) => {
      if (element.Id != b.Id) this.pageBranch[index].IsHidden = true;
    });

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
