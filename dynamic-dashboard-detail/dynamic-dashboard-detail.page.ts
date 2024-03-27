import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { AlertController, LoadingController, ModalController, NavController, PopoverController } from '@ionic/angular';
import { BIReport } from 'src/app/models/options-interface';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { ReportService } from 'src/app/services/report.service';

import { IonSearchbar } from '@ionic/angular';
import {
  DisplayGrid,
  Draggable,
  GridType,
  GridsterConfig,
  GridsterItem,
  PushDirections,
  Resizable,
} from 'angular-gridster2';
import { BI_DashboardDetailProvider, BI_DashboardProvider } from 'src/app/services/static/services.service';
import { ActivatedRoute } from '@angular/router';

interface Safe extends GridsterConfig {
  draggable: Draggable;
  resizable: Resizable;
  pushDirections: PushDirections;
}

@Component({
  selector: 'app-dynamic-dashboard-detail',
  templateUrl: 'dynamic-dashboard-detail.page.html',
  styleUrls: ['dynamic-dashboard-detail.page.scss'],
})
export class DynamicDashboardDetailPage extends PageBase {
  code = '';
  @ViewChild('reportSearch') searchBar: IonSearchbar;
  options: Safe;
  items: Array<GridsterItem>;
  isAddReportModalOpen = false;

  reportSearchKeyword = '';

  constructor(
    public pageProvider: BI_DashboardProvider,
    public dashboardDetailProvider: BI_DashboardDetailProvider,
    public rpt: ReportService,
    public modalController: ModalController,
    public popoverCtrl: PopoverController,
    public env: EnvService,
    public navCtrl: NavController,
    public route: ActivatedRoute,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef,
    public loadingController: LoadingController,
  ) {
    super();
    this.code = this.route.snapshot.paramMap.get('code');
    this.pageConfig.isShowFeature = false;
    this.pageConfig.isDetailPage = true;

    this.formGroup = formBuilder.group({
      Id: new FormControl({ value: '', disabled: true }),
      Code: [''],
      Name: ['', Validators.required],
      Remark: [''],
      Sort: [''],
      IsDisabled: new FormControl({ value: '', disabled: true }),
      IsDeleted: new FormControl({ value: '', disabled: true }),
      CreatedBy: new FormControl({ value: '', disabled: true }),
      CreatedDate: new FormControl({ value: '', disabled: true }),
      ModifiedBy: new FormControl({ value: '', disabled: true }),
      ModifiedDate: new FormControl({ value: '', disabled: true }),

      Type: new FormControl({ value: '', disabled: false }),
      Icon: new FormControl({ value: '', disabled: false }),
      Color: new FormControl({ value: '', disabled: false }),

      MinCols: new FormControl({ value: '', disabled: false }),
      MaxCols: new FormControl({ value: '', disabled: false }),
      MinRows: new FormControl({ value: '', disabled: false }),
      MaxRows: new FormControl({ value: '', disabled: false }),
    });
  }

  preLoadData(event?: any): void {
    if (!this.id) this.id = 1;
    if (this.pageConfig.canEdit) {
      this.pageConfig.canEditScript = true;
      this.pageConfig.canChangeReportConfig = true;
    }

    //Check pageProvider is ready
    this.rpt
      .readReports()
      .then(() => {
        super.preLoadData(event);
      })
      .catch((err) => {
        console.log(err);
        super.loadedData();
      });
  }

  loadedData(event?: any, ignoredFromGroup?: boolean): void {
    if (this.item?.Id) {
      this.options = {
        itemChangeCallback: this.itemChange.bind(this),
        //initCallback: DynamicDashboardDetailPage.initCallback,

        displayGrid: DisplayGrid.None,
        margin: 16,
        mobileBreakpoint: 640,
        gridType: GridType.VerticalFixed,
        fixedRowHeight: 340, //162,
        keepFixedHeightInMobile: true,
        setGridSize: true,
        scrollToNewItems: true,
        disableWindowResize: true,

        //enableBoundaryControl: true,
        draggable: { enabled: false },
        resizable: { enabled: false },
        pushItems: true,
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

      this.dashboardDetailProvider
        .read({ IdDashboard: this.id })
        .then((resp: any) => {
          if (resp) {
            this.items = resp['data'].map((i) => {
              return {
                x: i.X,
                y: i.Y,
                cols: i.Cols,
                rows: i.Rows,
                IDReport: i.IDReport,
                Id: i.Id,
                Type: i.Type,
                IDDashboard: i.IDDashboard,
              };
            });
          }

          //this.items[0].WidgetConfig= { ViewDimension: 'OriginalTotalAfterTax', Statistics_: ['Count', 'OriginalTotalAfterTax', 'TotalAfterTax']},

          super.loadedData(event, ignoredFromGroup);
        })
        .catch((err) => {
          console.log(err);
          super.loadedData(event, ignoredFromGroup);
        });

      // IDDashboard	int	Unchecked
      // IDReport	int	Unchecked
      // Id	int	Unchecked
      // X	int	Checked
      // Y	int	Checked
      // Cols	int	Checked
      // Rows	int	Checked

      // Type	nvarchar(256)	Unchecked
      // Code	nvarchar(256)	Checked
      // Name	nvarchar(512)	Checked
      // Remark	nvarchar(MAX)	Checked
      // Sort	int	Checked
      // IsDisabled	bit	Unchecked
      // IsDeleted	bit	Unchecked
      // CreatedBy	nvarchar(256)	Unchecked
      // CreatedDate	datetime	Unchecked
      // ModifiedBy	nvarchar(256)	Unchecked
      // ModifiedDate	datetime	Unchecked
    } else {
      super.loadedData(event, ignoredFromGroup);
    }

    // this.items = [
    //     { "x": 0, "y": 0, "cols": 1, "rows": 1, "IDReport": 3, "Id": 0 },
    //     // { cols: 2, rows: 2, y: 2, x: 0, minItemRows: 2, minItemCols: 2, maxItemRows: 3, maxItemCols: 4, label: 'Min rows & cols = 2', Id: 1 },
    // {"x":1,"y":0,"cols":1,"rows":1,"IDReport":5,"Id":0},
    //{"x":1,"y":0,"cols":1,"rows":1,"IDReport":5,"Id":0, WidgetConfig: { ViewDimension: 'CalcTotal', Statistics: ['Count', 'Guests', 'Total']}},

    // ];
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
  itemChange(item, itemComponent) {
    if (this.options.draggable.enabled || item.Id == 0) {
      let widget = {
        Id: item.Id,
        IDReport: item.IDReport,
        X: item.x,
        Y: item.y,
        Cols: item.cols,
        Rows: item.rows,
        Type: item.Type,
        IDDashboard: this.item.Id,
      };

      this.dashboardDetailProvider
        .save(widget)
        .then((resp) => {
          if (item.Id == 0) {
            item.Id = resp['Id'];
          }
          this.env.showTranslateMessage('Saving completed!', 'success');
        })
        .catch((err) => {
          console.log(err);
          this.env.showTranslateMessage('Cannot save, please try again', 'danger');
        });
    }

    //console.info('itemChanged', item, itemComponent);
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

    if (item.Id) {
      this.dashboardDetailProvider
        .delete([item])
        .then((resp) => {
          this.items.splice(this.items.indexOf(item), 1);

          setTimeout(() => {
            if (!this.options?.resizable?.enabled) {
              this.toggleDesign();
            }
          }, 10);

          this.env.showTranslateMessage('Deleted completed!', 'success');
        })
        .catch((err) => {
          console.log(err);
          this.env.showTranslateMessage('Cannot delete, please try again', 'danger');
        });
    }
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
      Type: 'Report',
      IDDashboard: this.item.Id,
    });

    setTimeout(() => {
      if (!this.options?.resizable?.enabled) {
        this.toggleDesign();
      }
    }, 10);
  }

  onOpenReport(ev) {
    if (!this.options.draggable.enabled) {
      this.nav('dynamic-report/' + ev.Id);
    }

    // if (ev.Code == 'demo' || !ev.Code) {
    //   this.nav('dynamic-report/' + ev.Id);
    // } else {
    //   this.nav(ev.Code);
    // }
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
