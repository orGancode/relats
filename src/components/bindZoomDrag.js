import { addMouseWheelHandler } from '../utils/index';

export default class BindZoomDrag {
  constructor(option) {
    this.canvas = option.canvas;
    this.ctx = option.ctx;
    // 坐标系零点坐标
    this.posiX = 0;
    this.posiY = 0;
    // 坐标系当前放大系数
    this.scaleStep = 0;
    // 全局放大了多少倍
    this.globalScale = 1;
    this.draw = option.draw;
    this.canvH = this.canvas.parentElement.clientHeight;
    this.canvW = this.canvas.parentElement.clientWidth;
    // 鼠标滚动时候的指针坐标
    this.hoverX = 0;
    this.hoverY = 0;
    this.BASECOLOR = option.BASECOLOR || '#ffffff'; // 画布底色
    this.showDetailModal = option.showDetailModal || (() => { }); // 展示详情的方法
    this.expandDetail = option.expandDetail || (() => { }); // 展开收缩方法
    this.pointInExpand = option.pointInExpand || (() => { }); // 点在展开按钮内的范围
    this.pointInPath = option.pointInPath || (() => { }); // 点在节点内的范围
    this.showTooltip = option.showTooltip || (() => { }); // 展示悬浮提示
    this.bindDrag();
    this.bindZoom();
    this.bindHover();
    this.bindClick();
  }
  bindDrag() {
    let mousePressed = false;
    let initPosition = {};
    const onMouseDown = (e) => {
      if (e.which === 1) {
        mousePressed = true;
        initPosition = {
          x: e.offsetX,
          y: e.offsetY
        }
      }
    }
    const onMouseMove = (e) => {
      if (mousePressed) {
        var movedPosi = {
          x: e.offsetX - initPosition.x,
          y: e.offsetY - initPosition.y
        }
        this.clearRect();
        this.draw(this.posiX + movedPosi.x, this.posiY + movedPosi.y);
      }
    }
    const onMouseCancel = (e) => {
      e.type === 'mouseout' && (document.getElementById('tooltip').style.display = 'none');
      if (e.type === 'mouseout' || (e.type === 'mouseup' && e.which === 1)) {
        mousePressed = false;
        if ((e.type === 'mouseup' && e.which === 1)) {
          this.posiX = this.posiX + (e.offsetX - initPosition.x);
          this.posiY = this.posiY + (e.offsetY - initPosition.y);
        }
      }
    };
    this.canvas.addEventListener('mousedown', onMouseDown);
    this.canvas.addEventListener('mousemove', onMouseMove);
    this.canvas.addEventListener('mouseup', onMouseCancel);
    this.canvas.addEventListener('mouseout', onMouseCancel);
  }

  bindZoom() {
    var mouseOver = (e) => {
      this.hoverX = e.offsetX;
      this.hoverY = e.offsetY;
    };
    this.canvas.addEventListener('mousemove', mouseOver);
    addMouseWheelHandler(this.canvas, this.mouseWheelHandler.bind(this));
  }

  bindHover() {
    this.canvas.addEventListener('mousemove', (e) => {
      var inNode = this.pointInPath(e, this.globalScale, this.showTooltip, function () { document.getElementById('tooltip').style.display = 'none' });
      var inNodeExp = this.pointInExpand(e, this.globalScale);
      if (inNode || inNodeExp) {
        document.getElementById('canvas').style.cursor = 'pointer';
      } else {
        document.getElementById('canvas').style.cursor = 'default';
      }
    });
  };

  bindClick() {
    this.canvas.addEventListener('click', (e) => {
      this.pointInPath(e, this.globalScale, this.showDetailModal);
      this.pointInExpand(e, this.globalScale, this.expandDetail);
    });
  };

  clearRect() {
    var width = this.globalScale < 1 ? Math.ceil(this.canvW / this.globalScale) : this.canvW;
    var height = this.globalScale < 1 ? Math.ceil(this.canvH / this.globalScale) : this.canvH;
    this.ctx.clearRect(-10, -10, width + 20, height + 20);
    this.ctx.fillStyle = this.BASECOLOR;
    this.ctx.rect(-10, -10, this.canvW / this.globalScale + 20, this.canvH / this.globalScale + 20);
    this.ctx.fill();
  }

  mouseWheelHandler(e) {
    e.preventDefault();
    var BS = 100 / 102; // 单次缩放比例
    var baseScale = 1;
    e = e || window.event
    var value = e.wheelDelta || -e.deltaY || -e.detail,
      delta = Math.max(-1, Math.min(1, value));
    if (delta < 0) {
      // scrolling down
      if (this.globalScale < 0.4) return; // 缩小限制
      baseScale = BS;
      this.scaleStep -= 1;
    } else {
      // scrolling up
      if (this.globalScale > 2) return; // 放大限制
      baseScale = 1 / BS;
      this.scaleStep += 1;
    }
    this.globalScale = Math.pow((this.scaleStep > 0 ? 1 / BS : BS), Math.abs(this.scaleStep));
    this.ctx.scale(baseScale, baseScale);
    this.clearRect();
    this.posiX = this.posiX + (1 - baseScale) * this.hoverX;
    this.posiY = this.posiY + (1 - baseScale) * this.hoverY;
    this.draw(this.posiX, this.posiY);
  }
}
