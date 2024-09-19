import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-despacho',
    templateUrl: './despacho.component.html',
    styleUrls: ['./despacho.component.scss'],
})
export class DespachoComponent implements OnInit {

    constructor(
        private router: Router,
        private route: ActivatedRoute,
    ) {

    }

    ngOnInit() {

    }

}
