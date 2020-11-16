import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ColorTracking } from './image-processing/color.tracking';
let ipcRenderer = null;
try {
  ipcRenderer = (window as any).require('electron').ipcRenderer;
} catch (err) {
  console.log(err);
}
@Component({
  selector: 'app-webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.scss']
})
export class WebcamComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(private zone: NgZone) { }
  @ViewChild('video', { static: false }) video: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: false }) canvas: ElementRef<HTMLCanvasElement>;

  private colorTracking: ColorTracking;
  ngOnInit(): void {
  }

  public ngAfterViewInit() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } }).then(stream => {
        this.video.nativeElement.srcObject = stream;
        this.video.nativeElement.play();

        if (ipcRenderer) {
          this.colorTracking = new ColorTracking(this.video.nativeElement);
        }
      });
    }
    if (ipcRenderer) {
      setInterval(this.grayImage.bind(this), 40);
    }
  }
  grayImage() {
    if (!this.colorTracking) { return; }
    const canvas = this.canvas.nativeElement;
    this.colorTracking.process(canvas);
  }
  ngOnDestroy(): void {
    this.colorTracking.destroy();
  }
}
