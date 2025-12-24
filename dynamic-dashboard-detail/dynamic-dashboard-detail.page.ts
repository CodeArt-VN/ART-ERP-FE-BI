import { ChangeDetectorRef, Component, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { AlertController, LoadingController, ModalController, NavController, PopoverController } from '@ionic/angular';
import { BIReport } from 'src/app/interfaces/options-interface';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { ReportService } from 'src/app/services/custom/report.service';

import { ActivatedRoute } from '@angular/router';
import { IonSearchbar } from '@ionic/angular';
import { DisplayGrid, GridType, GridsterItem } from 'angular-gridster2';
import { BI_DashboardDetailProvider, BI_DashboardProvider, SYS_FormProvider } from 'src/app/services/static/services.service';

@Component({
	selector: 'app-dynamic-dashboard-detail',
	templateUrl: 'dynamic-dashboard-detail.page.html',
	styleUrls: ['dynamic-dashboard-detail.page.scss'],
	standalone: false,
})
export class DynamicDashboardDetailPage extends PageBase {
	code = '';
	@ViewChild('reportSearch') searchBar: IonSearchbar;
	observer = null;
	options: any;
	items: Array<GridsterItem>;
	isAddReportModalOpen = false;
	groupList;
	reportSearchKeyword = '';

	constructor(
		public pageProvider: BI_DashboardProvider,
		public formProvider: SYS_FormProvider,
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
		public loadingController: LoadingController
	) {
		super();
		this.code = this.route.snapshot.paramMap.get('code');
		this.pageConfig.isShowFeature = false;
		this.pageConfig.ShowFeature = true;
		this.pageConfig.isDetailPage = true;

		this.formGroup = formBuilder.group({
			Id: new FormControl({ value: '', disabled: true }),
			Code: ['', Validators.required],
			Name: ['', Validators.required],
			Remark: [''],
			Sort: [''],
			IsDisabled: new FormControl({ value: '', disabled: true }),
			IsDeleted: new FormControl({ value: '', disabled: true }),
			CreatedBy: new FormControl({ value: '', disabled: true }),
			CreatedDate: new FormControl({ value: '', disabled: true }),
			ModifiedBy: new FormControl({ value: '', disabled: true }),
			ModifiedDate: new FormControl({ value: '', disabled: true }),

			Type: ['', Validators.required],
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
		Promise.all([this.rpt.readReports(), this.formProvider.read({ IDParent: 2, Type: 11 })])
			.then((res) => {
				this.groupList = res[1]['data'];
				this.groupList.forEach((i: any) => {
					i.Id = '' + i.Id;
				});
				super.preLoadData(event);
			})
			.catch((err) => {
				super.loadedData();
			});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		this.segmentView = null;
		this.items = [];
		//Grid size config
		if (!this.item.Config) {
			this.item.Config = {
				Layout: [
					{ Code: 'xs', Name: 'Mobile S', Value: 320, Cols: 2, Active: true, RowHeight: 380 },
					{ Code: 'sm', Name: 'Mobile L', Value: 576, Cols: 4, Active: true, RowHeight: 380 },
					{ Code: 'md', Name: 'Tablet', Value: 768, Cols: 6, Active: true, RowHeight: 380 },
					{ Code: 'lg', Name: 'Laptop', Value: 992, Cols: 8, Active: true, RowHeight: 380 },
					{ Code: 'xl', Name: 'Desktop', Value: 1200, Cols: 12, Active: true, RowHeight: 380 },
				],
			};
		} else this.item.Config = JSON.parse(this.item.Config);
		if (this.item?.Id) {
			this.dashboardDetailProvider
				.read({ IdDashboard: this.id })
				.then((resp: any) => {
					if (resp) {
						this.items = resp['data'].map((i) => {
							return {
								// Other properties
								IDReport: i.IDReport,
								Id: i.Id,
								Type: i.Type,
								IDDashboard: i.IDDashboard,

								Config: i.Config == null ? this.newWidgetConfig() : JSON.parse(i.Config),
							};
						});
					}
					setTimeout(() => {
						this.setSegmentView();
					}, 0);

					super.loadedData(event, ignoredFromGroup);
				})
				.catch((err) => {
					console.log(err);

					this.setSegmentView();
					super.loadedData(event, ignoredFromGroup);
				});
		} else {
			this.setSegmentView();
			super.loadedData(event, ignoredFromGroup);
		}
	}

	ionViewDidEnter() {
		console.log('ionViewDidEnter');
		super.ionViewDidEnter();
		//Resize grid when parent dom resize
		var chartDom = document.getElementById('dashboard');
		this.observer = new ResizeObserver(() => {
			if (this.options && this.options.api) this.setSegmentView();
		});
		this.observer.observe(chartDom);
	}

	ionViewWillLeave() {
		super.ionViewWillLeave();
		if (this.observer) {
			this.observer.disconnect();
		}
	}

	/**
	 * On change dashboard
	 * @param item Report item
	 * @param itemComponent The component
	 */
	itemChange(item) {
		if (this.options.draggable.enabled || item.Id == 0) {
			let widget = {
				Id: item.Id,
				IDReport: item.IDReport,
				IDDashboard: this.item.Id,
				Type: item.Type,
				Config: '',
			};

			let config = item.Config ? item.Config : { Layout: {} };
			config.Layout[this.segmentView.Code] = { x: item.x, y: item.y, cols: item.cols, rows: item.rows };
			widget.Config = JSON.stringify(config);
			if (!this.item.Id) {
				this.saveChange().then((resp) => {
					this.item.IDDashboard = resp['Id'];
					this.saveWidgetConfig(widget).then((resp) => {
						if (item.Id == 0) {
							item.Id = resp['Id'];
						}
					});
				});
			} else {
				this.saveWidgetConfig(widget).then((resp) => {
					if (item.Id == 0) {
						item.Id = resp['Id'];
					}
				});
			}
		}
	}

	onWidgetConfigChange(item) {
		let dtoItem = {
			Id: item.Id,
			IDDashboard: this.item.Id,
			Config: JSON.stringify(item.Config),
		};
		this.saveWidgetConfig(dtoItem).then((resp) => {});
	}

	//Promise to save widget config
	saveWidgetConfig(item) {
		return new Promise((resolve, reject) => {
			this.dashboardDetailProvider
				.save(item)
				.then((resp) => {
					this.env.showMessage('Saving completed!', 'success');
					resolve(resp);
				})
				.catch((err) => {
					this.env.showMessage('Cannot save, please try again', 'danger');
					console.log(err);
					reject(err);
				});
		});
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

		if (!this.options.draggable.enabled) {
			this.setSegmentView();
		}
	}

	segmentView;
	segmentChanged(ev: any) {
		this.setSegmentView(ev.detail.value);
		let element = document.getElementById('grid-layout');
		// Set element width
		if (element) {
			element.style.width = this.segmentView.Value;
		}
	}

	setSegmentView(layout = null) {
		// if (this.items.length == 0) return;

		let l = layout;
		let element = document.getElementById('grid-layout');

		if (l && element) {
			element.style.width = 'calc(' + l.Value + 'px + 16px)';
		} else if (!l && element && ((this.item?.Config?.Layout.length > 0 && !this.options?.draggable?.enabled) || !this.item?.Id)) {
			//Get layout from item config layouts by #grid-layout width
			element.style.width = '100%';
			let width = element.offsetWidth;

			let layouts = this.item.Config.Layout;
			if (width < 576) {
				l = layouts.find((x) => x.Code == 'xs');
			} else if (width < 768) {
				l = layouts.find((x) => x.Code == 'sm');
			} else if (width < 992) {
				l = layouts.find((x) => x.Code == 'md');
			} else if (width < 1200) {
				l = layouts.find((x) => x.Code == 'lg');
			} else {
				l = layouts.find((x) => x.Code == 'xl');
			}
		}
		console.log(layout, l);

		if (!l) {
			return;
		}

		if (!this.segmentView || this.segmentView.Code != l.Code) {
			this.segmentView = l;

			if (!this.options) {
				this.initGridOptionn();
			}

			this.options.fixedRowHeight = l.RowHeight;
			this.options.minCols = l.Cols;
			this.options.maxCols = l.Cols;

			this.calcWigetPosition();

			this.options.api?.optionsChanged();
		}

		this.options.api?.resize();
	}

	calcWigetPosition() {
		//Get item position from item config layouts by segmentView.Code
		let layout = this.segmentView.Code;
		this.items.forEach((item) => {
			if (item.Config?.Layout && item.Config.Layout[layout]) {
				item.x = item.Config.Layout[layout].x;
				item.y = item.Config.Layout[layout].y;
				item.cols = item.Config.Layout[layout].cols;
				item.rows = item.Config.Layout[layout].rows;
			}
		});
	}

	initGridOptionn() {
		this.options = {
			itemChangeCallback: this.itemChange.bind(this),

			displayGrid: DisplayGrid.None,
			margin: 16,
			mobileBreakpoint: 50,
			gridType: GridType.VerticalFixed,
			allowMultiLayer: false,

			keepFixedHeightInMobile: true,
			setGridSize: true,
			scrollToNewItems: true,
			disableWindowResize: true,

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

			fixedRowHeight: 380, //162,

			minCols: 12,
			maxCols: 12,
			minRows: 0,
			maxRows: 99,
		};
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

					this.env.showMessage('Deleted completed!', 'success');
				})
				.catch((err) => {
					console.log(err);
					this.env.showMessage('Cannot delete, please try again', 'danger');
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
			Config: this.newWidgetConfig(),
		});

		setTimeout(() => {
			if (!this.options?.resizable?.enabled) {
				this.toggleDesign();
			}
		}, 10);
	}

	newWidgetConfig() {
		return {
			Type: 'Chart', //Chart, Data table, Summary card
			ChartDimension: '', //Data to draw chart
			SummaryCards: [], //Show statistics

			Layout: {
				// Layout config
				sm: { x: null, y: null, cols: 1, rows: 1 },
				md: { x: null, y: null, cols: 1, rows: 1 },
				lg: { x: null, y: null, cols: 1, rows: 1 },
				xl: { x: null, y: null, cols: 1, rows: 1 },
			},
		};
	}

	onOpenReport(ev) {
		if (!this.options.draggable.enabled) {
			console.log(ev);

			if (!ev.Code) {
				this.nav('dynamic-report/' + ev.Id);
			} else {
				this.nav('reports/' + ev.Code);
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

	async saveChange(publishEventCode?: any) {
		return this.saveChange2(publishEventCode);
	}
}
