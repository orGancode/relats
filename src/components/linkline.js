
export default class LinkLine {
  constructor(option) {
    this.ctx = option.ctx;
    this.start = option.in;
    this.stop = option.out;
    this.tempPointDownX = option.tpdx; // 下转折点
    this.tempPointUpX = option.tpux; // 上转折点
  }
  drawLine() {
    const ctx = this.ctx;
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.lineTo(this.start.x, this.start.y + 2);
    ctx.lineTo(this.start.x, this.start.y + 30);
    (this.tempPointUpX !== undefined) && ctx.lineTo(this.tempPointUpX, this.start.y + 30);
    (this.tempPointDownX !== undefined) && ctx.lineTo(this.tempPointDownX, this.stop.y - 30);
    ctx.lineTo(this.stop.x, this.stop.y - 30);
    ctx.lineTo(this.stop.x, this.stop.y - 3);
    ctx.stroke();
    ctx.closePath();
  };

  drawArrow() {
    const ctx = this.ctx;
    const arrawLen = 8;
    ctx.strokeStyle = '#999';
    ctx.beginPath();
    ctx.lineTo(this.stop.x - arrawLen / 2, this.stop.y - Math.sqrt(3) * arrawLen / 2 - 2);
    ctx.lineTo(this.stop.x, this.stop.y - 2);
    ctx.lineTo(this.stop.x + arrawLen / 2, this.stop.y - Math.sqrt(3) * arrawLen / 2 - 2);
    ctx.stroke();
    ctx.closePath();
  };


  draw() {
    this.drawLine();
    this.drawArrow();
  };

}
