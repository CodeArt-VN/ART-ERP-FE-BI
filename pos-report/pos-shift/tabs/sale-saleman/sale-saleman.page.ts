import { Component, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, PopoverController, NavController, Platform } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { ReportService } from 'src/app/services/report.service';
import { lib } from 'src/app/services/static/global-functions';
import { CustomService } from 'src/app/services/custom.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
    selector: 'app-sale-saleman',
    templateUrl: 'sale-saleman.page.html',
    styleUrls: ['sale-saleman.page.scss']
})
export class SaleSalemanPage extends PageBase {
    today = '';
    reportQuery: any = {};
    paymentList = [];

    printData = {
        printDate: null,
        currentBranch: null,
    }

    constructor(
        public actionSheetController: ActionSheetController,
        public alertCtrl: AlertController,
        public loadingController: LoadingController,
        public env: EnvService,
        public navCtrl: NavController,
        private platform: Platform,
        public commonService: CommonService,
        public rpt: ReportService,
    ) {
        super();
        this.today = lib.dateFormat(new Date, 'hh:MM dd/mm/yyyy');

        this.pageConfig.subscribeReport = this.rpt.Tracking().subscribe((data) => {
            console.log('subscribeReport');
            this.reportQuery = {
                fromDateTime: data.fromDateTime,
                toDateTime: data.toDateTime,
                IDBranch: data.IDBranch,
                IDOwner: data.saleman?.Id,
                _saleman: data.saleman,
                isCalcReceiptPayment: data.isCalcReceiptPayment,
                GroupBy: data.GroupBy
            };

             if (data._cmd == 'runReport') {
                this.readSaleSalemanReport();
            }
        })
    }

    ngOnDestroy() {
        this.pageConfig?.subscribeReport?.unsubscribe();
        super.ngOnDestroy();
    }

    preLoadData(event?: any): void {
        Promise.all([
            this.env.getType('PaymentType')
        ]).then((results:any) => {
            this.paymentList = results[0];
            super.preLoadData(event);
        });
    }

    loadData(event) {
        this.printData.printDate = lib.dateFormat(new Date(), "hh:MM dd/mm/yyyy");
        this.printData.currentBranch = this.env.branchList.find(d => d.Id == this.env.selectedBranch);
        super.loadedData(event);
    }

    ionViewDidEnter() {
        this.buildCharts();
    }

    refresh() {
        this.buildCharts();
    }


    buildCharts() {
        this.chartNameBuild();
    }

    chartNameBuild() {

    }


    readSaleSalemanReport() {
        if (this.submitAttempt) {
            return;
        }

        this.submitAttempt = true;
        let apiPath = {
            method: "GET",
            url: function () { return ApiSetting.apiDomain("SALE/Order/SaleSalemanReport/") }
        };

        this.loadingController.create({
            cssClass: 'my-custom-class',
            message: 'Đang tạo bảng kê, xin vui lòng chờ giây lát...'
        }).then(loading => {
            loading.present();
            this.commonService.connect('GET', ApiSetting.apiDomain("POS/Report/Shift/"), this.reportQuery).toPromise().then((resp: any) => {
                    this.submitAttempt = false;
                    if (loading) loading.dismiss();
                    if (resp['Data'].length) {
                        this.buildProductReport(resp);
                    }
                    super.loadedData();
                }).catch(err => {
                    if (err.message != null) {
                        this.env.showMessage(err.message, 'danger');
                    }
                    else {
                        this.env.showTranslateMessage('erp.app.pages.bi.sales-report.message.can-not-get-data','danger');
                    }
                    this.submitAttempt = false;
                    if (loading) loading.dismiss();
                    this.refresh();
                })
        });
    }



    ReportResult:any = {
		StartedAtText: null,
		EndedAtText: null,
		Staff: null,
		ExpectedAmount: null,
		ActualAmount: null,
		DifferenceAmount: null,
		CashAtTheBeginning: 2000000,
		CashRevenue: 0,
		RefundedCancelledAmount: 0,
		Tip: 0,
		IncomeAmount: 0,
		ExpenseAmount: 0,
		Withdrawal: 0,
		PayForPartner: 0,
		DepositMoney: 0,
		DepositRefundAmount: 0,
		CustomerDebt: 0,
		Total: 0,

		Vietcombank: 0,
		MBBank: 0,
		SandM: 0,
		Cash: 0,
		Card: 0,
		Transfer: 0,
		BOD: 0,
		BOM: 0,
	}

    buildProductReport(resp) {
		this.items = resp['Data'];
		let result = resp['Data'][0];

        this.ReportResult.PaymentResults =  resp['PaymentAmounts'];

        this.ReportResult.PaymentResults.forEach(i => {
            i.TypeText = (this.paymentList.find(p => p.Code == i.PaymentType)?.Name || 'Còn nợ');
            i.TotalReceiveText = lib.currencyFormat(i.TotalReceive);
        });

		this.ReportResult.StartedAtText =  lib.dateFormat((this.reportQuery.fromDateTime).replace("T", " "), 'dd/mm/yy hh:MM');
		this.ReportResult.EndedAtText =  lib.dateFormat((this.reportQuery.toDateTime).replace("T", " "), 'dd/mm/yy hh:MM');
		this.ReportResult.Staff = this.reportQuery._saleman?.FullName;
		this.ReportResult.ExpectedAmountText = lib.currencyFormat(result.Revenue);
		this.ReportResult.ActualAmountText =  lib.currencyFormat(result.Payments);
		this.ReportResult.DifferenceAmountText =  lib.currencyFormat(result.Revenue - result.Payments);

		this.ReportResult.CashAtTheBeginningText = lib.currencyFormat(this.ReportResult.CashAtTheBeginning);
		this.ReportResult.CashRevenueText = lib.currencyFormat(result.Payments);
		this.ReportResult.RefundedCancelledAmountText = lib.currencyFormat(this.ReportResult.RefundedCancelledAmount);
		this.ReportResult.TipText = lib.currencyFormat(this.ReportResult.Tip);
		this.ReportResult.IncomeAmountText = lib.currencyFormat(this.ReportResult.IncomeAmount);
		this.ReportResult.ExpenseAmountText = lib.currencyFormat(this.ReportResult.ExpenseAmount);
		this.ReportResult.WithdrawalText = lib.currencyFormat(this.ReportResult.Withdrawal);
		this.ReportResult.PayForPartnerText = lib.currencyFormat(this.ReportResult.PayForPartner);
		this.ReportResult.DepositMoneyText = lib.currencyFormat(this.ReportResult.DepositMoney);
		this.ReportResult.DepositRefundAmountText = lib.currencyFormat(this.ReportResult.DepositRefundAmount);
		this.ReportResult.CustomerDebtText = lib.currencyFormat(this.ReportResult.CustomerDebt);
		this.ReportResult.TotalText = lib.currencyFormat(this.ReportResult.CashAtTheBeginning + result.Payments);
		
		this.ReportResult.VietcombankText = lib.currencyFormat(this.ReportResult.Vietcombank);
		this.ReportResult.MBBankText = lib.currencyFormat(this.ReportResult.MBBank);
		this.ReportResult.SandMText = lib.currencyFormat(this.ReportResult.SandM);
		this.ReportResult.CashText = lib.currencyFormat(this.ReportResult.Cash);
		this.ReportResult.CardText = lib.currencyFormat(this.ReportResult.Card);
		this.ReportResult.TransferText = lib.currencyFormat(this.ReportResult.Transfer);
		this.ReportResult.BODText = lib.currencyFormat(this.ReportResult.BOD);
		this.ReportResult.BOMText = lib.currencyFormat(this.ReportResult.BOM);
	}
}
