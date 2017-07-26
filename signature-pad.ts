'use strict';

import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';

declare var require: any;

export interface Point {
  x: number;
  y: number;
  time: number;
};

@Component({
  template: '<canvas></canvas>',
  selector: 'signature-pad',
})

export class SignaturePad {

  @Input() public options: Object;
  @Output() public onBeginEvent: EventEmitter<boolean>;
  @Output() public onEndEvent: EventEmitter<boolean>;

  private signaturePad: any;
  private elementRef: ElementRef;

  constructor(elementRef: ElementRef) {
    // no op
    this.elementRef = elementRef;
    this.options = this.options || {};
    this.onBeginEvent = new EventEmitter();
    this.onEndEvent = new EventEmitter();
  }

  public ngAfterContentInit(): void {
    let sp: any = require('signature_pad')['default'];
    let canvas: any = this.elementRef.nativeElement.querySelector('canvas');

    if ((<any>this.options)['canvasHeight']) {
      canvas.height = (<any>this.options)['canvasHeight'];
    }

    if ((<any>this.options)['canvasWidth']) {
      canvas.width = (<any>this.options)['canvasWidth'];
    }

    this.signaturePad = new sp(canvas, this.options);
    this.signaturePad.onBegin = this.onBegin.bind(this);
    this.signaturePad.onEnd = this.onEnd.bind(this);
  }

  public resizeCanvas(): void {
    // When zoomed out to less than 100%, for some very strange reason,
    // some browsers report devicePixelRatio as less than 1
    // and only part of the canvas is cleared then.
    const ratio: number = Math.max(window.devicePixelRatio || 1, 1);
    const canvas: any = this.signaturePad._canvas;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);
    this.signaturePad.clear(); // otherwise isEmpty() might return incorrect value
  }

   // Returns signature image as an array of point groups
  public toData(): Array<Point> {
    return this.signaturePad.toData();
  }

  // Draws signature image from an array of point groups
  public fromData(points: Array<Point>): void {
    this.signaturePad.fromData(points);
  }

  // Returns signature image as data URL (see https://mdn.io/todataurl for the list of possible paramters)
  public toDataURL(imageType?: string, quality?: number): string {
    return this.signaturePad.toDataURL(imageType, quality); // save image as data URL
  }

  // Draws signature image from data URL
  public fromDataURL(dataURL: string, options: Object = {}): void {
    this.signaturePad.fromDataURL(dataURL, options);
  }

  // Clears the canvas
  public clear(): void {
    this.signaturePad.clear();
  }

  // Returns true if canvas is empty, otherwise returns false
  public isEmpty(): boolean {
    return this.signaturePad.isEmpty();
  }

  // Unbinds all event handlers
  public off(): void {
    this.signaturePad.off();
  }

  // Rebinds all event handlers
  public on(): void {
    this.signaturePad.on();
  }

  // set an option on the signaturePad - e.g. set('minWidth', 50);
  public set(option: string, value: any): void {

    switch (option) {
      case 'canvasHeight':
        this.signaturePad._canvas.height = value;
        break;
      case 'canvasWidth':
        this.signaturePad._canvas.width = value;
        break;
      default:
        this.signaturePad[option] = value;
    }
  }
   
  //check if pointer can be locked
  public canLockPointer(){
    return 'pointerLockElement' in document ||
    'mozPointerLockElement' in document ||
    'webkitPointerLockElement' in document
  }
  
  //gets raw canvas access, for mouse lock operations and similar
  public lockPointer(timeout:number): {
    if(!this.canLockPointer())
      alert("Pointer Lock API not available");
    this.signaturePad.requestPointerLock();
    
    this.signaturePad.requestPointerLock = this.signaturePad.requestPointerLock ||
			     this.signaturePad.mozRequestPointerLock ||
			     this.signaturePad.webkitRequestPointerLock;
    // Ask the browser to lock the pointer
    this.signaturePad.requestPointerLock();
  
    // Ask the browser to release the pointer
    document.exitPointerLock = document.exitPointerLock ||
             document.mozExitPointerLock ||
             document.webkitExitPointerLock;
    
    setTimeout(document.exitPointerLock(), timeout);
      
  }

  // notify subscribers on signature begin
  public onBegin(): void {
    this.onBeginEvent.emit(true);
  }

  // notify subscribers on signature end
  public onEnd(): void {
    this.onEndEvent.emit(true);
  }
}
