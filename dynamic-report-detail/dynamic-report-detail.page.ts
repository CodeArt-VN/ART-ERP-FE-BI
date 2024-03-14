import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ModalController, NavController, PopoverController } from '@ionic/angular';
import { BIReport } from 'src/app/models/options-interface';
import { PageBase } from 'src/app/page-base';
import { CommonService } from 'src/app/services/core/common.service';
import { EnvService } from 'src/app/services/core/env.service';
import { ReportService } from 'src/app/services/report.service';
import { SYS_FormProvider } from 'src/app/services/static/services.service';

@Component({
  selector: 'app-dynamic-report-detail',
  templateUrl: 'dynamic-report-detail.page.html',
  styleUrls: ['dynamic-report-detail.page.scss'],
})
export class DynamicReportDetailPage extends PageBase {
  viewDimension = '';

  item: BIReport;
  groupList: [];

  constructor(
    public pageProvider: ReportService,
    public formProvider: SYS_FormProvider,
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
    this.pageConfig.isShowFeature = true;
    this.pageConfig.isDetailPage = true;
    this.id = this.route.snapshot.paramMap.get('id');

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

      DataConfig: new FormControl({ value: '', disabled: false }),
      ChartScript: new FormControl({ value: '', disabled: false }),

      ChartConfig: new FormControl({ value: '', disabled: false }),
      Dimensions: new FormControl({ value: '', disabled: false }),
      ViewDimension: new FormControl({ value: '', disabled: false }),

      MockDataAPI: new FormControl({ value: '', disabled: false }),
    });
  }

  preLoadData(event?: any): void {
    if (this.pageConfig.canEdit) {
      this.pageConfig.canEditScript = true;
      this.pageConfig.canChangeReportConfig = true;
      this.formProvider
      .read({ IDParent: 2, Type: 11 })
      .then((res) => {
        this.groupList = res['data'];
        this.groupList.forEach((i:any) => {
          i.Id = '' + i.Id;
        });
      })
      .catch((err) => {
        this.env.showMessage(err, 'danger');
      })
      .finally(() => {
        super.preLoadData(event);
      });
    }

    if (this.pageConfig.pageName === 'dynamic-report') {
      console.log('dynamic-report');
    }

    //Check pageProvider is ready
    this.pageProvider
      .readReports()
      .then(() => {
        super.preLoadData(event);
      })
      .catch((err) => {
        console.log(err);
        super.loadedData();
      });
  }

  loadData(event?: any): void {
    this.item = this.pageProvider.getReport(this.id, this.pageConfig.pageName);

    this.pageProvider.saveReportConfig(this.item);
    this.loadedData(event);
  }

  loadedData(event?: any, ignoredFromGroup?: boolean): void {
    if (this.item) {
      this.subscriptions.push(
        this.pageProvider.regReportTrackingData(this.item.Id).subscribe((ds) => {
          if (ds) {
            this.items = ds?.data;
          }
          super.loadedData();
        }),
      );

      this.pageProvider.getReportData(this.item.Id, true);
    }
    super.loadedData(event, ignoredFromGroup);
  }

  refresh(event?: any): void {
    this.item = { Id: 0 };
    setTimeout(() => {
      this.item = this.pageProvider.getReport(this.id, this.pageConfig.pageName, true);
      this.subscriptions.forEach((subscription) => subscription.unsubscribe());
      super.refresh(event);
    }, 0);
  }

  runTestData: any = null;
  onRunReport(config: BIReport) {
    this.pageProvider.saveReportConfig(config);
    this.pageProvider.runTestReport(config.DataConfig).subscribe(
      (resp: any) => {
        this.runTestData = {
          ...{
            dataFetchDate: resp.LastModifiedDate,
            data: resp.Data,
          },
        };
        this.items = resp['Data'];
      },
      (error) => {
        console.log(error);
      },
    );
  }

  onSave(config: BIReport) {
    if (this.pageConfig.canEdit) {
      this.pageProvider.saveReportConfig(config);
      this.formGroup.get('DataConfig').setValue(JSON.stringify(config.DataConfig));
      this.formGroup.get('DataConfig').markAsDirty();

      this.formGroup.get('ChartConfig').setValue(config.ChartConfigScript);
      this.formGroup.get('ChartConfig').markAsDirty();

      this.formGroup.get('ChartScript').setValue(config.ChartScript);
      this.formGroup.get('ChartScript').markAsDirty();

      this.saveChange();

      this.pageProvider.getDatasetFromServer(this.item.Id);
    }
  }

  onViewDimensionChange(dimension) {
    this.viewDimension = dimension;
    if (this.pageConfig.canEdit) {
      // this.formGroup.get('ViewDimension').setValue(this.viewDimension);
      // this.formGroup.get('ViewDimension').markAsDirty();
      // this.saveChange();
    }
  }

  onActive(e) {
    console.log(this.selectedItems);
    console.log(e);
  }

  onChartClick(e) {
    console.log(e);
  }

  async saveChange() {
    super.saveChange2();
  }

  savedChange(savedItem?: any, form?: FormGroup<any>): void {
    if (this.pageConfig.isDetailPage && form == this.formGroup && this.id == 0) {
      this.pageProvider.items.push(savedItem);
    }
    super.savedChange(savedItem, form);
  }
}
