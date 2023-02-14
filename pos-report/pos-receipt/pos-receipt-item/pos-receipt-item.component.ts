import { Component, Input, OnInit } from '@angular/core';


@Component({
    selector: 'app-pos-receipt-item',
    templateUrl: 'pos-receipt-item.component.html',
    styleUrls: ['pos-receipt-item.component.scss']
})
export class POSReceiptItemComponent implements OnInit {
    @Input() items: any;
    constructor() {
        
    }
    ngOnInit(): void {}
}
