
let cv = null;
try {
  cv = (window as any).require('../opencv/opencv');
} catch (err) {
  console.log(err);
}
export class ColorTracking {
  showTrackingPoint: boolean;
  private src: any;
  private dst: any;
  private cap: any;
  constructor(video: HTMLVideoElement, showTrackingPoints: boolean = true) {
    this.src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    this.dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
    this.cap = new cv.VideoCapture(video);
    this.showTrackingPoint = showTrackingPoints;
  }
  process(canvas: HTMLCanvasElement) {
    this.cap.read(this.src);
    cv.cvtColor(this.src, this.dst, cv.COLOR_RGBA2GRAY);
    const M = cv.Mat.ones(5, 5, cv.CV_8UC1);
    const anchor = new cv.Point(-1, -1);
    cv.dilate(this.dst, this.dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    M.delete();
    cv.rectangle(this.dst, new cv.Point(50, 50), new cv.Point(70, 70), new cv.Scalar(0, 0, 255, 255), 1);

    cv.imshow(canvas, this.dst);
  }

  destroy() {
    this.dst?.delete();
    this.cap?.delete();
    this.src?.delete();
  }

}
