
let cv = null;
try {
  cv = (window as any).require('opencv');
} catch (err) {
  console.error(err);
}

export enum ProcessType {
  Tracking,
  Sampling
}
export class ColorTracking {
  showTrackingPoint: false;
  private src: any;
  private dst: any;
  private cap: any;
  processingType: ProcessType = ProcessType.Tracking;
  private samplingSize = 25;
  showTrackingMask: false;
  constructor(video: HTMLVideoElement) {
    this.src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    this.dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
    this.cap = new cv.VideoCapture(video);
  }
  process(canvas: HTMLCanvasElement, data: any = null) {
    this.cap.read(this.src);
    cv.flip(this.src, this.src, +1);
    switch (this.processingType) {
      case ProcessType.Tracking:
        this.trackColors(data);
        break;
      case ProcessType.Sampling:
        this.sampling();
        break;
    }
    cv.imshow(canvas, this.dst);
  }
  sampling() {
    // creating mask with box in the middle
    const mask = new cv.Mat.zeros(this.src.rows, this.src.cols, cv.CV_8UC1);
    cv.rectangle(mask,
      new cv.Point((this.src.cols - this.samplingSize) / 2, (this.src.rows - this.samplingSize) / 2),
      new cv.Point((this.src.cols + this.samplingSize) / 2, (this.src.rows + this.samplingSize) / 2),
      new cv.Scalar(255, 255, 255, 255), -1);
    // drawing the blur layer
    const src1 = this.src.clone();
    cv.blur(src1, src1, new cv.Size(30, 30), new cv.Point(-1, -1), cv.BORDER_DEFAULT);
    cv.bitwise_and(this.src, this.src, this.dst, mask);
    // drawing the clear layer
    cv.bitwise_not(mask, mask);
    cv.bitwise_and(src1, src1, this.dst, mask);
    // drawing info on screen
    cv.rectangle(this.dst,
      new cv.Point((this.src.cols - this.samplingSize - 1) / 2, (this.src.rows - this.samplingSize - 1) / 2),
      new cv.Point((this.src.cols + this.samplingSize + 1) / 2, (this.src.rows + this.samplingSize + 1) / 2),
      new cv.Scalar(59, 89, 180, 255), 1);
    cv.putText(this.dst, 'Put the object you want to sample inside the blue box',
      new cv.Point(this.src.cols / 2 - 160, this.src.rows / 2 + 40),
      cv.FONT_HERSHEY_SIMPLEX,
      0.4,
      new cv.Scalar(0, 0, 0, 255),
      1,
      cv.LINE_AA);

    mask.delete();
    src1.delete();
  }
  pickSample() {
    const rect = new cv.Rect((this.src.cols - this.samplingSize) / 2, (this.src.rows - this.samplingSize) / 2,
      this.samplingSize + 1, this.samplingSize + 1);
    const sample = this.src.roi(rect);
    cv.resize(sample, sample, new cv.Size(this.samplingSize, this.samplingSize), 0, 0, cv.INTER_AREA);
    const values = this.getColorRange(sample);
    return { sample, values };
  }
  getColorRange(sample) {
    const srcVec = new cv.MatVector();
    srcVec.push_back(sample);
    const hist = new cv.Mat();
    const mask = new cv.Mat();
    const highValue = [];
    const lowValue = [];
    for (let i = 0; i < 3; i++) {
      cv.calcHist(srcVec, [i], mask, hist, [256], [0, 255], false);
      let searchLow = true;
      let highIndex = 0;
      let lowIndex = 0;

      for (let j = 0; j < 256; j++) {
        const binVal = hist.data32F[j];
        if (binVal > 0) {
          if (searchLow) {
            lowIndex = j;
            searchLow = false;
          } else {
            highIndex = j;
          }
        }
      }
      highValue.push(highIndex + 3);
      lowValue.push(lowIndex - 3);
    }
    hist.delete();
    mask.delete();
    srcVec.delete();
    lowValue.push(0);
    highValue.push(255);
    return { low: lowValue, high: highValue };
  }

  trackColors(colorsArray: any = null) {
    // this.copySrcToDst();
    if (!colorsArray) { return; }

    this.dst.delete();
    this.dst = new cv.Mat.ones(this.src.rows, this.src.cols, cv.CV_8UC1);
    const tracking = [];
    colorsArray.forEach((element, index) => {
      const out = new cv.Mat();
      // get inRangeColors
      const low = new cv.Mat(this.src.rows, this.src.cols, this.src.type(), element.values.low);
      const high = new cv.Mat(this.src.rows, this.src.cols, this.src.type(), element.values.high);
      cv.inRange(this.src, low, high, out);
      low.delete();
      high.delete();
      // // blur or dilate for a more compact tracking
      const M = cv.Mat.ones(15, 15, cv.CV_8UC1);
      const anchor = new cv.Point(-1, -1);
      cv.blur(out, out, new cv.Size(10, 10), anchor, cv.BORDER_DEFAULT);
      // cv.dilate(this.dst, this.dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
      M.delete();

      // find contours and mark them
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      cv.findContours(out, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_TC89_KCOS);
      const markColor = new cv.Scalar(0, 0, 255, 255);
      let maxAerea = 0;
      let maxX = -1;
      let maxY = -1;
      for (let i = 0; i < contours.size(); ++i) {
        const moment = cv.moments(contours.get(i), false);
        const x = moment.m10 / moment.m00;
        const y = moment.m01 / moment.m00;
        const aerea = cv.contourArea(contours.get(i));

        if (aerea > 500 && aerea > maxAerea) {
          maxAerea = aerea;
          maxX = x;
          maxY = y;
        }
      }
      tracking.push({ x: maxX, y: maxY });
      if (this.showTrackingPoint && maxY !== -1 && maxX !== -1) {
        cv.rectangle(this.src, new cv.Point(maxX, maxY), new cv.Point(maxX + 5, maxY + 5), markColor, 1);
      }
      contours.delete();
      hierarchy.delete();
      if (this.showTrackingMask) {
        cv.bitwise_or(this.src, this.src, this.dst, out);
      }
      out.delete();
    });
    if (!this.showTrackingMask) {
      this.copySrcToDst();
    }
  }
  copySrcToDst() {
    this.dst.delete();
    this.dst = this.src.clone();
  }
  clearScreen(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
  destroy() {
    this.dst?.delete();
    this.cap?.delete();
    this.src?.delete();
  }

}
