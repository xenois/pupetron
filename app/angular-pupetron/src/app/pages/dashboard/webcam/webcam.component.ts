import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ColorTracking, ProcessType } from './image-processing/color.tracking';
let ipcRenderer = null;
try {
  ipcRenderer = (window as any).require('electron').ipcRenderer;
} catch (err) {
  console.error(err);
}
@Component({
  selector: 'app-webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.scss']
})
export class WebcamComponent implements AfterViewInit, OnDestroy {
  constructor(private zone: NgZone) { }
  @ViewChild('video', { static: false }) video: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: false }) canvas: ElementRef<HTMLCanvasElement>;

  private colorTracking: ColorTracking;
  videoStarted = false;
  sampling = false;
  private processingTimeout: any;
  private stream: MediaStream;
  samples = [];
  showTrackingPoint = false;
  showTrackingMask = false;
  public ngAfterViewInit() {
    if (ipcRenderer) {
      this.colorTracking = new ColorTracking(this.video.nativeElement);
    }
  }
  onStartVideo() {
    if (!this.videoStarted) {
      this.startMedia();
      if (this.colorTracking) {
        this.processingTimeout = setInterval(this.processImage.bind(this), 40);
      }
    } else {
      this.stopMedia();
      if (this.colorTracking) {
        clearInterval(this.processingTimeout);
        this.colorTracking.clearScreen(this.canvas.nativeElement);
      }
    }
    this.videoStarted = !this.videoStarted;
  }
  processImage() {
    const canvas = this.canvas.nativeElement;
    this.colorTracking.process(canvas, this.samples);
  }
  onChangeProcess(value) {
    if (value === 'tracker') {
      this.colorTracking.processingType = ProcessType.Tracking;
      this.sampling = false;
    } else {
      this.colorTracking.processingType = ProcessType.Sampling;
      this.sampling = true;
    }
  }
  onPickSample() {
    if (this.colorTracking) {
      const trackData = this.colorTracking.pickSample();
      const imgData = new ImageData(new Uint8ClampedArray(trackData.sample.data), trackData.sample.cols, trackData.sample.rows);
      trackData.sample.delete();
      this.samples.unshift({ imgData, values: trackData.values });
    }
  }
  onDeleteSample(index) {
    this.samples.splice(index, 1);
  }
  drawSampleToCanvas(canvas: ElementRef<HTMLCanvasElement>, sample) {
    const ctx = canvas.nativeElement.getContext('2d');
    ctx.canvas.width = sample.imgData.width;
    ctx.canvas.height = sample.imgData.height;
    ctx.putImageData(sample.imgData, 0, 0);
  }
  onTrackPointsChecked(event: any) {
    this.showTrackingPoint = event.checked;
    if (this.colorTracking) {
      this.colorTracking.showTrackingPoint = event.checked;
    }
  }
  onTrackMaskChecked(event: any) {
    this.showTrackingMask = event.checked;
    if (this.colorTracking) {
      this.colorTracking.showTrackingMask = event.checked;
    }
  }
  startMedia() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        this.stream = stream;
        this.video.nativeElement.srcObject = stream;
        this.video.nativeElement.play();
      });
    }
  }
  stopMedia() {
    this.video.nativeElement.pause();
    this.stream?.getTracks().forEach((track) => {
      if (track.readyState === 'live') {
        track.stop();
      }
    });
  }
  ngOnDestroy(): void {
    this.colorTracking.destroy();
  }

}
