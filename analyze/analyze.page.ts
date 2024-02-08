import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController, ItemReorderEventDetail } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BI_ReportProvider, BRA_BranchProvider, SYS_FormProvider, WMS_ZoneProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';




@Component({
    selector: 'app-analyze',
    templateUrl: 'analyze.page.html',
    styleUrls: ['analyze.page.scss']
})
export class AnalyzePage extends PageBase {
    @ViewChild('toolPopover') toolPopover;
    
    groupControl = {
        showReorder: false,
        showPopover: false,
        groupList: [],
        selectedGroup: null,
    }
    constructor(
        public pageProvider: BI_ReportProvider,
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
        this.pageConfig.isShowFeature = true;
    }

    ngOnDestroy(): void {
        this.groupControl.showPopover = false;
        super.ngOnDestroy();
    }

    preLoadData(event?: any): void {
        this.formProvider.read({ IDParent: 2, Type: 11 }).then((res) => {
            this.groupControl.groupList = res['data'];
        }).catch((err) => {
            this.env.showMessage(err, 'danger');
        }).finally(() => {
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
        this.groupControl.selectedGroup = g;
        if (g) {
            this.query.Type = g.Id;    
        }
        else {
            delete this.query.Type;
        }

        this.refresh();
        
    }

}
