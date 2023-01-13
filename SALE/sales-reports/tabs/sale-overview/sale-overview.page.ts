import { Component, ViewChild } from '@angular/core';
import { ActionSheetController, NavController, Platform } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { ReportService } from 'src/app/services/report.service';
import { lib } from 'src/app/services/static/global-functions';
import Chart from 'chart.js';
import 'chartjs-plugin-labels';
import 'chartjs-funnel';
import { CustomService } from 'src/app/services/custom.service';

@Component({
    selector: 'app-sale-overview',
    templateUrl: 'sale-overview.page.html',
    styleUrls: ['sale-overview.page.scss']
})
export class SaleOverviewPage extends PageBase {
    charts;
    @ViewChild('chartName') chartName;
    @ViewChild('doanhThuChiTieu') doanhThuChiTieu;
  

    constructor(
        private pageService: CustomService,
        public actionSheetController: ActionSheetController,
        public env: EnvService,
        public navCtrl: NavController,
        private platform: Platform,
        public rpt: ReportService,
    ) {
        super();
        this.charts = {
            chartName: { IsLoading: true, IsNoData: false, Chart: null },
            doanhThuChiTieu: { IsLoading: true, IsNoData: false, Chart: null },
            
        };
        this.pageConfig.subscribeReportQueryEvent = this.rpt.Tracking().subscribe((data) => {

           console.log('subscribeReportQueryEvent');
        });

    }

    ngOnDestroy() {
        this.pageConfig.subscribeReportQueryEvent.unsubscribe();
        super.ngOnDestroy();
    }

    ionViewDidEnter() {
        this.buildCharts();
    }

    refresh() {
        for (var key in this.charts) {
            let c = this.charts[key].Chart;
            c?.destroy();
        }

        this.buildCharts();
    }

    changeDateFillter(type) {
        this.rpt.dateQuery(type).then(_ => {
            this.refresh();
        }).catch(err => { let a = err });
    }

    changeFrequency(f) {
        this.rpt.rptGlobal.query.frequency = f.Id;

        if (f.Id == 1) {
            this.rpt.rptGlobal.query.fromDate = '2020-01-06';
            this.rpt.rptGlobal.query.toDate = '2020-01-12';
        }
        else if (f.Id == 2) {
            this.rpt.rptGlobal.query.fromDate = '2020-01-01';
            this.rpt.rptGlobal.query.toDate = '2020-01-31';
        }

        this.changeDateFillter('setdone');

    }

    

    toogleBranchDataset(b) {
        b.IsHidden = !b.IsHidden;
        for (var key in this.charts) {
            let c = this.charts[key].Chart;

            c.data.datasets.forEach(function (ds) {
                if (ds.IDBranch == b.Id) {
                    ds.hidden = b.IsHidden;
                }
            });
            c.update();
        }
        
    }

    buildCharts() {
        
        this.doanhThuChiTieuBuild();

        this.chartNameBuild();
    }
    doanhThuChiTieuBuild() {
        let ctx = this.doanhThuChiTieu.nativeElement;

        this.charts?.doanhThuChiTieu?.Chart?.destroy();

        //ctx.height = 255;
        var width = ctx.width;
        var height = ctx.height;
        ctx = ctx.getContext("2d");

        var data = {
            labels: this.rpt.timeGroups.map(m => m.Label),
            datasets: []
        };

        let datasetsChiTieu = this.rpt.buildDataset();
        for (let i = 0; i < datasetsChiTieu.length; i++) {
            const ds = datasetsChiTieu[i];
            ds.type = 'line';
            ds.showLine = true;
            ds.fill = false;
            ds.label = ds._b.Name + ' - Chỉ tiêu';
            ds.borderColor = ds._b.Color + '77';
            ds.backgroundColor = ds._b.Color + '77';
            ds.hoverBackgroundColor = ds._b.Color + 'CC';

            ds.data = this.rpt.calcSumGroupData(ds, 'SaleTarget');
        }

        let datasetsDoanhThu = this.rpt.buildDataset();
        for (let i = 0; i < datasetsDoanhThu.length; i++) {
            const ds = datasetsDoanhThu[i];
            ds.type = 'bar';
            ds.label = ds._b.Name + ' - Doanh thu';
            ds.fill = true;
            ds.borderWidth = 1;
            ds.borderColor = ds._b.Color;
            ds.backgroundColor = this.rpt.createVerticalGradientStroke(ctx, height, ds._b.Color);
            ds.hoverBackgroundColor = ds._b.Color;
            ds.data = this.rpt.calcSumGroupData(ds, 'DoanhThu');
        }




        data.datasets = data.datasets.concat(datasetsChiTieu);
        data.datasets = data.datasets.concat(datasetsDoanhThu);

        // for (let i = 0; i < data.datasets[4].data.length; i++) {
        //     data.datasets[4].data[i] = 0;
        //     for (let j = 5; j < data.datasets.length; j++) {
        //         const ds = data.datasets[j];
        //         data.datasets[4].data[i] += ds.data[i];
        //     }
        // }

        this.charts.doanhThuChiTieu.Chart = new Chart(ctx, {
            type: 'bar',
            options: {
                maintainAspectRatio: false,
                responsive: true,

                layout: {
                    padding: {
                        top: 20,
                    }
                },
                legend: {
                    display: false,
                    labels: {
                        fontColor: '#FFF',
                        usePointStyle: true,
                        boxWidth: 8,
                    }
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    callbacks: {
                        label: function (tooltipItem, data) {
                            var value = lib.currencyFormatFriendly( data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] );
                            var label = data.datasets[tooltipItem.datasetIndex].label;
                            return label + ': '+ value;
                        }
                    }
                },
                hover: {
                    mode: 'index',
                    intersect: false
                },
                elements: {
                    point: {
                        radius: 0,
                        hoverRadius: 4,
                        backgroundColor: ()=>lib.getCssVariableValue('--ion-color-primary') + 'e6',
                        borderWidth: 1,
                        hoverBorderWidth: 2
                    },
                    line: {
                        borderWidth: 3
                    }
                },
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                fontColor: ()=>lib.getCssVariableValue('--ion-color-primary'),
                                fontSize: 12,
                                maxTicksLimit: 8,
                                padding: 20,
                                userCallback: function(value, index, values) {
                                    return lib.currencyFormatFriendly(value); 
                                }
                            },
                            gridLines: {
                                color: ()=>lib.getCssVariableValue('--ion-color-primary') + '80',
                                display: true,
                                drawTicks: false,
                                drawBorder: false,
                                zeroLineColor: ()=>lib.getCssVariableValue('--ion-color-primary') + 'e6',
                            }
                        }
                    ],
                    xAxes: [
                        {
                            ticks: {
                                fontColor: ()=>lib.getCssVariableValue('--ion-color-primary'),
                                fontSize: 10,
                                //maxTicksLimit: 7,
                                padding: 15,
                                
                            },
                            gridLines: { 

                                display: false,
                                drawTicks: false,
                                drawBorder: false,
                            }
                        }
                    ]
                },
                plugins: {
                    labels: {
                        render: () => { },
                        fontSize: 12,

                    },
                },
            },
            data: data,
        });
    }

    chartNameBuild() {

        
    }
}
