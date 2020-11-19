import { Directive, Output, EventEmitter, Input, SimpleChange, OnInit, ElementRef } from '@angular/core';

@Directive({
    selector: '[appOnCreate]'
})
export class OnCreateDirective implements OnInit {
    @Output() create: EventEmitter<any> = new EventEmitter<any>();
    constructor(private el: ElementRef) { }
    ngOnInit() {
        this.create.emit(this.el);
    }

}
