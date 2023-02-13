import { Component, ViewChild } from '@angular/core';
import { ActionSheetController, NavController, Platform } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';

import { ReportService } from 'src/app/services/report.service';
import { lib } from 'src/app/services/static/global-functions';
import { SALE_OrderProvider } from 'src/app/services/static/services.service';
import { CustomService } from 'src/app/services/custom.service';

@Component({
    selector: 'app-sale-daily-report',
    templateUrl: 'sale-daily-report.page.html',
    styleUrls: ['sale-daily-report.page.scss']
})
export class SaleDailyReportPage extends PageBase {
    isShowFeature = true;

    calendarHeatmapData: any = {};
    selectedHeatNode = { value: 5, color: ()=>lib.getCssVariableValue('--ion-color-primary'), opacity: 'ff' };

    dataPnL = [
        {
            title: 'Gross Revenues <br> Doanh thu gộp', value: 100,
            data: [
                { title: 'Wedding <br> Tiệc cưới', value: 70 },
                { title: 'Events <br> Tiệc công ty', value: 25 },
                { title: 'Others <br> Khác', value: 5 },
            ]
        },
        { title: 'Deductions <br> Giảm trừ doanh thu', value: 0 },
        {
            title: 'Net Revenues <br> Doanh thu thuần', value: 100,
            data: [
                { title: 'Wedding <br> Tiệc cưới', value: 70 },
                { title: 'Events <br> Tiệc công ty', value: 25 },
                { title: 'Others <br> Khác', value: 5 },
            ]
        },
        {
            title: 'COGS (Variable cost) <br> Giá vốn (Biến phí)', value: -75,
            data: [
                { title: 'Foods <br> Thức ăn', value: -50 },
                { title: 'Berevage <br> Thức uống', value: -20 },
                { title: 'Daily staff cost (CL) <br> Nhân công trực tiếp (CL)', value: -5 },
            ]
        },
        {
            title: 'COGS (Fixed cost) <br> Giá vốn (Định phí)', value: -5,
            data: [
                { title: 'Staff cost <br> Nhân công trực tiếp', value: -5 },
                { title: 'Others <br> Chi phí khác', value: 0 },
            ]
        },
        { title: 'Gross profit <br> Lợi nhuận gộp', value: 25 },
    ];
    dataCashFlow = [
        { title: 'Cash-in <br> Dòng tiền vào', value: 30 },
        { title: 'Cash-out <br> Dòng tiền ra', value: 20 },
        { title: 'Cash available for use <br> Tiền khả dụng', value: 15 },
    ];

    PnLChartLabel = [];
    PnLChartData = [];

    CashFlowChartLabel = [];
    CashFlowChartData = [];

    soLuongTiecChart: any;
    @ViewChild('soLuongTiecCanvas') soLuongTiecCanvas;

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
    }

    ionViewDidEnter(){
      
        this.buildPnLChart();
        this.buildCashFlowChart();
    }

    buildPnLChart() {
        let ctx = this.pnlCanvas.nativeElement;
        //ctx.height = 255;
        var width = ctx.width;
        var height = ctx.height;
        ctx = ctx.getContext("2d");


        var data = {
            labels: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
            datasets: []
        };

        //Lines Gross profit
        this.rpt.rptGlobal.branch.forEach(b => {
            data.datasets.push({
                hidden: b.IsHidden,
                IDBranch: b.Id,
                type: 'line',
                showLine: true,
                fill: false,
                label: b.Name + ' - Gross profit',
                borderColor: b.Color + '77',
                backgroundColor: b.Color + '77',
                hoverBackgroundColor: b.Color + 'CC',
                data: [this.rpt.randomScalingFactor(), this.rpt.randomScalingFactor(), this.rpt.randomScalingFactor(), this.rpt.randomScalingFactor(), this.rpt.randomScalingFactor(), this.rpt.randomScalingFactor(), this.rpt.randomScalingFactor()]
            });
        });

        for (let i = 0; i < data.datasets[0].data.length; i++) {
            data.datasets[0].data[i] = 0;
            for (let j = 1; j < data.datasets.length; j++) {
                const ds = data.datasets[j];
                data.datasets[0].data[i] += ds.data[i];
            }
        }


        //stack Revenue
        this.rpt.rptGlobal.branch.forEach(b => {
            data.datasets.push({
                hidden: b.IsHidden,
                IDBranch: b.Id,
                // type: 'bar',
                stack: b.Name + 'Revenue',
                label: b.Name + ' - Revenue',
                fill: true,
                borderWidth: 2,
                borderColor: b.Color,
                backgroundColor: this.rpt.createVerticalGradientStroke(ctx, height * 3, '#37d16a'), //'#37d16a',
                hoverBackgroundColor: b.Color,
                data: [
                    this.rpt.randomScalingFactor(60, 100), this.rpt.randomScalingFactor(20, 30),
                    this.rpt.randomScalingFactor(40, 70), this.rpt.randomScalingFactor(50, 80),
                    this.rpt.randomScalingFactor(40, 80), this.rpt.randomScalingFactor(60, 90),
                    this.rpt.randomScalingFactor(60, 100)]
            });
        });

        for (let i = 0; i < data.datasets[4].data.length; i++) {
            data.datasets[4].data[i] = 0;
            for (let j = 5; j < data.datasets.length; j++) {
                const ds = data.datasets[j];
                data.datasets[4].data[i] += ds.data[i];
            }
        }

        //stack COGS - Fixed cost
        this.rpt.rptGlobal.branch.forEach(b => {
            data.datasets.push({
                hidden: b.IsHidden,
                IDBranch: b.Id,
                // type: 'bar',
                stack: b.Name + 'COGS',
                label: b.Name + ' - Fixed cost',
                fill: true,
                borderWidth: 2,
                borderColor: b.Color,
                backgroundColor: this.rpt.createVerticalGradientStroke(ctx, height * 9, '#ffce00'),
                hoverBackgroundColor: b.Color,
                data: [
                    this.rpt.randomScalingFactor(0, 10), this.rpt.randomScalingFactor(0, 10),
                    this.rpt.randomScalingFactor(0, 10), this.rpt.randomScalingFactor(0, 10),
                    this.rpt.randomScalingFactor(0, 10), this.rpt.randomScalingFactor(0, 10),
                    this.rpt.randomScalingFactor(0, 10)]
            });
        });

        for (let i = 0; i < data.datasets[8].data.length; i++) {
            data.datasets[8].data[i] = 0;
            for (let j = 9; j < data.datasets.length; j++) {
                const ds = data.datasets[j];
                data.datasets[8].data[i] += ds.data[i];
            }
        }

        //stack COGS - Variable cost
        this.rpt.rptGlobal.branch.forEach(b => {
            data.datasets.push({
                hidden: b.IsHidden,
                IDBranch: b.Id,
                // type: 'bar',
                stack: b.Name + 'COGS',
                label: b.Name + ' - Variable cost',
                fill: true,
                borderWidth: 2,
                borderColor: b.Color,
                backgroundColor: this.rpt.createVerticalGradientStroke(ctx, height * 9, '#de4848'),
                hoverBackgroundColor: b.Color,
                data: [
                    this.rpt.randomScalingFactor(0, 30), this.rpt.randomScalingFactor(0, 30),
                    this.rpt.randomScalingFactor(0, 30), this.rpt.randomScalingFactor(0, 30),
                    this.rpt.randomScalingFactor(0, 30), this.rpt.randomScalingFactor(0, 30),
                    this.rpt.randomScalingFactor(0, 30)]

            });
        });

        for (let i = 0; i < data.datasets[12].data.length; i++) {
            data.datasets[12].data[i] = 0;
            for (let j = 13; j < data.datasets.length; j++) {
                const ds = data.datasets[j];
                data.datasets[12].data[i] += ds.data[i];
            }
        }

        //Gross profit CALC

        for (let j = 0; j < data.labels.length; j++) {



            //Gross profit             //Revenue                  //Fixed cost                //Variable cost
            data.datasets[0].data[j] = data.datasets[4].data[j] - data.datasets[8].data[j] - data.datasets[12].data[j]; //All
            data.datasets[1].data[j] = data.datasets[5].data[j] - data.datasets[9].data[j] - data.datasets[13].data[j]; //GEM
            data.datasets[2].data[j] = data.datasets[6].data[j] - data.datasets[10].data[j] - data.datasets[14].data[j]; //WP
            data.datasets[3].data[j] = data.datasets[7].data[j] - data.datasets[11].data[j] - data.datasets[15].data[j]; //PVD



        }

        this.PnLChartLabel = this.rpt.timeGroups.map(m => m.Label);
        this.PnLChartData = data.datasets;


        // this.pnlChart = new Chart(ctx, {
        //     type: 'bar',
        //     options: {
        //         maintainAspectRatio: false,
        //         responsive: true,

        //         layout: {
        //             padding: {
        //                 top: 20,
        //             }
        //         },
        //         legend: {
        //             display: false,
        //             labels: {
        //                 fontColor: '#FFF',
        //                 usePointStyle: true,
        //                 boxWidth: 8,

        //             }
        //         },
        //         tooltips: {
        //             mode: 'index',
        //             intersect: false,
        //             backgroundColor: 'rgba(0, 0, 0, 0.5)',
        //         },
        //         hover: {
        //             mode: 'index',
        //             intersect: false
        //         },
        //         elements: {
        //             point: {
        //                 radius: 0,
        //                 hoverRadius: 4,
        //                 backgroundColor: ()=>lib.getCssVariableValue('--ion-color-primary') + 'e6',
        //                 borderWidth: 1,
        //                 hoverBorderWidth: 2
        //             },
        //             line: {
        //                 borderWidth: 3
        //             }
        //         },
        //         scales: {
        //             yAxes: [
        //                 {
        //                     ticks: {
        //                         fontColor: ()=>lib.getCssVariableValue('--ion-color-primary'),
        //                         fontSize: 12,
        //                         maxTicksLimit: 8,
        //                         padding: 20
        //                     },
        //                     gridLines: {
        //                         color: ()=>lib.getCssVariableValue('--ion-color-primary') + '80',
        //                         display: true,
        //                         drawTicks: false,
        //                         drawBorder: false,
        //                         zeroLineColor: ()=>lib.getCssVariableValue('--ion-color-primary') + 'e6',
        //                     }
        //                 }
        //             ],
        //             xAxes: [
        //                 {
        //                     ticks: {
        //                         fontColor: ()=>lib.getCssVariableValue('--ion-color-primary'),
        //                         fontSize: 10,
        //                         //maxTicksLimit: 7,
        //                         padding: 15
        //                     },
        //                     gridLines: {

        //                         display: false,
        //                         drawTicks: false,
        //                         drawBorder: false,
        //                     }
        //                 }
        //             ]
        //         },
        //         plugins: {
        //             labels: {
        //                 render: () => { },
        //                 fontSize: 12,

        //             },
        //         },
        //     },
        //     data: data,
        // });
    }

    buildCashFlowChart() {
        let ctx = this.cashFlowCanvas.nativeElement;
        //ctx.height = 255;
        var width = ctx.width;
        var height = ctx.height;
        ctx = ctx.getContext("2d");


        var data = {
            labels: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
            datasets: []
        };

        //Lines Cash balance
        this.rpt.rptGlobal.branch.forEach(b => {
            data.datasets.push({
                hidden: b.IsHidden,
                IDBranch: b.Id,
                type: 'line',
                showLine: true,
                fill: false,
                label: b.Name + ' Cash balance',
                borderColor: b.Color + '77',
                backgroundColor: b.Color + '77',
                hoverBackgroundColor: b.Color + 'CC',
                data: [0, 0, 0, 0, 0, 0, 0]
            });
        });

        //stack Cash - in
        this.rpt.rptGlobal.branch.forEach(b => {
            data.datasets.push({
                hidden: b.IsHidden,
                IDBranch: b.Id,
                // type: 'bar',
                stack: b.Name + 'In',
                label: b.Name + ' Cash - in',
                fill: true,
                borderWidth: 2,
                borderColor: b.Color,
                backgroundColor: this.rpt.createVerticalGradientStroke(ctx, height * 3, '#37d16a'), //'#37d16a',
                hoverBackgroundColor: b.Color,
                data: [
                    this.rpt.randomScalingFactor(60, 100), this.rpt.randomScalingFactor(20, 30),
                    this.rpt.randomScalingFactor(40, 70), this.rpt.randomScalingFactor(50, 80),
                    this.rpt.randomScalingFactor(40, 80), this.rpt.randomScalingFactor(60, 90),
                    this.rpt.randomScalingFactor(60, 100)]
            });
        });

        for (let i = 0; i < data.datasets[4].data.length; i++) {
            data.datasets[4].data[i] = 0;
            for (let j = 5; j < data.datasets.length; j++) {
                const ds = data.datasets[j];
                data.datasets[4].data[i] += ds.data[i];
            }
        }

        //stack Cash - out
        this.rpt.rptGlobal.branch.forEach(b => {
            data.datasets.push({
                hidden: b.IsHidden,
                IDBranch: b.Id,
                // type: 'bar',
                stack: b.Name + 'Out',
                label: b.Name + ' Cash - out',
                fill: true,
                borderWidth: 2,
                borderColor: b.Color,
                backgroundColor: this.rpt.createVerticalGradientStroke(ctx, height * 9, '#de4848'),
                hoverBackgroundColor: b.Color,
                data: [
                    this.rpt.randomScalingFactor(0, 10), this.rpt.randomScalingFactor(0, 10),
                    this.rpt.randomScalingFactor(0, 10), this.rpt.randomScalingFactor(0, 10),
                    this.rpt.randomScalingFactor(0, 10), this.rpt.randomScalingFactor(0, 10),
                    this.rpt.randomScalingFactor(0, 10)]
            });
        });

        for (let i = 0; i < data.datasets[8].data.length; i++) {
            data.datasets[8].data[i] = 0;
            for (let j = 9; j < data.datasets.length; j++) {
                const ds = data.datasets[j];
                data.datasets[8].data[i] += ds.data[i];
            }
        }

        //Cash balance CALC
        for (let j = 0; j < data.labels.length; j++) {



            //Gross profit             //In                       //Out                
            data.datasets[0].data[j] = data.datasets[4].data[j] - data.datasets[8].data[j]; //All
            data.datasets[1].data[j] = data.datasets[5].data[j] - data.datasets[9].data[j]; //GEM
            data.datasets[2].data[j] = data.datasets[6].data[j] - data.datasets[10].data[j]; //WP
            data.datasets[3].data[j] = data.datasets[7].data[j] - data.datasets[11].data[j]; //PVD



        }

        this.CashFlowChartLabel = this.rpt.timeGroups.map(m => m.Label);
        this.CashFlowChartData = data.datasets;

        // this.cashFlowChart = new Chart(ctx, {
        //     type: 'bar',
        //     options: {
        //         maintainAspectRatio: false,
        //         responsive: true,

        //         layout: {
        //             padding: {
        //                 top: 20,
        //             }
        //         },
        //         legend: {
        //             display: false,
        //             labels: {
        //                 fontColor: '#FFF',
        //                 usePointStyle: true,
        //                 boxWidth: 8,

        //             }
        //         },
        //         tooltips: {
        //             mode: 'index',
        //             intersect: false,
        //             backgroundColor: 'rgba(0, 0, 0, 0.5)',
        //         },
        //         hover: {
        //             mode: 'index',
        //             intersect: false
        //         },
        //         elements: {
        //             point: {
        //                 radius: 0,
        //                 hoverRadius: 4,
        //                 backgroundColor: ()=>lib.getCssVariableValue('--ion-color-primary') + 'e6',
        //                 borderWidth: 1,
        //                 hoverBorderWidth: 2
        //             },
        //             line: {
        //                 borderWidth: 3
        //             }
        //         },
        //         scales: {
        //             yAxes: [
        //                 {
        //                     ticks: {
        //                         fontColor: ()=>lib.getCssVariableValue('--ion-color-primary'),
        //                         fontSize: 12,
        //                         maxTicksLimit: 8,
        //                         padding: 20
        //                     },
        //                     gridLines: {
        //                         color: ()=>lib.getCssVariableValue('--ion-color-primary') + '80',
        //                         display: true,
        //                         drawTicks: false,
        //                         drawBorder: false,
        //                         zeroLineColor: ()=>lib.getCssVariableValue('--ion-color-primary') + 'e6',
        //                     }
        //                 }
        //             ],
        //             xAxes: [
        //                 {
        //                     ticks: {
        //                         fontColor: ()=>lib.getCssVariableValue('--ion-color-primary'),
        //                         fontSize: 10,
        //                         //maxTicksLimit: 7,
        //                         padding: 15
        //                     },
        //                     gridLines: {

        //                         display: false,
        //                         drawTicks: false,
        //                         drawBorder: false,
        //                     }
        //                 }
        //             ]
        //         },
        //         plugins: {
        //             labels: {
        //                 render: () => { },
        //                 fontSize: 12,

        //             },
        //         },
        //     },
        //     data: data,
        // });
    }




    changeDateFillter(type) {
        this.rpt.dateQuery(type);
    }

    toogleBranchDataset(b) {
        b.IsHidden = !b.IsHidden;

        let charts = [
            this.soLuongTiecChart,
            this.pnlChart,
            this.cashFlowChart,
        ];

        charts.forEach(c => {
            c.data.datasets.forEach(function (ds) {
                if (ds.IDBranch == b.Id) {
                    ds.hidden = b.IsHidden;
                }
            });
            c.update();
        });
    }

    randomScalingFactor(min = 30, max = 100) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

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
