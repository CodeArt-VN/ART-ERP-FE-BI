import { Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import {
  AlertController,
  ItemReorderEventDetail,
  LoadingController,
  ModalController,
  NavController,
  PopoverController,
} from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import {
  BI_DashboardProvider,
  BRA_BranchProvider,
  SYS_FormProvider
} from 'src/app/services/static/services.service';

@Component({
    selector: 'app-dynamic-dashboard',
    templateUrl: 'dynamic-dashboard.page.html',
    styleUrls: ['dynamic-dashboard.page.scss'],
    standalone: false
})
export class DynamicDashboardPage extends PageBase {
  @ViewChild('toolPopover') toolPopover;

  groupControl = {
    showReorder: false,
    showPopover: false,
    groupList: [],
    selectedGroup: null,
  };
  constructor(
    public pageProvider: BI_DashboardProvider,
    public formProvider: SYS_FormProvider,
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
    this.pageConfig.isShowFeature = true;;
    this.pageConfig.isFeatureAsMain = true;
  }

  ngOnDestroy(): void {
    this.groupControl.showPopover = false;
    super.ngOnDestroy();
  }

  preLoadData(event?: any): void {
    this.formProvider
      .read({ IDParent: 2, Type: 11 })
      .then((res) => {
        this.groupControl.groupList = res['data'];
      })
      .catch((err) => {
        this.env.showMessage(err, 'danger');
      })
      .finally(() => {
        super.preLoadData(event);
      });
  }

  presentToolPopover(e: Event) {
    this.toolPopover.event = e;
    this.groupControl.showPopover = true;
  }

  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    // The `from` and `to` properties contain the index of the item
    // when the drag started and ended, respectively
    console.log('Dragged from index', ev.detail.from, 'to', ev.detail.to);

    // Finish the reorder and position the item in the DOM based on
    // where the gesture ended. This method can also be called directly
    // by the reorder group
    ev.detail.complete();
  }

  onGroupChange(g) {
    // this.pageConfig.isMainPageActive = false;
    this.pageConfig.isSubActive = true;
    // this.pageConfig.isShowFeature = false;
    this.groupControl.selectedGroup = g;
    if (g) {
      this.query.Type = g.Id;
    } else {
      delete this.query.Type;
    }

    this.refresh();
  }
}
