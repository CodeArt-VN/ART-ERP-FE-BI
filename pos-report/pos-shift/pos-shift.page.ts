import { CommonService } from 'src/app/services/core/common.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { Component } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { ReportService } from 'src/app/services/report.service';
import { lib } from 'src/app/services/static/global-functions';
import { TranslateService } from '@ngx-translate/core';
import { concat, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { PopoverPage } from 'src/app/pages/SYS/popover/popover.page';
import { HRM_StaffProvider } from 'src/app/services/static/services.service';

@Component({
    selector: 'app-pos-shift',
    templateUrl: './pos-shift.page.html',
    styleUrls: ['./pos-shift.page.scss'],
})
export class PosShiftPage extends PageBase {

	segmentView = 'pos-shift/sale-saleman';

    filter = {
        type: 'd',
        frequency: 1,
        fromDateTime: '',
        toDateTime: '',
        saleman: null,
        outlet: null,
        isCalcShippedOnly: true,
    }

    constructor(
		public staffProvider: HRM_StaffProvider,
        public env: EnvService,
        public navCtrl: NavController,
        public rpt: ReportService,
        public commonService: CommonService,
        public popoverCtrl: PopoverController,
        public translate: TranslateService,
    ) {
        super();
		this.pageConfig.isShowFeature = true;
    }

	segmentChanged(ev: any) {
        this.segmentView = ev.detail.value;
        this.nav(ev.detail.value, 'root');
    }

	
    runReports() {
        console.log('runReports');
        this.rpt.rptGlobal.query._cmd = 'runReport';
        this.rpt.rptGlobal.query.IDBranch = this.env.selectedBranchAndChildren;
        this.rpt.rptGlobal.query.fromDateTime = this.filter.fromDateTime;
        this.rpt.rptGlobal.query.toDateTime = this.filter.toDateTime;
        this.rpt.rptGlobal.query.fromDate = null;
        this.rpt.rptGlobal.query.toDate = null;
		this.rpt.rptGlobal.query.IDOwner = this.filter.saleman?.Id;
		this.rpt.rptGlobal.query.saleman = this.filter.saleman;
        this.rpt.rptGlobal.query.GroupBy = 'Day',
        this.rpt.rptGlobal.query.isCalcReceiptPayment = true,
        this.filter.type == 'set';
        this.rpt.rptGlobal.query.isShowFeature = this.pageConfig.isShowFeature;
        this.rpt.dateQuery(this.filter.type == 'set'?'setdone':this.filter.type).then(_ => { }).catch(err => { let a = err });
    }

	async loadData(event) {
		this.salemanSearch();
		this.loadedData(null);
	}

	salemanList$
    salemanListLoading = false;
    salemanListInput$ = new Subject<string>();
    salemanListSelected = [];
    salemanSelected = null;
    salemanSearch() {
        this.salemanListLoading = false;
        this.salemanList$ = concat(
            of(this.salemanListSelected),
            this.salemanListInput$.pipe(
                distinctUntilChanged(),
                tap(() => this.salemanListLoading = true),
                switchMap(term => this.staffProvider.search({ Take: 20, Skip: 0, IDDepartment: this.env.selectedBranchAndChildren, Term: term }).pipe(
                    catchError(() => of([])), // empty list on error
                    tap(() => this.salemanListLoading = false)
                ))
            )
        );
    }

    changeDateFillter(type) {
        this.filter.type = type;
        let toDay = new Date();

        if (type == 'setdone') {
            this.filter.type = 'set';
        }
    }

    changeFrequency(f) {
        this.filter.frequency = f.Id;
    }

}
