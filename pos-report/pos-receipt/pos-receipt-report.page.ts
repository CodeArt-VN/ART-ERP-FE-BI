import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { POS_MenuDetailProvider, POS_MenuProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { CommonService } from 'src/app/services/core/common.service';
import { groupBy } from 'rxjs/operators';
import { ReportService } from 'src/app/services/report.service';


@Component({
    selector: 'app-pos-receipt-report',
    templateUrl: 'pos-receipt-report.page.html',
    styleUrls: ['pos-receipt-report.page.scss']
})
export class POSReceiptReportPage extends PageBase {
    hostImage = environment.appDomain;
    reportQuery;
    reportPaymentQuery;
    ChartData;
    ChartStyle2 = {
        width: '100%',
        'min-height': '300px',
    }
    ChartPayment = [];
    ChartPaymentAmount = [];
    Chart1 = {
        Id: 'Payment',
        Title: 'Payment',
        Subtext: '',
        SeriesName: 'Quantity',

        Legend: false,
        // Data:  this.topSellingProduct,
        Type: 'Pie',
        Style: this.ChartStyle2
    }
    Chart2 = {
        Id: 'PaymentAmount',
        Title: 'Payment Amount',
        Subtext: '',
        SeriesName: 'Amount',

        Legend: false,
        // Data:  this.topSellingProduct,
        Type: 'Pie',
        Style: this.ChartStyle2
    }
    constructor(
        public pageProvider: POS_MenuProvider,
        public branchProvider: POS_MenuDetailProvider,
        public modalController: ModalController,
        public popoverCtrl: PopoverController,
        public alertCtrl: AlertController,
        public loadingController: LoadingController,
        public env: EnvService,
        public navCtrl: NavController,
        public location: Location,
        public commonService :CommonService,
        public rpt: ReportService,
    ) {
        super();      
   
        this.loadedData();
    }
    changeDateFilter(type) {
        this.rpt.dateQuery(type).then(_ => {
            this.preLoadData(null);
        }).catch(err => { let a = err });
        console.log(this.rpt.rptGlobal.query);
    }

    changeFrequency(f) {
        this.rpt.rptGlobal.query.frequency = f.Id;
        if (f.Id == 1) {
            this.changeDateFilter('dw');
        }
        else if (f.Id == 2) {
            this.changeDateFilter('m');
        }
        else if (f.Id == 3) {
            this.changeDateFilter('q');
        }
        else if (f.Id == 4) {
            this.changeDateFilter('y');
        }

    }
    toogleBranchDataset(b) {
        b.IsHidden = !b.IsHidden;
    }

    paymentlist;

    preLoadData(event?: any): void {
        this.env.getType('incoming-payment').then(data=>{
            this.paymentlist = data;
            this.paymentlist.push({Id:0,Name:""});
            this.paymentlist.push({Id:1402,Name:"Chuyển Khoản"});
            this.buildPieChartsData();
            super.preLoadData(event);
        })
    }

    loadedData(event?: any): void {

        this.reportQuery = {
            fromDate: this.rpt.rptGlobal.query.fromDate,
            toDate: this.rpt.rptGlobal.query.toDate + ' 23:59:59',
            IDBranch: this.env.selectedBranch,
       
        }; 


        let apiPath = {
            method: "GET",
            url: function () { return ApiSetting.apiDomain("POS/Report/ReceiptList") }
        };

        Promise.all([

            this.commonService.connect(apiPath.method, apiPath.url(), this.reportQuery).toPromise()
        ]).then(values => { 
            this.items= values[0];
            super.loadedData(event); 
            
        });
    }
    buildPieChartsData() {
        this.reportQuery = {
            fromDate: this.rpt.rptGlobal.query.fromDate,
            toDate: this.rpt.rptGlobal.query.toDate,
            IDBranch: this.env.selectedBranch,
            GroupBy: 'Day',  // Hour / Day / Week / Month / Year
        };

        this.reportPaymentQuery = {
            fromDate: this.rpt.rptGlobal.query.fromDate,
            toDate: this.rpt.rptGlobal.query.toDate,
            IDBranch: this.env.selectedBranch,
            GroupBy: 'Day',  // Hour / Day / Week / Month / Year
            isCalcReceiptPayment: true,
        };

        let apiPath = {
            method: "GET",
            url: function () { return ApiSetting.apiDomain("POS/Report/Payment") }
        };
        let apiPathDay = {
            method: "GET",
            url: function () { return ApiSetting.apiDomain("POS/Report/Day") }
        };
        Promise.all([
            this.commonService.connect(apiPath.method, apiPath.url(), this.reportPaymentQuery).toPromise(),
            this.commonService.connect(apiPathDay.method, apiPathDay.url(), this.reportQuery).toPromise()
        ]).then((values:any) => { 
            let datapayment = [];
            let datapaymentamount = []; 
            values[0].forEach(r=>{
                r.paymentname = this.paymentlist.find(d=>d.Id == r.IDType).Name;

                datapayment.push({name:r.paymentname,value:r.TotalQuantity});
                datapaymentamount.push({name:r.paymentname,value:r.TotalReceive});
            })
            this.ChartPayment = datapayment;
            this.ChartPaymentAmount = datapaymentamount;
            this.ChartData = {
                Revenue: {
                    label: values[1].map(r=>r.Date),
                    data:[{name:"Revenue",data:values[1].map(r=>r.Revenue)}]
                },
                Receipt: {
                    label: values[1].map(r=>r.Date),
                    data:[{name:"Receipt",data:values[1].map(r=>r.Receipts)}]
                }
               
            }
        });
    }
    // FormatDataToChart(items,Chart){
    //     let data=[];
    //     items.reduce(function (res, value) {
    //         if(Chart=='Revenue'){
    //             if (!res[new Date(value.CreatedOn).getFullYear()]) {
    //                 res[new Date(value.CreatedOn).getFullYear()] = { name: new Date(value.CreatedOn).getFullYear(), value: 0 };
    //                 data.push(res[new Date(value.CreatedOn).getFullYear()])
    //             }
    //             res[new Date(value.CreatedOn).getFullYear()].value += value.TotalPrice;
    //             return res;
    //         }
    //         if(Chart=='Receipt'){
    //             if (!res[new Date(value.CreatedOn).getFullYear()]) {
    //                 res[new Date(value.CreatedOn).getFullYear()] = { name: new Date(value.CreatedOn).getFullYear(), value: 0 };
    //                 data.push(res[new Date(value.CreatedOn).getFullYear()])
    //             }
    //             res[new Date(value.CreatedOn).getFullYear()].value += 1;
    //             return res;
    //         }
    //         if(Chart=='Payment'){
    //             if (!res[value.Type]) {
    //                 res[value.Type] = { name: value.Type, value: 0 };
    //                 data.push(res[value.Type])
    //             }
    //             res[value.Type].value += 1;
    //             return res;
    //         }
    //         if(Chart=='PaymentAmount'){
    //             if (!res[value.Type]) {
    //                 res[value.Type] = { name: value.Type, value: 0 };
    //                 data.push(res[value.Type])
    //             }
    //             res[value.Type].value += value.Payments;
    //             return res;
    //         }
           
    //     }, {});
    //     return data;
    // }
    
    
    // LoadChart(){
    //     this.ChartData = {
    //         revenue:{
    //             label: this.FormatDataToChart(this.items,'Revenue').map(e=> "năm " + e.name),
    //             data: [{name:'Revenue',data:this.FormatDataToChart(this.items,'Revenue').map(e=> e.value)}]
    //         },
    //         receipt:{
    //             label: this.FormatDataToChart(this.items,'Receipt').map(e=> "năm " + e.name),
    //             data: [{name:'Receipt',data:this.FormatDataToChart(this.items,'Receipt').map(e=> e.value)}]
    //         },
    //         payment:{
    //             label: [],
    //             data:this.FormatDataToChart(this.items,'Payment')
    //         },
    //         paymentAmount:{
    //             label: [],
    //             data:this.FormatDataToChart(this.items,'PaymentAmount')
    //         }
    //     }
    // }
}
