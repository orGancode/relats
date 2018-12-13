import { colorMap } from '../utils/index';

// 定义节点
export default class BlockNode {
  constructor(option) {
    this.nodeInfo = option.nodeInfo || {};
    this.id = this.nodeInfo.id;
    this.type = this.nodeInfo.type;
    this.isPerson = !!this.nodeInfo.isPerson; // 个人 or 企业
    this.text = this.nodeInfo.name;
    this.detail = JSON.parse(this.nodeInfo.detailJson || '{}');
    this.BASECOLOR = option.BASECOLOR || '#ffffff';
    this.showExpBtn = typeof option.showExpBtn === 'boolean' ? option.showExpBtn : true; // 是否显示展开按钮
    this.width = option.NODEW;
    this.height = option.NODEH;
    this.posX = option.px - this.width / 2;
    this.posY = option.py - this.height / 2;
    this.ctx = option.ctx;
    this.borderRadius = 4;
    this.setInOut();
  }
  // 绘制节点区域
  drawBlock() {
    let x = this.posX, y = this.posY, radius = this.borderRadius;
    let width = this.width, height = this.height;
    let color = colorMap(this.type);
    this.ctx.fillStyle = color.bgc;
    this.ctx.strokeStyle = color.bdc;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
    this.ctx.lineTo(width - radius + x, y);
    this.ctx.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
    this.ctx.lineTo(width + x, height + y - radius);
    this.ctx.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
    this.ctx.lineTo(radius + x, height + y);
    this.ctx.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
    this.ctx.lineTo(x, y + radius);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();
  }
  // 绘制节点内容
  drawText() {
    this.ctx.font = '12px "微软雅黑"';
    this.ctx.fillStyle = '#000';
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'top';
    let str = this.text.length > 13 ? this.text.substring(0, 13) + '...' : this.text;

    let canvasWidth = this.width - 12;//计算canvas的宽度
    let initHeight = 14;//绘制字体距离canvas顶部初始的高度

    let x = this.posX + (this.width / 2);
    let y = this.posY + 4; // padding-top 4

    if (this.isPerson) { // 如果是个人名，则绘制一个人物头像
      let img = new Image();
      img.src = "../images/people.png";
      this.ctx.drawImage(img, x - 36, y + 8, 16, 16);
      canvasWidth -= 30;
      x += 14;
      str = this.text.length > 7 ? this.text.substring(0, 7) + '...' : this.text;
    }
    if (this.ctx.measureText(str).width <= canvasWidth) {
      this.ctx.fillText(str, x, y + initHeight / 2);
    } else {
      let line = 0;
      let lineWidth = 0;
      let lastSubStrIndex = 0; //每次开始截取的字符串的索引
      for (let i = 0, l = str.length; i < l; i++) { // 逐字绘制，到达长度修改y坐标
        lineWidth += this.ctx.measureText(str[i]).width;
        if (lineWidth > canvasWidth) {
          this.ctx.fillText(str.substring(lastSubStrIndex, i), x, y + (initHeight * line));//绘制截取部分
          line++;
          lineWidth = 0;
          lastSubStrIndex = i;
        }
        if (i === str.length - 1) {//绘制剩余部分
          this.ctx.fillText(str.substring(lastSubStrIndex, i + 1), x, y + initHeight);
        }
      }
    }
  }


  drawNote(t, x, y, color, bgc) {
    let tw = this.ctx.measureText(t).width + 4, th = 16, radius = 2;
    let m = x - tw / 2, n = y + 2;
    this.ctx.beginPath();
    this.ctx.fillStyle = bgc || this.BASECOLOR;
    this.ctx.arc(m + radius, n + radius, radius, Math.PI, Math.PI * 3 / 2);
    this.ctx.lineTo(m + tw - radius, n);
    this.ctx.arc(m + tw - radius, n + radius, radius, Math.PI * 3 / 2, Math.PI * 2);
    this.ctx.lineTo(m + tw, n + th - radius);
    this.ctx.arc(m + tw - radius, n + th - radius, radius, 0, Math.PI * 1 / 2);
    this.ctx.lineTo(m + radius, n + th);
    this.ctx.arc(m + radius, n + th - radius, radius, Math.PI * 1 / 2, Math.PI);
    this.ctx.lineTo(m, n + radius);
    this.ctx.fill();
    this.ctx.closePath();

    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'top';
    this.ctx.fillStyle = color;
    this.ctx.fillText(t, x, n - 1);
  }

  drawExpBtn() {
    if (this.type === 1) return; // 研究对象，没有子集
    let position = this.expBtnPoint;
    if ([3, 4].indexOf(this.type) >= 0 && !this.nodeInfo.to.length) {
      return;
    }
    if (this.type === 2 && !this.nodeInfo.hasParents) {
      return;
    }
    // 画圆 圆的占地位置（position圆心， 半径8）
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#4facfe';
    this.ctx.lineWidth = 1;
    this.ctx.arc(position.x, position.y, this.expBtnRadius - 1, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.beginPath();
    this.ctx.lineCap = 'round';
    this.ctx.moveTo(position.x - 3, position.y);
    this.ctx.lineTo(position.x + 3, position.y);
    if (!this.nodeInfo.opened) {
      this.ctx.moveTo(position.x, position.y - 3);
      this.ctx.lineTo(position.x, position.y + 3);
    }
    this.ctx.stroke();
    this.ctx.closePath();
  }

  setInOut() {
    this.in = { x: this.posX + this.width / 2, y: this.posY };
    this.out = { x: this.posX + this.width / 2, y: this.posY + this.height };
    this.expBtnRadius = 7;
    this.expBtnPoint = null;
    if (this.type === 1 || !this.showExpBtn) return; // 研究对象，没有子集
    if ([3, 4].indexOf(this.type) >= 0) {
      if (!this.nodeInfo.to.length) return;
      this.out.y = this.out.y + 18;
      this.expBtnPoint = {
        x: this.out.x,
        y: this.out.y - 8
      };
    } else {
      if (!this.nodeInfo.hasParents) return;
      this.in.y = this.in.y - 18;
      this.expBtnPoint = {
        x: this.in.x,
        y: this.in.y + 8
      };
    }
  }

  draw() {
    this.drawBlock();
    this.drawText();
    this.showExpBtn && this.drawExpBtn();
  }
}
