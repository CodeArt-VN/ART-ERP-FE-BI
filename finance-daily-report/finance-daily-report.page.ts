import { Component, ViewChild } from '@angular/core';
import { ActionSheetController, NavController, Platform } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { ReportService } from 'src/app/services/report.service';
import { lib } from 'src/app/services/static/global-functions';
import { CustomService } from 'src/app/services/custom.service';
import { formatDate } from '@angular/common';
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';

@Component({
  selector: 'app-finance-daily-report',
  templateUrl: 'finance-daily-report.page.html',
  styleUrls: ['finance-daily-report.page.scss'],
})
export class FinanceDailyReportPage extends PageBase {
  headerDailyBalance = [];
  headerDailyRevenue = [];
  headerDailyDebt = [];
  headerDailyRevExpn1 = [];
  headerDailyRevExpn2 = [];

  rawDailyBalance = [];
  rawDailyGeneral = [];
  rawDailyRevenue = [];
  rawDailyDebt = [];
  rawDailyRevExpn1 = [];
  rawDailyRevExpn2 = [];

  dataDailyBalance = [];
  dataDailyGeneral = [];
  dataDailyRevenue = [];
  dataDailyDebt = [];
  dataDailyRevExpn1 = [];
  dataDailyRevExpn2 = [];

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

  selectedBranchID = 22;
  pageBranch = [];

  toDay = new Date();
  defaultFromDate = formatDate(new Date(this.toDay.getFullYear(), this.toDay.getMonth(), 1), 'yyyy/MM/dd', 'en');
  defaultReportDate = formatDate(new Date(), 'yyyy/MM/dd', 'en');
  defaultToDate = formatDate(new Date(), 'yyyy/MM/dd', 'en');

  constructor(
    private pageService: CustomService,
    public actionSheetController: ActionSheetController,
    public env: EnvService,
    public navCtrl: NavController,
    private platform: Platform,
    public rpt: ReportService,
  ) {
    super();
    //this.pageBranch  = ;

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

    this.rpt.rptGlobal.query.fromDate = this.defaultFromDate;
    this.rpt.rptGlobal.query.toDate = this.defaultToDate;
    this.rpt.rptGlobal.query.reportDate = this.defaultReportDate;

    this.reportBranchList.forEach((val) => this.pageBranch.push(Object.assign({}, val)));

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
    this.preBuildDailyBalanceTree();
    this.preBuildDailyGeneralTree();
    this.preBuildDailyRevenueTree();
    this.preBuildDailyDebtTree();
    this.preBuildDailyRevExpn1Tree();
    this.preBuildDailyRevExpn2Tree();
  }

  segmentView = 's1';
  segmentChanged(ev: any) {
    this.segmentView = ev.detail.value;
  }

  preBuildDailyBalanceTree() {
    let treeState = this.dataDailyBalance;
    let treeItems = [];
    let listItems = [];
    return new Promise((resolve) => {
      this.pageService
        .getSAP_RPT_DailyBalance(this.rpt.rptGlobal.query.reportDate, this.rpt.rptGlobal.query.branch, 4)
        .toPromise()
        .then((resp: any) => {
          this.headerDailyBalance = [];

          if (resp.length) {
            for (let i = 0; i < resp.length; i++) {
              const it = resp[i];
              it.Id = it.ID;
            }

            for (var key in resp[0]) {
              this.headerDailyBalance.push(key);
            }

            let removePros = [
              'IDParent',
              'Id',
              'ID',
              'Code',
              'TemplateCode',
              'Name',
              'ForeignName',
              'Remark',
              'ForeignRemark',
              'Value',
              'AccountCode',
              'CostCenter',
            ];
            this.headerDailyBalance = this.headerDailyBalance.filter((d) => removePros.findIndex((i) => i == d) == -1);

            this.headerDailyBalance = this.headerDailyBalance.map((h) => {
              let branch = this.reportBranchList.find((f) => {
                return h.indexOf(f.Code) == 0;
              });
              return {
                Name: h,
                Branch: branch,
                IsTotal: true,
                IsAll: h.indexOf('INGROUP') == 0,
              };
            });

            //console.log(this.headerDailyBalance);
          }

          let flatHeader = this.headerDailyBalance.map((e) => e.Name);

          listItems = resp;
          //listItems.sort((a, b) => (a.Sort > b.Sort) ? 1 : ((b.Sort > a.Sort) ? -1 : 0));
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

          // this.rawDailyBalance = resp;
          // this.dataDailyBalance = lib.listToTree(this.rawDailyBalance, 'data');

          this.dataDailyBalance = treeItems;
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

  preBuildDailyGeneralTree() {
    let treeState = this.dataDailyGeneral;
    let treeItems = [];
    let listItems = [];
    return new Promise((resolve) => {
      this.pageService
        .getSAP_RPT_DailyGeneral(
          this.rpt.rptGlobal.query.fromDate,
          this.rpt.rptGlobal.query.toDate,
          this.selectedBranchID,
          5,
        )
        .toPromise()
        .then((resp: any) => {
          this.rawDailyGeneral = resp;

          this.rawDailyGeneral.forEach((i) => {
            i['Deposit'] = lib.formatMoney(i['Deposit'], 0, '', ',');
            i['Liability'] = lib.formatMoney(i['Liability'], 0, '', ',');
            i['Receiveble'] = lib.formatMoney(i['Receiveble'], 0, '', ',');
            i['Revenue'] = lib.formatMoney(i['Revenue'], 0, '', ',');
            i['TotalExpenditure'] = lib.formatMoney(i['TotalExpenditure'], 0, '', ',');
            i['TotalRevenue'] = lib.formatMoney(i['TotalRevenue'], 0, '', ',');
          });

          this.dataDailyGeneral = lib.listToTree(this.rawDailyGeneral, 'data');
        });
    });
  }

  preBuildDailyRevenueTree() {
    let treeState = this.dataDailyRevenue;
    let treeItems = [];
    let listItems = [];
    return new Promise((resolve) => {
      this.pageService
        .getSAP_RPT_DailyRevenue(
          this.rpt.rptGlobal.query.fromDate,
          this.rpt.rptGlobal.query.toDate,
          this.rpt.rptGlobal.query.branch,
          6,
        )
        .toPromise()
        .then((resp: any) => {
          this.headerDailyRevenue = [];

          if (resp.length) {
            for (var key in resp[0]) {
              this.headerDailyRevenue.push(key);
            }

            let removePros = ['adate', 'TOTAL'];
            this.headerDailyRevenue = this.headerDailyRevenue.filter((d) => removePros.findIndex((i) => i == d) == -1);
            this.headerDailyRevenue = this.headerDailyRevenue.map((h) => {
              let branch = this.reportBranchList.find((f) => {
                return h.indexOf(f.Code) == 0 || h.indexOf(f.Code + '-TOTAL') == 0;
              });
              return {
                Name: h,
                Branch: branch,
                IsTotal: h.indexOf('-TOTAL') > 0,
                IsAll: false,
              };
            });
          }

          let flatHeader = this.headerDailyRevenue.map((e) => e.Name);
          listItems = resp;

          treeItems = [];

          listItems.forEach((i) => {
            let bTotal = 0,
              bCop = 0,
              bPer = 0,
              bLog = 0,
              bGcf,
              bOther = 0;
            let branchTotal = '';

            flatHeader.forEach((h) => {
              if (h.indexOf('TOTAL') > 0) branchTotal = h;

              if (h.indexOf('COP') > 0) {
                bTotal = 0;
                //bCop = parseFloat(i[h])
                bTotal += parseFloat(i[h]);
              }
              if (h.indexOf('PER') > 0) {
                bPer = parseFloat(i[h]);
                //bTotal += bPer
                bTotal += parseFloat(i[h]);
              }
              if (h.indexOf('LOG') > 0) {
                bLog = parseFloat(i[h]);
                //bTotal += bLog
                bTotal += parseFloat(i[h]);
              }
              if (h.indexOf('GCF') > 0) {
                bGcf = parseFloat(i[h]);
                //bTotal += bGcf
                bTotal += parseFloat(i[h]);
              }
              if (h.indexOf('OTHER') > 0) {
                bOther = parseFloat(i[h]);
                //bTotal += bOther
                bTotal += parseFloat(i[h]);

                // i[branchTotal] = lib.formatMoney(bTotal, 0, '', '.');
              }

              if (i[h]) {
                i[h] = lib.formatMoney(i[h], 0, '', ',');
              } else {
                i[h] = 0;
              }
            });

            i['adate'] = i['adate'].replace('T00:00:00', '');
          });

          this.dataDailyRevenue = lib.listToTree(listItems, 'data');
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

  preBuildDailyDebtTree() {
    let treeState = this.dataDailyDebt;
    let treeItems = [];
    let listItems = [];
    return new Promise((resolve) => {
      this.pageService
        .getSAP_RPT_DailyDebt(
          this.rpt.rptGlobal.query.fromDate,
          this.rpt.rptGlobal.query.toDate,
          this.rpt.rptGlobal.query.branch,
          7,
        )
        .toPromise()
        .then((resp: any) => {
          this.headerDailyDebt = [];

          if (resp.length) {
            for (var key in resp[0]) {
              this.headerDailyDebt.push(key);
            }

            let removePros = ['adate'];
            this.headerDailyDebt = this.headerDailyDebt.filter((d) => removePros.findIndex((i) => i == d) == -1);
            this.headerDailyDebt = this.headerDailyDebt.map((h) => {
              let branch = this.reportBranchList.find((f) => {
                return h.indexOf(f.Code) == 0 || h.indexOf('TOTAL') == 0;
              });
              return {
                Name: h,
                Branch: branch,
                IsTotal: true,
                IsAll: false,
              };
            });
          }

          let flatHeader = this.headerDailyDebt.map((e) => e.Name);
          listItems = resp;

          treeItems = [];

          listItems.forEach((i) => {
            let total1 = 0,
              total2 = 0,
              total3 = 0;
            flatHeader.forEach((h) => {
              if (h.indexOf('Phải thu') > 0 && h.indexOf('TOTAL') == -1) {
                total1 += parseFloat(i[h]);
                i['TOTAL-Phải thu'] = lib.formatMoney(total1, 0, '', ',');
              }
              if (h.indexOf('Phải trả') > 0 && h.indexOf('TOTAL') == -1) {
                total2 += parseFloat(i[h]);
                i['TOTAL-Phải trả'] = lib.formatMoney(total2, 0, '', ',');
              }
              if (h.indexOf('Cọc thu trước tiệc') > 0 && h.indexOf('TOTAL') == -1) {
                total3 += parseFloat(i[h]);
                i['TOTAL-Cọc thu trước tiệc'] = lib.formatMoney(total3, 0, '', ',');
              }

              if (i[h]) {
                i[h] = lib.formatMoney(i[h], 0, '', ',');
              } else {
                i[h] = 0;
              }
            });

            i['adate'] = i['adate'].replace('T00:00:00', '');
          });

          this.dataDailyDebt = lib.listToTree(listItems, 'data');
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

  preBuildDailyRevExpn1Tree() {
    let treeState = this.dataDailyRevExpn1;
    let treeItems = [];
    let listItems = [];
    return new Promise((resolve) => {
      this.pageService
        .getSAP_RPT_DailyRevExpn1(
          this.rpt.rptGlobal.query.fromDate,
          this.rpt.rptGlobal.query.toDate,
          this.rpt.rptGlobal.query.branch,
          8,
        )
        .toPromise()
        .then((resp: any) => {
          this.headerDailyRevExpn1 = [];

          if (resp.length) {
            for (var key in resp[0]) {
              this.headerDailyRevExpn1.push(key);
            }

            let removePros = ['adate'];
            this.headerDailyRevExpn1 = this.headerDailyRevExpn1.filter(
              (d) => removePros.findIndex((i) => i == d) == -1,
            );
            this.headerDailyRevExpn1 = this.headerDailyRevExpn1.map((h) => {
              let branch = this.reportBranchList.find((f) => {
                return h.indexOf(f.Code) == 0 || h.indexOf('TOTAL') == 0;
              });
              return {
                Name: h,
                Branch: branch,
                IsTotal: true,
                IsAll: false,
              };
            });
          }

          let flatHeader = this.headerDailyRevExpn1.map((e) => e.Name);
          listItems = resp;

          treeItems = [];

          listItems.forEach((i) => {
            let total1 = 0,
              total2 = 0;
            flatHeader.forEach((h) => {
              if (h.indexOf('Tiền mặt') > 0 && h.indexOf('TOTAL') == -1) {
                total1 += parseFloat(i[h]);
                i['TOTAL-Tiền mặt'] = lib.formatMoney(total1, 0, '', ',');
              }
              if (h.indexOf('Chuyển khoản') > 0 && h.indexOf('TOTAL') == -1) {
                total2 += parseFloat(i[h]);
                i['TOTAL-Chuyển khoản'] = lib.formatMoney(total2, 0, '', ',');
              }

              if (i[h]) {
                i[h] = lib.formatMoney(i[h], 0, '', ',');
              } else {
                i[h] = 0;
              }
            });

            i['adate'] = i['adate'].replace('T00:00:00', '');
          });

          this.dataDailyRevExpn1 = lib.listToTree(listItems, 'data');
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

  preBuildDailyRevExpn2Tree() {
    let treeState = this.dataDailyRevExpn2;
    let treeItems = [];
    let listItems = [];
    return new Promise((resolve) => {
      this.pageService
        .getSAP_RPT_DailyRevExpn2(
          this.rpt.rptGlobal.query.fromDate,
          this.rpt.rptGlobal.query.toDate,
          this.rpt.rptGlobal.query.branch,
          9,
        )
        .toPromise()
        .then((resp: any) => {
          this.headerDailyRevExpn2 = [];

          if (resp.length) {
            for (var key in resp[0]) {
              this.headerDailyRevExpn2.push(key);
            }

            let removePros = ['adate'];
            this.headerDailyRevExpn2 = this.headerDailyRevExpn2.filter(
              (d) => removePros.findIndex((i) => i == d) == -1,
            );
            this.headerDailyRevExpn2 = this.headerDailyRevExpn2.map((h) => {
              let branch = this.reportBranchList.find((f) => {
                return h.indexOf(f.Code) == 0 || h.indexOf('TOTAL') == 0;
              });
              return {
                Name: h,
                Branch: branch,
                IsTotal: true,
                IsAll: false,
              };
            });
          }

          let flatHeader = this.headerDailyRevExpn2.map((e) => e.Name);
          listItems = resp;

          treeItems = [];

          listItems.forEach((i) => {
            let total1 = 0,
              total2 = 0;
            flatHeader.forEach((h) => {
              if (h.indexOf('Tiền mặt') > 0 && h.indexOf('TOTAL') == -1) {
                total1 += parseFloat(i[h]);
                i['TOTAL-Tiền mặt'] = lib.formatMoney(total1, 0, '', ',');
              }
              if (h.indexOf('Chuyển khoản') > 0 && h.indexOf('TOTAL') == -1) {
                total2 += parseFloat(i[h]);
                i['TOTAL-Chuyển khoản'] = lib.formatMoney(total2, 0, '', ',');
              }

              if (i[h]) {
                i[h] = lib.formatMoney(i[h], 0, '', ',');
              } else {
                i[h] = 0;
              }
            });

            i['adate'] = i['adate'].replace('T00:00:00', '');
          });

          this.dataDailyRevExpn2 = lib.listToTree(listItems, 'data');
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

          if (item.CostCenter == null) item[col] += i[col];
          else if (item.CostCenter != 'NOTSUM' && item.CostCenter != 'GETSUBITEM') {
            item[col] += i[col];
          }
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

  changeDateFillterBalance() {
    this.loadData();
  }

  changeFrequency(f) {
    this.rpt.rptGlobal.query.frequency = f.Id;
    this.loadData();
  }

  toogleBranchDataset(b) {
    b.IsHidden = false;
    this.selectedBranchID = b.Id;

    this.pageBranch.forEach((element, index) => {
      if (element.Id != b.Id) this.pageBranch[index].IsHidden = true;
    });

    this.preBuildDailyGeneralTree();
  }

  toogleBranchDataset1(b1) {
    b1.IsHidden = !b1.IsHidden;

    this.pageBranch.forEach((element, index) => {
      if (element.Id != this.selectedBranchID) this.pageBranch[index].IsHidden = true;
    });

    this.loadData();
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
}
