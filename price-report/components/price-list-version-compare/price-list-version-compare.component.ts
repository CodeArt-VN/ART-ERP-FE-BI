import { Component, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, PopoverController, NavController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { CommonService } from 'src/app/services/core/common.service';
import { EnvService } from 'src/app/services/core/env.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { lib } from 'src/app/services/static/global-functions';

@Component({
  selector: 'app-price-list-version-compare',
  templateUrl: './price-list-version-compare.component.html',
  styleUrls: ['./price-list-version-compare.component.scss'],
})
export class PriceListVersionCompareComponent extends PageBase {
  columns = [];
  @Input() set showSearch(value) {
    this.pageConfig.isShowSearch = value;
  }
  @Input() set setQuery(value) {
    this.query = value ? value : {};

    this.clearData();
    this.loadData(null);
  }

  constructor(
    public pageProvider: CommonService,
    public env: EnvService,
    public route: ActivatedRoute,
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef,
    public loadingController: LoadingController,
  ) {
    super();
  }

  preLoadData(event) {}

  loadData(event) {
    let apiPath = {
      method: 'GET',
      url: function () {
        return ApiSetting.apiDomain('WMS/PriceList/PriceListVersionCompareReport/');
      },
    };

    if (this.pageProvider && !this.pageConfig.isEndOfData) {
      if (event == 'search') {
        this.pageProvider
          .connect(apiPath.method, apiPath.url(), this.query)
          .toPromise()
          .then((result: any) => {
            if (result.length == 0 || result.length < this.query.Take) {
              this.pageConfig.isEndOfData = true;
            }
            this.items = result;
            this.loadedData(null);
          });
      } else {
        this.query.Skip = this.items.length;
        this.pageProvider
          .connect(apiPath.method, apiPath.url(), this.query)
          .toPromise()
          .then((result: any) => {
            if (result.length == 0 || result.length < this.query.Take) {
              this.pageConfig.isEndOfData = true;
            }
            if (result.length > 0) {
              let firstRow = result[0];

              //Fix dupplicate rows
              //if (this.items.findIndex(d => d.Id == firstRow.Id) == -1) {
              this.items = [...this.items, ...result];
              //}
            }
            this.loadedData(event);
          });
      }
    } else {
      this.loadedData(event);
    }
  }

  loadedData(event) {
    if (this.items.length) {
      this.columns = Object.getOwnPropertyNames(this.items[0]).splice(4);

      let compareCol = this.query.CompareName;
      this.items.forEach((i) => {
        this.columns.forEach((c) => {
          i[c + 'Text'] = lib.formatMoney(i[c], 2);

          if (compareCol && compareCol != c && i[c] != null && i[compareCol] && i[c] != i[compareCol]) {
            i[c + 'Compare'] = i[c] - i[compareCol];
            i[c + 'CompareText'] = lib.formatMoney(i[c + 'Compare'], 2);
            i[c + 'ComparePercent'] = Math.round((i[c + 'Compare'] / i[compareCol]) * 1000) / 10;
          }
        });
      });

      //this.columns = Object.getOwnPropertyNames(this.items[0]).splice(4);
    }

    super.loadedData(event);
  }
}
