import { Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { AlertController, IonSearchbar, LoadingController, ModalController, NavController, PopoverController } from '@ionic/angular';
import { CompactType, DisplayGrid, Draggable, GridType, GridsterConfig, GridsterItem, PushDirections, Resizable } from 'angular-gridster2';
import { BIReport, ReportDataConfig } from 'src/app/models/options-interface';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { ReportService } from 'src/app/services/report.service';
import { BRA_BranchProvider, WMS_ZoneProvider } from 'src/app/services/static/services.service';

interface Safe extends GridsterConfig {
    draggable: Draggable;
    resizable: Resizable;
    pushDirections: PushDirections;
}

@Component({
    selector: 'app-dynamic-dashboard',
    templateUrl: 'dynamic-dashboard.page.html',
    styleUrls: ['dynamic-dashboard.page.scss'],

})
export class DynamicDashboardPage extends PageBase {
    @ViewChild('reportSearch') searchBar: IonSearchbar;
    options: Safe;
    items: Array<GridsterItem>;
    isAddReportModalOpen = false;

    reportSearchKeyword = '';


    constructor(
        public rpt: ReportService,

        public branchProvider: BRA_BranchProvider,
        public modalController: ModalController,
        public popoverCtrl: PopoverController,
        public alertCtrl: AlertController,
        public loadingController: LoadingController,
        public env: EnvService,
        public navCtrl: NavController,
        public location: Location,
    ) {
        super();
        this.pageConfig.isDesignMode = false;


    }

    preLoadData(event?: any): void {



        this.item = {
            MinCols: 4,
            MaxCols: 4,
            MinRows: 1,
            MaxRows: 100,
        };
        this.options = {
            itemChangeCallback: DynamicDashboardPage.itemChange,
            //initCallback: DynamicDashboardPage.initCallback,

            displayGrid: DisplayGrid.None,
            margin: 16,
            mobileBreakpoint: 640,
            gridType: GridType.VerticalFixed,
            fixedRowHeight: 340,//162,
            keepFixedHeightInMobile: true,
            setGridSize: true,

            //enableBoundaryControl: true,
            draggable: { enabled: false },
            resizable: { enabled: false },
            pushItems: false,
            pushDirections: { north: true, east: true, south: true, west: true },
            swap: true,

            minCols: this.item.MinCols,
            maxCols: this.item.MaxCols,
            minRows: this.item.MinRows,
            maxRows: this.item.MaxRows,
        };

        this.items = [
            {"x":0,"y":0,"cols":1,"rows":1,"IDReport":3,"Id":0},
            {"x":1,"y":0,"cols":1,"rows":1,"IDReport":5,"Id":0},
            {"x":2,"y":0,"cols":2,"rows":1,"IDReport":1,"Id":0},
            {"x":0,"y":1,"cols":2,"rows":1,"IDReport":4,"Id":0},
            {"x":2,"y":1,"cols":1,"rows":1,"IDReport":2,"Id":0},
            {"x":3,"y":1,"cols":1,"rows":1,"IDReport":10,"Id":0},
            {"x":0,"y":2,"cols":1,"rows":1,"IDReport":11,"Id":0},
            {"x":1,"y":2,"cols":1,"rows":2,"IDReport":13,"Id":0},
            {"x":2,"y":2,"cols":2,"rows":2,"IDReport":12,"Id":0},
            {"x":0,"y":3,"cols":1,"rows":1,"IDReport":13,"Id":0},
            {"x":0,"y":4,"cols":3,"rows":1,"IDReport":7,"Id":0},
            {"x":3,"y":4,"cols":1,"rows":1,"IDReport":6,"Id":0},
            {"x":0,"y":5,"cols":1,"rows":1,"IDReport":17,"Id":0},
            {"x":1,"y":5,"cols":1,"rows":1,"IDReport":16,"Id":0},
            {"x":2,"y":5,"cols":1,"rows":1,"IDReport":15,"Id":0},
            {"x":3,"y":5,"cols":1,"rows":1,"IDReport":14,"Id":0}


            // { x: 0, y: 0, cols: 1, rows: 1, Id: 1, IDReport: 3 },
            // { x: 2, y: 0, cols: 3, rows: 1, Id: 2, IDReport: 1 },
            // { x: 0, y: 1, cols: 2, rows: 1, Id: 3, IDReport: 2 },
            // { x: 3, y: 1, cols: 2, rows: 1, Id: 4, IDReport: 4 },

            // { cols: 2, rows: 2, y: 2, x: 0, minItemRows: 2, minItemCols: 2, maxItemRows: 3, maxItemCols: 4, label: 'Min rows & cols = 2', Id: 1 },
        ];

        super.loadedData(event);
    }

    loadData(event?: any): void {
        this.preLoadData(event);
    }

    ionViewDidEnter() {
        super.ionViewDidEnter();

        //Resize grid when parent dom resize
        var chartDom = document.getElementById('dashboard');
        new ResizeObserver(() => this.options?.api?.resize()).observe(chartDom);
    }

    /**
     * On change dashboard
     * @param item Report item
     * @param itemComponent The component
     */
    static itemChange(item, itemComponent) {
        console.info('itemChanged', item, itemComponent);
    }

    static itemResize(item, itemComponent) {
        console.info('itemResized', item, itemComponent);
    }

    static initCallback(ev) {
        console.log(ev);
    }

    /**
     * Toggle drag and resize mode to edit dashboard
     */
    toggleDesign(): void {
        if (this.options.api && this.options.api.optionsChanged) {
            this.options.draggable.enabled = !this.options.draggable.enabled;
            this.options.resizable.enabled = !this.options.resizable.enabled;
            this.options.displayGrid = this.options.resizable.enabled ? DisplayGrid.Always : DisplayGrid.None;
            this.options.api.optionsChanged();
        }
    }

    /**
     * Remove report from dashboard
     * @param item report item
     */
    removeItem(item): void {
        // $event.preventDefault();
        // $event.stopPropagation();
        this.items.splice(this.items.indexOf(item), 1);

        setTimeout(() => {
            if (!this.options?.resizable?.enabled) {
                this.toggleDesign();
            }    
        }, 10);
    }

    /**
     * Add report to dashboard
     */
    addItem(report: BIReport): void {
        this.isAddReportModalOpen = false;
        this.items.push({ x: null, y: null, cols: 2, rows: 1, IDReport: report.Id, Id: 0 });

        setTimeout(() => {
            if (!this.options?.resizable?.enabled) {
                this.toggleDesign();
            }    
        }, 10);
    }

    gotoReport(ev) {
        if (ev.Code) {

            if (ev.Code == 'demo') {
                this.nav('dynamic-report/' + ev.Id);        
            }
            else{
                this.nav(ev.Code);
            }
            
        }
        
    }

    showReportPicker() {
        this.isAddReportModalOpen = true;
        setTimeout(() => {
            this.searchBar.setFocus();
        }, 150);
    }

    onSearchReports(event) {
        this.reportSearchKeyword = event.target.value.toLowerCase();
    }
}
