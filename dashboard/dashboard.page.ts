import { Component, ViewChild } from '@angular/core';
import { ActionSheetController, NavController, Platform } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { ReportService } from 'src/app/services/report.service';
import { lib } from 'src/app/services/static/global-functions';

import { CustomService } from 'src/app/services/custom.service';
import { Observable } from 'rxjs';
import { CRM_ContactProvider, SALE_OrderProvider } from 'src/app/services/static/services.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: 'dashboard.page.html',
    styleUrls: ['dashboard.page.scss']
})
export class DashboardPage extends PageBase {
    isShowFeature = true;
    pageData: any = {};
    calendarHeatmapData: any = {};
    selectedHeatNode = { name: 'Branch', value: 0, color: '', opacity: 'ff', total: 0 };

    ListOfAllEvents;
    ListOfWeekdayEvents = [];
    numberOfWeekdayEvents;
    ListOfWeekendEvents = [];
    numberOfWeekendEvents;
    ListOfOccupiedDay = [];
    ListOfDateRange = [];
    numberOfOccupancyRate;
    numberOfEvents;

    lostReasonDataLabel = [];
    lostReasonData = [];

    doanhThuChiTieuChartLabel = [];
    doanhThuChiTieuChartData = [];

    chiPhiChiTieuChartLabel = [];
    chiPhiChiTieuChartData = [];

    SoLuongTiecLabel = [];
    SoLuongTiecData = [];

    sumupInquiryLostLabel = [];
    sumupInquiryLostData = [];

    inquiryBySourceLabel = [];
    inquiryBySourceData = [];

    saleByServiceLabel = [];
    saleByServiceData = [];

    top10CustomerLabel = [];
    top10CustomerData = [];

    PnLLabel = [];
    PnLData = [];
    
    cashFlowLabel = [];
    cashFlowData = [];
    charts;

    constructor(
        private pageService: CustomService,
        public saleOrderProvider: SALE_OrderProvider,
        public contactProvider: CRM_ContactProvider,
        public actionSheetController: ActionSheetController,
        public env: EnvService,
        public navCtrl: NavController,
        private platform: Platform,
        public rpt: ReportService,
    ) {
        super();
        this.charts = {
            SoLuongTiec: { IsLoading: true, IsNoData: false, Chart: null },
            DoanhThuChiTieu: { IsLoading: true, IsNoData: false, Chart: null },
            ChiPhiChiTieu: { IsLoading: true, IsNoData: false, Chart: null },
            SaleByService: { IsLoading: true, IsNoData: false, Chart: null },
            InquiryBySource: { IsLoading: true, IsNoData: false, Chart: null },
            LostReason: { IsLoading: true, IsNoData: false, Chart: null },
            Funnel: { IsLoading: true, IsNoData: false, Chart: null },
            Top10Customer: { IsLoading: true, IsNoData: false, Chart: null },
            PNL: { IsLoading: true, IsNoData: false, Chart: null },
            CashFlow: { IsLoading: true, IsNoData: false, Chart: null },
        };

        this.pageConfig.subscribeEvent = this.env.getEvents().subscribe((data) => {
            if (data.Code == 'changeBranch') {
                this.changeBranchBtn();
            }
            else {
                this.refresh();
            }
        });

        this.rpt.rptGlobal.query.frequency = 2;
        this.changeDateFilter('m');
        this.changeBranchBtn();
    }

    loadedData(event = null) {
        this.query.OrderDateFrom = this.rpt.rptGlobal.query.fromDate;
        this.query.OrderDateTo = this.rpt.rptGlobal.query.toDate + ' 23:59:59';
        this.query.IDBranch = this.rpt.rptGlobal.query.branch;
        this.query.Take = 5000;
        this.ListOfDateRange = [];

        let beginDate = new Date(this.rpt.rptGlobal.query.fromDate);
        let endDate = new Date(this.rpt.rptGlobal.query.toDate);
        
        let rundate = new Date(beginDate);
        //calc labels
        while (rundate <= endDate) {
            this.ListOfDateRange.push(lib.dateFormat(rundate, 'yyyy-mm-dd'));
            rundate.setDate(rundate.getDate() + 1);
        };


        Promise.all([
            this.saleOrderProvider.read(this.query)
        ]).then(values => {
            this.ListOfAllEvents = values[0]['data'];
            this.items=this.ListOfAllEvents
            this.numberOfEvents = this.ListOfAllEvents.length;

            const uniqueDate = [...new Set(this.ListOfAllEvents.map(item => lib.dateFormat(item.OrderDate, 'yyyy-mm-dd')))];
            this.ListOfWeekendEvents = [];
            this.ListOfWeekdayEvents = [];
            this.ListOfOccupiedDay = uniqueDate;
            let counter = 0;
            for (let index = 0; index < this.ListOfAllEvents.length; index++) {
                const day = this.ListOfAllEvents[index];

                day.Personal = (day.Personal || 0);
                day.Corporate = (day.Corporate || 0);

                if (day.IsPersonal == true) {
                    day.Personal = day.TotalAfterTax;
                }
                else if (day.IsPersonal == false) {
                    day.Corporate = day.TotalAfterTax;
                }

                var today = new Date(day.OrderDate);
                if (today.getDay() == 6 || today.getDay() == 0) {
                    this.ListOfWeekendEvents.push(day);
                } else {
                    this.ListOfWeekdayEvents.push(day);
                }
                if (counter == this.ListOfAllEvents.length - 1) {
                    if (this.numberOfEvents != 0) {
                        this.ListOfAllEvents = [...this.ListOfAllEvents];
                        this.numberOfWeekendEvents = Math.round(this.ListOfWeekendEvents.length / this.numberOfEvents * 100);
                        this.numberOfWeekdayEvents = Math.round(this.ListOfWeekdayEvents.length / this.numberOfEvents * 100);
                        this.numberOfOccupancyRate = Math.round(this.ListOfOccupiedDay.length / this.ListOfDateRange.length * 100);
                    } else {
                        this.numberOfWeekendEvents = 0;
                        this.numberOfWeekdayEvents = 0;
                        this.numberOfOccupancyRate = 0;
                    }
                    super.loadedData(event);
                    this.updateChart();
                };
                counter++;
            }

            //When this.ListOfAllEvents == 0 ?
            if (this.ListOfAllEvents.length == 0) {
                this.numberOfWeekendEvents = 0;
                this.numberOfWeekdayEvents = 0;
                this.numberOfOccupancyRate = 0;

                this.charts.SoLuongTiec.IsLoading = false;
                this.charts.DoanhThuChiTieu.IsLoading = false;
                this.charts.ChiPhiChiTieu.IsLoading = false;
                this.charts.SaleByService.IsLoading = false;
                this.charts.InquiryBySource.IsLoading = false;
                this.charts.LostReason.IsLoading = false;  
                this.charts.Funnel.IsLoading = false;  
                this.charts.Top10Customer.IsLoading = false;
                this.charts.PNL.IsLoading = false;  
                this.charts.CashFlow.IsLoading = false;

                this.env.showTranslateMessage('Kh??ng c?? d??? li???u trong kho???ng th???i gian ???????c ch???n!','warning')

                super.loadedData(event);
            }
            
        });
    }

    changeBranchBtn() {
        if (this.env.selectedBranch == 16) {
            this.rpt.rptGlobal.branch.forEach(b => {
                b.ShowBtn = true;
                b.IsHidden = false;
            });
        }
        else {
            let currentBranch = this.rpt.rptGlobal.branch.find(b => b.Id == this.env.selectedBranch);
            this.rpt.rptGlobal.branch.forEach(b => {
                b.ShowBtn = false;
                b.IsHidden = true;
            });
            if (currentBranch) {
                currentBranch.ShowBtn = true;
                currentBranch.IsHidden = false;
            };
        }
    }


    refresh() {
        this.lostReasonDataLabel = [];
        this.lostReasonData = [];
    
        this.doanhThuChiTieuChartLabel = [];
        this.doanhThuChiTieuChartData = [];
    
        this.chiPhiChiTieuChartLabel = [];
        this.chiPhiChiTieuChartData = [];
    
        this.SoLuongTiecLabel = [];
        this.SoLuongTiecData = [];
    
        this.inquiryBySourceLabel = [];
        this.inquiryBySourceData = [];

        this.sumupInquiryLostLabel = [];
        this.sumupInquiryLostData = [];
    
        this.saleByServiceLabel = [];
        this.saleByServiceData = [];
    
        this.top10CustomerLabel = [];
        this.top10CustomerData = [];
    
        this.PnLLabel = [];
        this.PnLData = [];
        
        this.cashFlowLabel = [];
        this.cashFlowData = [];


        this.preLoadData(null);
    }

    getDatesInRange(startDate, endDate) {
        const date = new Date(startDate.getDate());
      
        const dates = [];
      
        while (date <= endDate) {
          dates.push(new Date(date));
          date.setDate(date.getDate() + 1);
        }
      
        return dates;
    }

    changeDateFilter(type) {
        this.charts.SoLuongTiec.IsLoading = true;
        this.charts.DoanhThuChiTieu.IsLoading = true;
        this.charts.ChiPhiChiTieu.IsLoading = true;
        this.charts.SaleByService.IsLoading = true;
        this.charts.InquiryBySource.IsLoading = true;
        this.charts.LostReason.IsLoading = true;  
        this.charts.Funnel.IsLoading = true;  
        this.charts.Top10Customer.IsLoading = true;
        this.charts.PNL.IsLoading = true;  
        this.charts.CashFlow.IsLoading = true;

        this.rpt.dateQuery(type).then(_ => {
            this.preLoadData(null);
        }).catch(err => { let a = err });
    }

    changeFrequency(f) {
        this.rpt.rptGlobal.query.frequency = f.Id;

        if (f.Id == 1) {
            this.changeDateFilter('dw');
        }
        else if (f.Id == 2) {
            this.changeDateFilter('m');
        }
    }

    updateChart() {
        for (var key in this.charts) {
            let c = this.charts[key].Chart;
            c?.destroy();
        }

        this.buildCharts();
    }

    toogleBranchDataset(b) {
        b.IsHidden = !b.IsHidden;
        for (var key in this.charts) {
            let c = this.charts[key].Chart;

            c?.data.datasets.forEach(function (ds) {
                if (ds.IDBranch == b.Id) {
                    ds.hidden = b.IsHidden;
                }
            });
            c?.update();
        }
        this.buildTopSum();
        this.buildCalendarHeatmapChart();
    }

    buildCharts() {
       
        this.buildTopSum();
        // this.buildSoLuongTiecChart(this.soLuongTiecCanvas).subscribe(c => {
        //     this.charts.SoLuongTiec.Chart = c;
        //     this.charts.SoLuongTiec.IsLoading = false;
        // });
        this.buildSoLuongTiecChart();
        this.buildCalendarHeatmapChart();
        this.buildSumUpInquiryLostChart();
        this.buildDoanhThuChiTieuChart();
        this.buildChiPhiChiTieuChart();
        this.buildInquiryBySourceChart();
        this.buildSaleByServiceChart();

        this.buildLostReasonChart();
        
        this.buildTop10CustomerChart();

        this.buildPnLChart();
        this.buildCashFlowChart();
    }

    buildTopSum() {

        this.pageData.NumberOfEvents = 0;
        this.pageData.NumberOfGuests = 0;
        this.pageData.DoanhThu = 0;
        this.ListOfAllEvents;
        let datasets = this.rpt.buildDataset();
        let sumAll = 0;
        let sumAllDoanhThu = 0;
        let sumAllGuest = 0;
        for (let i = 0; i < datasets.length; i++) {
            let ds = datasets[i];

            ds.Data = this.ListOfAllEvents.filter(branch => branch.IDBranch == ds.IDBranch);
            if (!ds.hidden && ds.IDBranch != 0) {
                this.pageData.DoanhThu += ds.Data.map(m => m.TotalAfterTax).reduce((a, b) => a + b, 0);
                if (this.env.selectedBranch == 16) {
                    this.pageData.NumberOfEvents = this.ListOfAllEvents.length;
                }
                else {
                    this.pageData.NumberOfEvents = this.ListOfAllEvents.filter(e => e.IDBranch == this.env.selectedBranch).length;
                }

                // this.pageData.NumberOfGuests = this.ListOfEvents.map(m => m.NumberOfGuest).reduce((a, b) => a + b, 0);
                if (ds.IDBranch == 0) {
                    sumAll = ds.Data.map(m => m.Event).reduce((a, b) => a + b, 0);
                    sumAllDoanhThu = ds.Data.map(m => m.DoanhThu).reduce((a, b) => a + b, 0);
                    sumAllGuest = ds.Data.map(m => m.NumberOfGuest).reduce((a, b) => a + b, 0);
                }
            }

        }
        if (sumAll > 0) {
            this.pageData.NumberOfEvents = sumAll;
            this.pageData.NumberOfGuests = sumAllGuest;
            this.pageData.DoanhThu = sumAllDoanhThu;
        }
        this.pageData.DoanhThu = Math.round(this.pageData.DoanhThu / 100000000) / 10;
        this.pageData.NumberOfGuests = Math.round(this.pageData.NumberOfGuests / 1000);
    }

    buildSoLuongTiecChart(){
            let dataLineCharts = [];            
            let tmp = {Data:[]}
            for (let i = 0; i < this.rpt.rptGlobal.branch.length; i++) {
                let data=[];
                const b = this.rpt.rptGlobal.branch[i];
                tmp.Data = this.ListOfAllEvents.filter(branch => branch.IDBranch == b.Id&&!b.IsHidden);               
                
                if (tmp.Data.length){
                    tmp.Data.forEach(e => {
                        e.Date = lib.dateFormat(e.OrderDate, 'yyyy-mm-dd');                       
                        data = this.calcSumGroupData(tmp, 'OrderQuantity');
                    });
                    let dataLinechart = {
                        name:b.Name,
                        data:data
                    }
                    dataLineCharts.push(dataLinechart);
                }              
                
            }           

            this.SoLuongTiecLabel = this.rpt.timeGroups.map(m => m.Label);
            this.SoLuongTiecData = dataLineCharts

    }

    calcSumGroupData(ds, sumby) {
        let group = [];
        if (sumby == 'OrderQuantity') {
            for (let j = 0; j < this.rpt.timeGroups.length; j++) {
                const g = this.rpt.timeGroups[j];
                let sum = ds.Data.filter((e) => {
                    return this.rpt.timeGroupCompare(e, g)
                });
    
                group.push(sum.length);
            }
        }
        else if (sumby == 'CalcSumByDate') {
            for (let j = 0; j < this.rpt.timeGroups.length; j++) {
                const g = this.rpt.timeGroups[j];
                let sum = ds.filter((e) => {
                    return this.rpt.timeGroupCompare(e, g)
                }).map(m => m[sumby]).reduce((a, b) => a + b, 0);
                group = sum;
            }
        }
        else if (sumby == 'CalcSumByTotalAfterTax') {
            for (let j = 0; j < this.rpt.timeGroups.length; j++) {
                const g = this.rpt.timeGroups[j];
                let sum = ds.Data.filter((e) => {
                    return this.rpt.timeGroupCompare(e, g)
                }).map(m => m['TotalAfterTax']).reduce((a, b) => a + b, 0);
                group = sum;
            }
        }
        else if (sumby == 'TotalAfterTax') {
            for (let j = 0; j < this.rpt.timeGroups.length; j++) {
                const g = this.rpt.timeGroups[j];
                let sum = ds.Data.filter((e) => {
                    return this.rpt.timeGroupCompare(e, g)
                }).map(m => m[sumby]).reduce((a, b) => a + b, 0);
                group.push(sum);
            }
        }
        else {
            for (let j = 0; j < this.rpt.timeGroups.length; j++) {
                const g = this.rpt.timeGroups[j];
                let sum = ds.Data.filter((e) => {
                    return this.rpt.timeGroupCompare(e, g)
                }).map(m => m[sumby]).reduce((a, b) => a + b, 0);
                group.push(sum);
            }
        }
        return group;
    }

    buildDoanhThuChiTieuChart() {
        let dataBarCharts = [];
        let tmp ={Data:[]}
        for (let i = 0; i < this.rpt.rptGlobal.branch.length; i++) {
            let data=[]
            const b = this.rpt.rptGlobal.branch[i];
            tmp.Data =this.items.filter(branch => branch.IDBranch == b.Id&&!b.IsHidden);

            if (tmp.Data.length) {
                tmp.Data.forEach(e => {
                    e.Date = lib.dateFormat(e.OrderDate, 'yyyy-mm-dd');                   
                    data = this.calcSumGroupData(tmp, 'TotalAfterTax');
                });
                let dataBarChart = {
                    name:b.Name + ' - Doanh thu',
                    data:data
                }
                dataBarCharts.push(dataBarChart);
            }
           
        }

        this.doanhThuChiTieuChartLabel = this.rpt.timeGroups.map(m => m.Label);
        this.doanhThuChiTieuChartData = dataBarCharts;
    }

    buildChiPhiChiTieuChart() {
        let dataBarCharts = [];
        let tmp ={Data:[]}
        for (let i = 0; i < this.rpt.rptGlobal.branch.length; i++) {
            let data=[]
            const b = this.rpt.rptGlobal.branch[i];
             tmp.Data =this.items.filter(branch => branch.IDBranch == b.Id&&!b.IsHidden);
           
            if (tmp.Data.length){
                tmp.Data.forEach(e => {
                    e.Date = lib.dateFormat(e.OrderDate, 'yyyy-mm-dd');                   
                    data = this.calcSumGroupData(tmp, 'TotalAfterTax');
                });
                
                let dataBarChart = {
                    name:b.Name + ' - Chi ph??',
                    data:data
                }
                dataBarCharts.push(dataBarChart);
            }
        }
        this.chiPhiChiTieuChartLabel =this.rpt.timeGroups.map(m => m.Label);
        this.chiPhiChiTieuChartData=dataBarCharts
    }

    buildInquiryBySourceChart() {
        let dataBarCharts = [];
        let tmp ={Data:[]}
        for (let i = 0; i < this.rpt.rptGlobal.branch.length; i++) {
            let data=[]
            const b = this.rpt.rptGlobal.branch[i];
             tmp.Data =this.items.filter(branch => branch.IDBranch == b.Id&&!b.IsHidden);
           
            
            if (tmp.Data.length){
                tmp.Data.forEach(e => {
                    e.Date = lib.dateFormat(e.OrderDate, 'yyyy-mm-dd');                   
                    data = [this.rpt.randomScalingFactor(), this.rpt.randomScalingFactor(), this.rpt.randomScalingFactor()]
                });
                
                let dataBarChart = {
                    name:b.Name ,
                    data:data
                }
                dataBarCharts.push(dataBarChart);
            }
           
            
        }
        this.inquiryBySourceLabel =['Marketing', 'Sale Call', 'Walk-in'];
      
        this.inquiryBySourceData = dataBarCharts;
    }

    buildSaleByServiceChart() {
        let dataBarCharts = [];
        let tmp ={Data:[]}
        for (let i = 0; i < this.rpt.rptGlobal.branch.length; i++) {
            let data=[]
            const b = this.rpt.rptGlobal.branch[i];
             tmp.Data =this.items.filter(branch => branch.IDBranch == b.Id&&!b.IsHidden);
           
            
            if (tmp.Data.length){
                tmp.Data.forEach(e => {
                    e.Date = lib.dateFormat(e.OrderDate, 'yyyy-mm-dd');                   
                    data = [this.calcSumGroupData(tmp, 'Corporate').reduce((a, b) => a + b, 0),this.calcSumGroupData(tmp, 'Personal').reduce((a, b) => a + b, 0)];
                });
                
                let dataBarChart = {
                    name:b.Name ,
                    data:data
                }
                dataBarCharts.push(dataBarChart);
            }
        }

        this.saleByServiceLabel = ['CORP', 'PERS'];
        this.saleByServiceData=dataBarCharts;
    }

    buildLostReasonChart() {
        this.lostReasonDataLabel = [
            { name: 'Full', max: 70 },
            { name: 'Budget', max: 70 },
            { name: 'Location', max: 70 },
            { name: 'Poor Follow-up', max: 70 },
            { name: 'Indecision', max: 70 },
            { name: 'Other', max: 70 }
        ]

        let dataRadarCharts = [];
        let tmp ={Data:[]}
        for (let i = 0; i < this.rpt.rptGlobal.branch.length; i++) {
            let value=[]
            const b = this.rpt.rptGlobal.branch[i];
            tmp.Data = this.items.filter(branch => branch.IDBranch == b.Id && !b.IsHidden);
             
              
            if (tmp.Data.length){
                tmp.Data.forEach(e => {                  
                    value =  [
                        this.rpt.randomScalingFactor(30, 70),
                        this.rpt.randomScalingFactor(30, 70),
                        this.rpt.randomScalingFactor(30, 70),
                        this.rpt.randomScalingFactor(30, 70),
                        this.rpt.randomScalingFactor(30, 70),
                        this.rpt.randomScalingFactor(30, 70)
                    ]
                });
                 let dataRadarChart = {
                    name: b.Name,
                    value: value
                }
                dataRadarCharts.push(dataRadarChart);
            }
             
              
        }
        this.lostReasonData = dataRadarCharts;

        // var data = {
        //     labels: ['Full', 'Budget', 'Location', 'Poor Follow-up', 'Indecision', 'Other'],
        //     datasets: []
        // };
    }

    buildSumUpInquiryLostChart() {
        let data = [
            { value: 445, name: '445 Inquiry (100%)' },
            { value: 140, name: '140 Potential (31%)' },
            { value: 78, name: '78 Tentative 18%' },
            { value: 50, name: '50 Confirm 11%' },
        ]

        let label = ['Inquiry', 'Potential', 'Tentative', 'Confirm']

        this.sumupInquiryLostLabel = label;
        this.sumupInquiryLostData = data;
    }
    
    buildTop10CustomerChart() {
        let ListTopCustomer = [];
        let ListTopCustomerName = [];
        let TopCustomerEvents = [];
        let SummaryList = [];
        let indexForListData = [];
        let tempListHold = [];
        let dataBarCharts = [];

        const uniqueID = [...new Set(this.ListOfAllEvents.map(item => item.IDContact))];
        for (let i = 0; i < uniqueID.length; i ++) {
            let Id = uniqueID[i];
            let tempDataList = this.ListOfAllEvents.filter(branch => branch.IDContact == Id);
            const uniqueIDBranch = [...new Set(tempDataList.map(item => item.IDBranch))];

            let tempTotal = 0;
            tempDataList.forEach(e => {
                tempTotal += e.TotalAfterTax;
            });

            ListTopCustomer.push({Id: Id, value: tempTotal, IDBranch: uniqueIDBranch});
        }
        indexForListData = [];
        let IDContactHolder = [];
        ListTopCustomer = ListTopCustomer.sort((n1,n2) => n2.value - n1.value).slice(0, 10);
        for (let index = 0; index < ListTopCustomer.length; index++) {
            const customer = ListTopCustomer[index];

            TopCustomerEvents = this.ListOfAllEvents.filter(branch => branch.IDContact == customer.Id);

            for (let tce = 0; tce < TopCustomerEvents.length; tce++) {
                const ele = TopCustomerEvents[tce];

                let value = IDContactHolder.find(d => d.Id == ele.IDContact);
                if (!value) {
                    IDContactHolder.push({Id: ele.IDContact});
                    const index = this.rpt.rptGlobal.branch.map(m => m.Id).indexOf(ele.IDBranch, 0);
                    indexForListData.push(index);

                    let datasets = this.rpt.buildDataset();
                    for (let i = 0; i < datasets.length; i++) {
                        const ds = datasets[i];
                        ds.Data = TopCustomerEvents.filter(eve => eve.IDBranch == ds.IDBranch);

                        ds.type = 'horizontalBar';
                        ds.fill = true;
                        ds.borderWidth = 1,
                        ds.borderColor = ds._b.Color,
                        // ds.backgroundColor = this.rpt.createHorizontalGradientStroke(ctx, width, ds._b.Color),
                        ds.hoverBackgroundColor = ds._b.Color,
                        ds.data = [];

                        for (let index = 0; index < ListTopCustomer.length; index++) {
                            ds.data.push(0);
                            // ds.data = [0,0,0,0,0,0,0,0,0,0]; 
                        }

                        for (let ltc = 0; ltc < ListTopCustomer.length; ltc++) {
                            let CalcC: any = {};
                            const topC = ListTopCustomer[ltc];
                            CalcC.Data = ds.Data.filter(eve => eve.IDContact == topC.Id);
                            ds.data[ltc] = this.calcSumGroupData(CalcC, 'TotalAfterTax').reduce((a, b) => a + b, 0);
                        }
                        tempListHold.push(ds.data);
                    }
                }
            }
            ListTopCustomerName.push(TopCustomerEvents[0].CustomerName);
        }
        let a = 0;
        let targetArray;
        for (let index = 0; index < indexForListData.length; index++) {
            const element = indexForListData[index];

            if (element == undefined) {
                targetArray;
            }
            else {
                let arrayTemplate = targetArray ? targetArray : tempListHold.slice(0,this.rpt.rptGlobal.branch.length);
                let newArray = tempListHold.slice(a,a+this.rpt.rptGlobal.branch.length);
                let arrayTemplate2 = arrayTemplate[element];
                let newArray2 = newArray[element];
                var sum;
                if (arrayTemplate2 != newArray2) {
                    sum = [...arrayTemplate2].map((e,i)=> e+newArray2[i]); //[6,8,10,12]
                }
                else {
                    sum = arrayTemplate2;
                }
                arrayTemplate[element] = sum;
                targetArray = arrayTemplate;
                a = a + this.rpt.rptGlobal.branch.length;
            }
        }
        for (let m = 0; m < this.rpt.rptGlobal.branch.length; m++) {
           
                let dataBarChart = {
                    name:this.rpt.rptGlobal.branch[m].Name,
                    data:targetArray[m],
                }
                dataBarCharts.push(dataBarChart);
        };
        this.top10CustomerLabel=ListTopCustomerName;
        this.top10CustomerData = dataBarCharts;
    }

    buildCalendarHeatmapChart() {
        let data: any = {};
        let datasets = this.rpt.buildDataset();

        this.calendarHeatmapData = {};

        if (this.rpt.rptGlobal.query.frequency == -1) {
            data = {
                labels: ['00h', '01h', '02h', '03h', '04h', '05h', '06h', '07h', '08h', '09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h', '21h', '22h', '23h'],
                datasets: []
            };
            this.rpt.rptGlobal.branch.forEach(b => {
                data.datasets.push({
                    hidden: b.IsHidden,
                    IDBranch: b.Id,
                    label: b.Name,
                    color: b.Color,
                    data: [this.rpt.randomScalingFactor(0, 1), this.rpt.randomScalingFactor(0, 1), this.rpt.randomScalingFactor(0, 1), this.rpt.randomScalingFactor(0, 0), this.rpt.randomScalingFactor(0, 0),
                    this.rpt.randomScalingFactor(0, 0), this.rpt.randomScalingFactor(0, 0), this.rpt.randomScalingFactor(30, 65), this.rpt.randomScalingFactor(0, 5), this.rpt.randomScalingFactor(0, 5),
                    this.rpt.randomScalingFactor(0, 5), this.rpt.randomScalingFactor(30, 65),
                    this.rpt.randomScalingFactor(30, 65), this.rpt.randomScalingFactor(30, 65), this.rpt.randomScalingFactor(0, 5), this.rpt.randomScalingFactor(0, 5), this.rpt.randomScalingFactor(0, 20),
                    this.rpt.randomScalingFactor(30, 65), this.rpt.randomScalingFactor(30, 65), this.rpt.randomScalingFactor(0, 5), this.rpt.randomScalingFactor(0, 2), this.rpt.randomScalingFactor(0, 2),
                    this.rpt.randomScalingFactor(0, 1), this.rpt.randomScalingFactor(0, 1)]
                })
            });
            for (let i = 0; i < data.datasets[0].data.length; i++) {
                data.datasets[0].data[i] = 0;
                for (let j = 1; j < data.datasets.length; j++) {
                    const ds = data.datasets[j];
                    data.datasets[0].data[i] += ds.data[i];
                }
            };

        }
        else if (this.rpt.rptGlobal.query.frequency == 1 || this.rpt.rptGlobal.query.frequency == 2) {

            data = {
                labels: [],
                weekLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: []
            };

            let today = new Date(this.rpt.rptGlobal.query.fromDate);

            let beginDate = new Date(this.rpt.rptGlobal.query.fromDate);
            let endDate = new Date(this.rpt.rptGlobal.query.toDate);


            //N???u nh??m theo th??ng => v??? nguy??n th??ng + 1 tu???n tr?????c, + 1 tu???n sau
            if (this.rpt.rptGlobal.query.frequency == 2) {
                beginDate = new Date(today.getFullYear(), today.getMonth(), 1);
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

                if (beginDate.getDay() == 0) {
                    beginDate.setDate(beginDate.getDate() - 6);
                } else {
                    beginDate.setDate(beginDate.getDate() - (beginDate.getDay() - 1));
                }
            }



            let rundate = new Date(beginDate);
            //calc labels
            while (rundate <= endDate) {

                data.labels.push(rundate.getDate());
                rundate.setDate(rundate.getDate() + 1);
            };

            //calc data
            for (let i = 0; i < datasets.length; i++) {
                const ds = datasets[i];

                datasets[i].Data = this.ListOfAllEvents.filter(branch => branch.IDBranch == ds.IDBranch);
                ds.Data = this.ListOfAllEvents.filter(branch => branch.IDBranch == ds.IDBranch);

                let rdate = new Date(beginDate);
                while (rdate <= endDate) {

                    if (rdate.getMonth() == today.getMonth()) {
                        let dstring = lib.dateFormat(rdate, 'yyyy-mm-dd');
                        let ev = ds.Data.filter(d => dstring == lib.dateFormat(d.OrderDate, 'yyyy-mm-dd'));
                        let tempTotal = 0;
                        if (ev.length != 0) {
                            for (let i = 0; i < ev.length; i++) {
                                tempTotal += ev[i].TotalAfterTax;
                            }
                            ds.data.push({Order: ev.length, Total: tempTotal});
                        }
                        else {
                            ds.data.push ({Order: ev.length, Total: 0})
                        }
                    }
                    else { //Kh??c th??ng hi???n t???i
                        ds.data.push(-1);
                    }
                    rdate.setDate(rdate.getDate() + 1);
                };
                data.datasets.push(ds);
            };
            data.datasets = datasets;
        }


        //calc opacity, percent
        for (let i = 0; i < data.datasets.length; i++) {
            const ds = data.datasets[i];
            ds.max = 0;
            for (let j = 0; j < ds.data.length; j++) {
                const d = ds.data[j].Order;
                if (ds.max < d) {
                    ds.max = d;
                }
            }

            for (let j = 0; j < ds.data.length; j++) {
                const d = ds.data[j];
                let percent = Math.round(d.Order / ds.max * 100); //Math.round( 10/100*255).toString(16);
                let opacity = Math.round(d.Order / ds.max * 255).toString(16);
                if (d != -1) {
                    d.Total = Math.round(d.Total / 100000) / 10; //Doanh Thu
                } 
                if (!percent) {
                    percent = 0;
                }
                if (opacity == 'NaN') {
                    opacity = '0';
                }

                let dx = { name: ds._b.Name, value: d.Order, percent: percent, opacity: opacity, total: d.Total, color: ds._b.Color};
                ds.data[j] = dx;
            }
        }

        let sumOrders = 0;
        for (let i = 0; i < data.datasets.length; i++) {
            const ds = data.datasets[i];
            sumOrders = ds.Data.map(m => m.Order).reduce((a, b) => a + b, 0);

            if (sumOrders == 0) {
                ds.hidden = true;
            };
        }

        this.calendarHeatmapData = data;
    }

    buildPnLChart() {
        let dataBarChart = [];
        
        let ListLabel = this.rpt.timeGroups.map(m => m.Label)
        let GrossProfitdataGenerator = [];
        let RevenuedataGenerator = [];
        let FixedCostdataGenerator = [];
        let VariableCostdataGenerator = [];
       
        var data = {
            labels: ListLabel,
            datasets: []
        };

        for (let index = 0; index < data.labels.length; index++) {
            GrossProfitdataGenerator.push(this.rpt.randomScalingFactor());
            RevenuedataGenerator.push(this.rpt.randomScalingFactor(90, 100) * 100000);
            FixedCostdataGenerator.push(this.rpt.randomScalingFactor(30, 30) * 100000);
            VariableCostdataGenerator.push(this.rpt.randomScalingFactor(40, 50) * 100000);
            // ds.data = [0,0,0,0,0,0,0,0,0,0]; 
        }


         this.rpt.rptGlobal.branch.forEach(b => {
            data.datasets.push({
                hidden: b.IsHidden,
                IDBranch: b.Id,
                type: 'line',
                showLine: true,
                fill: false,
                label: b.Name + ' - Gross profit',
                borderColor: b.Color,
                // backgroundColor: b.Color + '77',
                // backgroundColor: this.rpt.createVerticalGradientStroke(ctx, height, b.Color),
                hoverBackgroundColor: b.Color,
                data: GrossProfitdataGenerator,
            });
        });

        this.rpt.rptGlobal.branch.forEach(b => {
            data.datasets.push({
                hidden: b.IsHidden,
                IDBranch: b.Id,
                type: 'bar',
                stack: b.Name + 'Revenue',
                label: b.Name + ' - Revenue',
                fill: true,
                borderWidth: 1,
                borderColor: b.Color,
                // backgroundColor: this.rpt.createVerticalGradientStroke(ctx, height * 3, b._b.Color), //'#37d16a',
                // backgroundColor: this.rpt.createVerticalGradientStroke(ctx, height * 3, b.Color), //'#37d16a',
                hoverBackgroundColor: b.Color,
                data: RevenuedataGenerator,
            });
        });

        this.rpt.rptGlobal.branch.forEach(b => {
            data.datasets.push({
                hidden: b.IsHidden,
                IDBranch: b.Id,
                type: 'bar',
                label: b.Name + ' - Fixed cost',
                stack: b.Name + 'COGS',
                fill: true,
                borderWidth: 1,
                borderColor: b.Color,
                // backgroundColor: this.rpt.createVerticalGradientStroke(ctx, height * 3, b.Color), //'#ffce00'
                hoverBackgroundColor: b.Color,
                data: FixedCostdataGenerator,
            });
        });

     

        //stack COGS - Variable cost
        this.rpt.rptGlobal.branch.forEach(b => {
            data.datasets.push({
                hidden: b.IsHidden,
                IDBranch: b.Id,
                type: 'bar',
                stack: b.Name + 'COGS',
                label: b.Name + ' - Variable cost',
                fill: true,
                borderWidth: 1,
                borderColor: b.Color,
                // backgroundColor: this.rpt.createVerticalGradientStroke(ctx, height * 3, b.Color), //'#de4848'
                hoverBackgroundColor: b.Color,
                data: VariableCostdataGenerator,
            });
        });


        //Gross profit CALC
        for (let j = 0; j < data.labels.length; j++) {
            
         
            //Gross profit             //Revenue                  //Fixed cost                //Variable cost
            data.datasets[0].data[j] = data.datasets[9].data[j]  - data.datasets[18].data[j] - data.datasets[27].data[j]; //InHoldings
            data.datasets[1].data[j] = data.datasets[10].data[j] - data.datasets[19].data[j] - data.datasets[28].data[j]; //InHospitality
            data.datasets[2].data[j] = data.datasets[11].data[j] - data.datasets[20].data[j] - data.datasets[29].data[j]; //InDevelopment
            data.datasets[3].data[j] = data.datasets[12].data[j] - data.datasets[21].data[j] - data.datasets[30].data[j]; //DongXuan
            data.datasets[4].data[j] = data.datasets[13].data[j] - data.datasets[22].data[j] - data.datasets[31].data[j]; //MyXuan
            data.datasets[5].data[j] = data.datasets[14].data[j] - data.datasets[23].data[j] - data.datasets[32].data[j]; //XuanNam
            data.datasets[6].data[j] = data.datasets[15].data[j] - data.datasets[24].data[j] - data.datasets[33].data[j]; //PQTM
            data.datasets[7].data[j] = data.datasets[16].data[j] - data.datasets[25].data[j] - data.datasets[34].data[j]; //MetaFood
            data.datasets[8].data[j] = data.datasets[17].data[j] - data.datasets[26].data[j] - data.datasets[35].data[j]; //06NBK
            
        }
     
        let d = {
            name:data.datasets[0].label,
            data: data.datasets[0].data,
        }
        dataBarChart.push(d);
        data.datasets;
        this.PnLData=dataBarChart
        this.PnLLabel = this.rpt.timeGroups.map(m => m.Label)
    }

    buildCashFlowChart() {
        let dataBarChart = [];
        let ListLabel = this.rpt.timeGroups.map(m => m.Label)
        let CashBalancedataGenerator = [];
        let CashIndataGenerator = [];
        let CashOutdataGenerator = [];
        this.cashFlowLabel=this.rpt.timeGroups.map(m => m.Label)
        
        var data = {
            labels: ListLabel,
            datasets: []
        };

        for (let index = 0; index < data.labels.length; index++) {
            CashBalancedataGenerator.push(this.rpt.randomScalingFactor());
            CashIndataGenerator.push(this.rpt.randomScalingFactor(90, 100) * 1000000);
            CashOutdataGenerator.push(this.rpt.randomScalingFactor(50, 80) * 1000000);
            // ds.data = [0,0,0,0,0,0,0,0,0,0]; 
        }

        //Lines Cash balance
        this.rpt.rptGlobal.branch.forEach(b => {
            data.datasets.push({
                hidden: b.IsHidden,
                IDBranch: b.Id,
                type: 'line',
                showLine: true,
                fill: false,
                label: b.Name + ' - Cash balance',
                borderColor: b.Color,
                // backgroundColor: b.Color + '77',
                // backgroundColor: this.rpt.createVerticalGradientStroke(ctx, height * 3, b.Color),
                hoverBackgroundColor: b.Color,
                data: CashBalancedataGenerator,
            });
        });

        //stack Cash - in
        this.rpt.rptGlobal.branch.forEach(b => {
            data.datasets.push({
                hidden: b.IsHidden,
                IDBranch: b.Id,
                type: 'bar',
                stack: b.Name + 'In',
                label: b.Name + ' - Cash In',
                fill: true,
                borderWidth: 1,
                borderColor: b.Color,
                // backgroundColor: this.rpt.createVerticalGradientStroke(ctx, height * 3, b.Color), //'#37d16a',
                hoverBackgroundColor: b.Color,
                data: CashIndataGenerator,
            });
        });



        //stack Cash - out
        this.rpt.rptGlobal.branch.forEach(b => {
            data.datasets.push({
                hidden: b.IsHidden,
                IDBranch: b.Id,
                type: 'bar',
                stack: b.Name + 'Out',
                label: b.Name + ' - Cash Out',
                fill: true,
                borderWidth: 1,
                borderColor: b.Color,
                // backgroundColor: this.rpt.createVerticalGradientStroke(ctx, height * 3, b.Color), //#de4848
                hoverBackgroundColor: b.Color,
                data: CashOutdataGenerator,
            });
        });

        //Cash balance CALC
        for (let j = 0; j < data.labels.length; j++) {

            //Cash balance             //In                       //Out                
            data.datasets[0].data[j] = data.datasets[9].data[j]  - data.datasets[18].data[j]; //InHoldings
            data.datasets[1].data[j] = data.datasets[10].data[j] - data.datasets[19].data[j]; //InHospitality
            data.datasets[2].data[j] = data.datasets[11].data[j] - data.datasets[20].data[j]; //InDevelopment
            data.datasets[3].data[j] = data.datasets[12].data[j] - data.datasets[21].data[j]; //DongXuan
            data.datasets[4].data[j] = data.datasets[13].data[j] - data.datasets[22].data[j]; //MyXuan
            data.datasets[5].data[j] = data.datasets[14].data[j] - data.datasets[23].data[j]; //XuanNam
            data.datasets[6].data[j] = data.datasets[15].data[j] - data.datasets[24].data[j]; //PQTM
            data.datasets[7].data[j] = data.datasets[16].data[j] - data.datasets[25].data[j]; //MetaFood
            data.datasets[8].data[j] = data.datasets[17].data[j] - data.datasets[26].data[j]; //06NBK
        }

        let d = {
            name:data.datasets[0].label,
            data: data.datasets[0].data,
        }
        dataBarChart.push(d);
        this.cashFlowData=dataBarChart
    }
}
