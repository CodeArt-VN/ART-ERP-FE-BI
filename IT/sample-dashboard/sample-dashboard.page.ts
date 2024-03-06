import { Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import {
  AlertController,
  IonSearchbar,
  LoadingController,
  ModalController,
  NavController,
  PopoverController,
} from '@ionic/angular';
import {
  CompactType,
  DisplayGrid,
  Draggable,
  GridType,
  GridsterConfig,
  GridsterItem,
  PushDirections,
  Resizable,
} from 'angular-gridster2';
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
  selector: 'app-sample-dashboard',
  templateUrl: 'sample-dashboard.page.html',
  styleUrls: ['sample-dashboard.page.scss'],
})
export class SampleDashboardPage extends PageBase {
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
      itemChangeCallback: SampleDashboardPage.itemChange,
      //initCallback: SampleDashboardPage.initCallback,

      displayGrid: DisplayGrid.None,
      margin: 16,
      mobileBreakpoint: 640,
      gridType: GridType.VerticalFixed,
      fixedRowHeight: 340, //162,
      keepFixedHeightInMobile: true,
      setGridSize: true,

      //enableBoundaryControl: true,
      draggable: { enabled: false },
      resizable: { enabled: false },
      pushItems: false,
      pushDirections: {
        north: true,
        east: true,
        south: true,
        west: true,
      },
      swap: true,

      minCols: this.item.MinCols,
      maxCols: this.item.MaxCols,
      minRows: this.item.MinRows,
      maxRows: this.item.MaxRows,
    };

    this.items = [
      { x: 0, y: 0, cols: 1, rows: 1, Id: 1, IDReport: 3 },
      { x: 2, y: 0, cols: 3, rows: 1, Id: 2, IDReport: 1 },
      { x: 0, y: 1, cols: 2, rows: 1, Id: 3, IDReport: 2 },
      { x: 3, y: 1, cols: 2, rows: 1, Id: 4, IDReport: 4 },

      // { cols: 2, rows: 2, y: 2, x: 0, minItemRows: 2, minItemCols: 2, maxItemRows: 3, maxItemCols: 4, label: 'Min rows & cols = 2', Id: 1 },
    ];

    super.loadedData(event);
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
    this.items.push({
      x: null,
      y: null,
      cols: 2,
      rows: 1,
      IDReport: report.Id,
      Id: 0,
    });

    setTimeout(() => {
      if (!this.options?.resizable?.enabled) {
        this.toggleDesign();
      }
    }, 10);
  }

  gotoReport(ev) {
    this.nav('bill-status-report');
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
