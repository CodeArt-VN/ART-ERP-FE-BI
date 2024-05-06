import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ModalController, NavController, PopoverController } from '@ionic/angular';
import { BIReport } from 'src/app/models/options-interface';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { ReportService } from 'src/app/services/report.service';
import { lib } from 'src/app/services/static/global-functions';
import { SYS_FormProvider } from 'src/app/services/static/services.service';

@Component({
  selector: 'app-dynamic-report-detail',
  templateUrl: 'dynamic-report-detail.page.html',
  styleUrls: ['dynamic-report-detail.page.scss'],
})
export class DynamicReportDetailPage extends PageBase {
  viewDimension = '';
  code = '';

  item: BIReport;
  comparitionData: any[] = [];
  showComparitionData = false;

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
    this.pageConfig.isSubActive = true;
    this.pageConfig.isDetailPage = true;
    this.id = this.route.snapshot.paramMap.get('id');
    this.code = this.route.snapshot.paramMap.get('code');

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
          this.groupList.forEach((i: any) => {
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
    if (this.id || this.code) {
      this.item = this.pageProvider.getReport(this.id, this.code);
      if (this.item) this.pageProvider.saveReportConfig(this.item);
    }

    this.loadedData(event);
  }

  loadedData(event?: any, ignoredFromGroup?: boolean): void {
    if (this.item) {
      this.subscriptions.push(
        this.pageProvider.regReportTrackingData(this.item.Id).subscribe((ds) => {
          if (ds) {
            this.loadItems(ds);
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

  loadItems(resp) {
    let data: any[] = [];

    if (!resp) return;

    if (resp.Data) {
      data = [...resp.Data];
    }
    if (resp.data) {
      data = [...resp.data];
    }

    if (resp.ComparitionData || resp.comparitionData || this.comparitionData.length > 0) {
      let comparitionData = resp.comparitionData || resp.ComparitionData;

      if (comparitionData) this.comparitionData = [...comparitionData];

      let keys = this.item.DataConfig.CompareBy.map((m) => m.Title || m.Property);
      let interval = this.item.DataConfig.Interval?.Title || this.item.DataConfig.Interval?.Property;
      let measures = this.item.DataConfig.MeasureBy.map((m) => m.Title || m.Property);

      let startDate: Date = this.pageProvider.calcTimeValue(this.item.DataConfig.TimeFrame.From);
      let startCompareDate: Date = this.pageProvider.calcTimeValue(
        this.item.DataConfig.CompareTo,
        false,
        this.item.DataConfig.TimeFrame.From,
      );
      let timeSpan = startDate.getTime() - startCompareDate.getTime();

      for (let item of data) {
        //Find comparition data from comparitionData
        let compareItem = this.comparitionData.find((c) => {
          if (interval) {
            let d1 = new Date(item[interval]);
            let d2 = new Date(c[interval]);
            if (d1 && d2 && (d1.getTime() - timeSpan) != d2.getTime()) return false;
          }

          let isMatch = true;
          for (let k of keys) {
            if (item[k] != c[k]) {
              isMatch = false;
              break;
            }
          }
          return isMatch;
        });

        for (let m of measures) {
          item['Prev ' + m] = compareItem ? compareItem[m] || 0 : 0;
        }
      }

      if (this.treeConfig.isTreeList) {
        lib.sumTreeListByParentId(
          data,
          measures.map((m) => 'Prev ' + m),
        );
      }
      for (let item of data)
        for (let m of measures)
          item['Percent ' + m] = item['Prev ' + m] ? ((item[m] - item['Prev ' + m]) * 100) / item['Prev ' + m] : 0;

      this.showComparitionData = true;

      // for (let i of comparitionData) {
      //   //i[interval] = new Date(new Date(i[interval]).getTime() + timeSpan);
      // }

      // for (let i of data) {
      //   //Find comparition data from comparitionData
      //   let c = comparitionData.find((m) => {

      //     let isMatch = true;
      //     for (let k of keys) {
      //       if (i[k] != m[k]) {
      //         isMatch = false;
      //         break;
      //       }
      //     }
      //     return isMatch;
      //   });
      // }

      // //Get concast keys value from items and comparitionData
      // let keysValue = data.concat(comparitionData).map((m) => {
      //   let i = {};
      //   keys.forEach((k) => {
      //     i[k] = m[k];
      //   });
      //   return i;
      // });

      // console.log(keysValue);
    }

    this.items = data;
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
            comparitionData: resp.ComparitionData,
          },
        };
        this.loadItems(resp);
        this.pageConfig.isSubActive = false;
      },
      (error) => {
        console.log(error);
      },
    );
  }

  onExportData() {
    if (this.items && this.items.length > 0) {
      // Create CSV content with BOM
      let csvContent = '\uFEFF'; // Byte Order Mark (BOM) for UTF-8

      let compareByHeader = this.item.DataConfig.CompareBy?.map((compare) => compare.Property);
      let intervalByHeader = this.item.DataConfig?.Interval?.Title || this.item.DataConfig?.Interval?.Property;
      let measureByHeader = this.item.DataConfig.MeasureBy?.map((measure) =>
        measure.Title ? measure.Title : measure.Property,
      );

      compareByHeader = compareByHeader?.filter(
        (c) =>
          ((!this.treeConfig.isTreeList || c != this.treeConfig.treeColumn) &&
            this.treeConfig.excludes.indexOf(c) == -1) ||
          (this.treeConfig.isTreeList && c == this.treeConfig.treeColumn),
      );

      const headerKeys = [...compareByHeader, intervalByHeader, ...measureByHeader];

      const headerRow = headerKeys.join(',');
      csvContent += headerRow + '\r\n';
      // Add data rows
      this.items.forEach((data) => {
        const rowValues = headerKeys.map((key) => {
          const val = data[key];
          // Escape double quotes by doubling them
          if (typeof val === 'string' && val.includes('"')) {
            return '"' + val.replace(/"/g, '""') + '"';
          }
          return val;
        });
        // Join values into a CSV row
        const row = rowValues.join(',');
        csvContent += row + '\r\n';
      });

      // Create Blob
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'exported_data.csv');
      document.body.appendChild(link);

      // Trigger download
      link.click();
    }
    this.pageConfig.isSubActive = false;
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

    //switch on series type
    switch (e.seriesType) {
      case 'bar':
        this.onBarClick(e);
        break;
      case 'line':
        break;
      case 'pie':
        this.onPieClick(e);
        break;
      case 'scatter':
        break;
      case 'sunburst':
        this.onSunburstClick(e);
        break;
      case 'treemap':
        break;
      case 'radar':
        break;
    }

    if (e.seriesType === 'sunburst') {
    }
  }

  onSunburstClick(e) {
    if (e.data.name) {
      let item = this.items.find((d) => d.Id == e.data.Id && d._Code == e.data._Code);
      if (item) {
        this.selectedItems = [...[item]];
        this.selectAllSubItems(item);
        this.openSelectedOnly(item);
      }
    } else {
      this.selectedItems = [];
    }
  }

  onBarClick(e) {
    if (e.seriesName && this.item?.DataConfig?.CompareBy?.length) {
      this.pageConfig.showFilter = true;
      let pro = this.item.DataConfig.CompareBy[0].Title || this.item.DataConfig.CompareBy[0].Property;
      this.query[pro] = e.seriesName;
      this.query = { ...this.query };
    } else {
      this.pageConfig.showFilter = false;
    }
  }

  onPieClick(e) {
    if (e.name && this.item?.DataConfig?.CompareBy?.length) {
      let pro = this.item.DataConfig.CompareBy[0].Title || this.item.DataConfig.CompareBy[0].Property;
      this.selectedItems = this.items.filter((d) => d[pro] == e.name);
    } else {
      this.selectedItems = [];
    }
  }

  selectAllSubItems(item) {
    this.items
      .filter((d) => d.IDParent == item.Id)
      .forEach((i) => {
        this.selectedItems.push(i);
        this.selectAllSubItems(i);
      });
  }

  openSelectedOnly(item) {
    this.isAllRowOpened = true;
    this.toggleRowAll().then(() => {
      this.openParents(item).then(() => {
        item.showdetail = false;
        this.toggleRow(this.items, item, true);
      });
    });
  }

  openParents(item) {
    return new Promise((resolve) => {
      let parent = this.items.find((d) => d.Id == item.IDParent);
      if (parent) {
        parent.showdetail = false;
        this.toggleRow(this.items, parent, true);
        this.openParents(parent).then(() => {
          resolve(true);
        });
      } else {
        resolve(true);
      }
    });
  }

  treeConfig = {
    isLoading: false,
    isTreeList: false,
    treeColumn: '',
    excludes: [],
  };
  onDataChange(e) {
    if (e.isTreeList) {
      this.treeConfig.isTreeList = true;
      this.treeConfig.treeColumn = e.treeColumn;
      this.treeConfig.excludes = e.excludes || [];
    }

    this.loadItems(e);

    this.treeConfig.isLoading = true;
    setTimeout(() => {
      this.treeConfig.isLoading = false;
    }, 100);
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

  isAllRowOpened = true;
  toggleRowAll() {
    return new Promise((resolve) => {
      this.isAllRowOpened = !this.isAllRowOpened;
      for (let i of this.items) {
        i.showdetail = !this.isAllRowOpened;
        this.toggleRow(this.items, i, true);
      }
      resolve(true);
    });
  }
}
