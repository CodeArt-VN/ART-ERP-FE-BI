import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import {
  WMS_ItemProvider,
  WMS_PriceListProvider,
  WMS_PriceListVersionProvider,
} from 'src/app/services/static/services.service';
import { concat, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { lib } from 'src/app/services/static/global-functions';

@Component({
    selector: 'app-price-report',
    templateUrl: 'price-report.page.html',
    styleUrls: ['price-report.page.scss'],
    standalone: false
})
export class PriceReportPage extends PageBase {
  priceVersionList = [];
  selectedVersionList = [];
  compareWithVersion = null;
  setQuery;

  selectedPriceList = [];
  compareWithPriceList = null;

  segmentView = '';
  optionGroup = [
    { Code: 'price-list-compare', Name: 'So sánh bảng giá', Remark: '' },
    {
      Code: 'price-list-version-compare',
      Name: 'Phiên bản áp dụng',
      Remark: '',
    },
  ];

  slideOpts = {
    freeMode: true,
    zoom: true,
  };

  constructor(
    public pageProvider: WMS_PriceListProvider,
    public priceListVersionProvider: WMS_PriceListVersionProvider,
    public itemProvider: WMS_ItemProvider,

    public modalController: ModalController,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController,
    public loadingController: LoadingController,
    public env: EnvService,
    public route: ActivatedRoute,
    public navCtrl: NavController,
  ) {
    super();
    this.pageConfig.isShowFeature = true;
    this.segmentView = this.route.snapshot?.paramMap?.get('segment');
  }

  loadedData(event) {
    super.loadedData(event);
    this.item = this.items.find((d) => d.Id == this.id);
    if (!this.item || this.item.disabled) {
      this.item = this.items.find((d) => true);
    }
    this.selectPriceList();
  }

  loadNode(option = null) {
    if (!option && this.segmentView) {
      option = this.optionGroup.find((d) => d.Code == this.segmentView);
    }

    if (!option) {
      option = this.optionGroup[0];
    }

    if (!option) {
      return;
    }

    this.segmentView = option.Code;

    let newURL = '#/price-report/';
    if (this.item) {
      newURL += option.Code + '/' + this.item.Id;
    }
    history.pushState({}, null, newURL);
    if (this.segmentView == 'price-list-version-compare') {
      this.setQuery = {
        IDPriceList: this.item?.Id,
        IDPriceListVersion: JSON.stringify(this.priceVersionList.filter((d) => d.isChecked).map((m) => m.Id)),
        CompareToVersion: this.compareWithVersion ? this.compareWithVersion.Id : 0,
        CompareName: this.compareWithVersion ? this.compareWithVersion.CompareName : '',
      };
    } else {
      this.setQuery = {
        IDPriceList: JSON.stringify(this.items.filter((d) => d.isChecked).map((m) => m.Id)),
        CompareWithPriceList: this.compareWithPriceList ? this.compareWithPriceList.Id : 0,
        CompareName: this.compareWithPriceList ? this.compareWithPriceList.Name : '',
      };
    }
    Object.assign(this.setQuery, this.query);
  }

  selectPriceList() {
    if (!this.item) {
      this.loadNode();
    } else {
      if (this.segmentView == 'price-list-version-compare') {
        this.priceListVersionProvider.read({ IDPriceList: this.item.Id }).then((resp) => {
          this.priceVersionList = resp['data'];
          this.priceVersionList.forEach((i) => {
            i.AppliedDateText = lib.dateFormat(i.AppliedDate, 'hh:MM dd/mm/yyyy');
            i.CompareName = this.item.Name + ' - ' + i.Name;
          });
          this.priceVersionList.unshift({
            Id: -1,
            Name: 'Bảng giá đang áp dụng',
            CompareName: this.item.Name,
            isChecked: true,
          });
        });
      }
    }
  }

  isSelectedAllPriceList = false;

  selectAllPriceList() {
    this.isSelectedAllPriceList = !this.isSelectedAllPriceList;

    this.items.forEach((i) => {
      i.isChecked = this.isSelectedAllPriceList;
    });
  }

  selectPriceListVersion() {
    this.selectedVersionList = this.priceVersionList.filter((d) => d.isChecked);
  }
  priceListSelectedChange() {
    this.selectedPriceList = this.items.filter((d) => d.isChecked);
  }
}
