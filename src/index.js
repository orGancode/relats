import './index.css';
import './style.scss';

import data from './data/relates';
import BindZoomDrag from './components/bindZoomDrag.js';
import BlockNode from './components/blockNode.js';
import LinkLine from './components/linkline.js';
import { filterArray, orderToCenter, colorMap } from './utils/index';

export default function () {

  const dpr = window.devicePixelRatio;
  const LINEHEIGHT = 140;
  const NODESMARG = 40;
  const NODEMARG = 30;
  const BASECOLOR = '#ffffff';
  const NODEW = 100;
  const NODEH = 40;

  // 画布初始化
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  const canvH = canvas.parentElement.clientHeight;
  const canvW = canvas.parentElement.clientWidth;
  let allNodeDraws = [];

  canvas.width = canvW;
  canvas.height = canvH;
  context.imageSmoothingEnabled = true;
  context.translate(0.5, 0.5);
  context.scale(dpr, dpr); // 处理模糊,

  context.fillStyle = BASECOLOR;
  context.rect(-10, -10, canvW + 20, canvH + 20);
  context.fill();


  const targetNode = filterArray(data.nodes, (item) => { return item.type === 1 }, (item) => { return item.type === 1 })[0];
  let showNodes = getLayerData(data.nodes, 12);
  let horizonNodes = {
    0: {
      lays: [{ nodes: [targetNode], nodeWidth: NODEW }],
      layWidth: NODEW
    }
  };// 水平层级节点集合

  dealNodeStruction(targetNode, data, 'up', 1);
  dealNodeStruction(targetNode, data, 'down', -1);
  let cx = 0;
  let cy = 0;
  draw();

  function draw(x, y) {
    cx = x || cx;
    cy = y || cy;
    // 研究对象并绘制在最中间
    const centerPoint = {
      x: (cx + canvW / 2) | 0,
      y: (cy + canvH / 2) | 0
    }

    if (!targetNode) return;
    drawNodes(context, horizonNodes, centerPoint);
  }

  const canvasZD = new BindZoomDrag({
    canvas,
    ctx: context,
    draw,
    showDetailModal,
    expandDetail,
    pointInExpand,
    pointInPath,
    showTooltip,
    BASECOLOR
  });


  function drawNodes(context, nodeColl, centerPoint) {
    allNodeDraws = [];
    for (let key in nodeColl) {
      const posY = centerPoint.y - (+key) * LINEHEIGHT;
      const layNodes = orderToCenter(nodeColl[key].lays); // 调整子集顺序从中间开始计算节点位置
      let posiLimit = { left: null, right: null }; //每一层的绘制区域限制，防止位置重叠
      layNodes.forEach(function (item, li) {
        // 子集的参考中点，如果无限制则以此为参考点绘制，否则向右或向左偏移
        const referNode = filterArray(allNodeDraws, (nd) => { return item.target.id === nd.id })[0];
        const referX = referNode ? (referNode.posX + (NODEW / 2)) : centerPoint.x;
        const needPosition = { left: referX - item.nodeWidth / 2, right: referX + item.nodeWidth / 2 }; // 所需的水平位置
        let nodesStartX = needPosition.left; // 中心起始
        if (!li) {
          posiLimit = {
            left: needPosition.left - NODESMARG,
            right: needPosition.right + NODESMARG,
          };
        }
        if (li && li % 2) { // 向左绘制
          if (needPosition.right > posiLimit.left) { // 有重叠
            const dis = needPosition.right - posiLimit.left;
            nodesStartX = needPosition.left - dis;
          }
          posiLimit.left = nodesStartX - NODESMARG; // 更新左侧限制
        }
        if (li && !(li % 2)) { // 向右绘制
          if (needPosition.left < posiLimit.right) { // 有重叠
            const dis = posiLimit.right - needPosition.left;
            nodesStartX = needPosition.left + dis;
          }
          posiLimit.right = nodesStartX + item.nodeWidth + NODESMARG; // 更新右侧限制
        }

        item.nodes.forEach(function (node, ni) {
          const block = new BlockNode({
            NODEW,
            NODEH,
            BASECOLOR,
            nodeInfo: node,
            px: nodesStartX + (NODEW / 2) + ni * (NODEW + NODEMARG),
            py: posY,
            ctx: context
          });
          allNodeDraws.push(block);
        });
      });
    }
    for (let key in nodeColl) {
      if (key !== '0') {
        nodeColl[key].lays.forEach(function (item, li) {
          const targetDrawed = findBlockNode(allNodeDraws, item.target);
          item.nodes.forEach(function (node) {
            const blockDrawed = findBlockNode(allNodeDraws, node);
            const startX = findBlockNode(allNodeDraws, item.nodes[0]).posX;
            const stopX = startX + nodeColl[key].lays[li].nodeWidth;
            const lineOps = {
              ctx: context,
              in: key > 0 ? blockDrawed.out : targetDrawed.out,
              out: key > 0 ? targetDrawed.in : blockDrawed.in,
            };
            (+ key > 0) && (lineOps.tpux = (startX + stopX) / 2);
            (+ key < 0) && (lineOps.tpdx = (startX + stopX) / 2)
            new LinkLine(lineOps).draw();
          });
        });
      }
    }
    allNodeDraws.forEach(function (nodeDraw) {
      nodeDraw.draw();
      if (nodeDraw.type === 1) {
        const t1 = '股东/高管', t2 = '子公司/对外投资';
        nodeDraw.drawNote(t1, nodeDraw.in.x, nodeDraw.in.y - 40, '#666');
        nodeDraw.drawNote(t2, nodeDraw.out.x, nodeDraw.out.y + 20, '#666');
      }
      if (nodeDraw.detail.cc) {
        let x = nodeDraw.in.x;
        let y = nodeDraw.in.y - 28;
        if (nodeDraw.type === 2) {
          x = nodeDraw.out.x;
          y = nodeDraw.out.y + 5;
        }
        nodeDraw.drawNote(nodeDraw.detail.cc, x, y, colorMap(nodeDraw.type).co);
      }
      if (nodeDraw.detail.marketTag) {
        const x = nodeDraw.in.x - nodeDraw.width / 2 - 10;
        const y = nodeDraw.in.y - 2;
        nodeDraw.drawNote(nodeDraw.detail.marketTag, x, y, '#fff', '#4facfe');
      }
    })
  }

  function findBlockNode(data, condi) {
    for (let i = 0, l = data.length; i < l; i++) {
      if (data[i].id === condi.id) {
        return data[i];
      }
    }
  }

  /**
   * @param target 研究对象
   * @param nodeData 节点数据
   */
  function dealNodeStruction(target, nodeData, type, layer, center) {
    let bottomRelationIds = [];
    let bottomRelationNodes = [];
    let topRelationIds = [];
    let topRelationNodes = [];
    if (type === 'down') {
      // 从links中查找target是否有下级联系
      bottomRelationIds = filterArray(nodeData.links, (item) => { return item.sourceId === target.id }).map(function (val) { return val.targetId });
      if (bottomRelationIds.length) {
        // 从节点中找出关系节点 找完即退出循环
        bottomRelationNodes = [];
        filterArray(showNodes, (item) => {
          if (bottomRelationIds.includes(item.id)) {
            bottomRelationNodes.push(item);
          }
        }, () => { return bottomRelationIds.length === bottomRelationNodes.length });
        if (!bottomRelationNodes.length) return;
        if (!horizonNodes[layer]) {
          horizonNodes[layer] = {
            lays: [{
              nodes: bottomRelationNodes,
              target: target,
              // targetKey: layer + 1,
              nodeWidth: bottomRelationNodes.length * (NODEW + NODEMARG) - NODEMARG
            }],
            layWidth: bottomRelationNodes.length * (NODEW + NODEMARG) - NODEMARG
          }
        } else {
          horizonNodes[layer].lays.push({
            nodes: bottomRelationNodes,
            target: target,
            // targetKey: layer + 1,
            nodeWidth: bottomRelationNodes.length * (NODEW + NODEMARG) - NODEMARG
          });
          horizonNodes[layer].layWidth += (bottomRelationNodes.length * (NODEW + NODEMARG) - NODEMARG + NODESMARG);
        }
        bottomRelationNodes.forEach(function (item) {
          dealNodeStruction(item, nodeData, type, layer - 1, center);
        });
      }
    } else if (type === 'up') {
      // 从links中查找target是否有上级联系
      topRelationIds = filterArray(nodeData.links, (item) => { return item.targetId === target.id }).map(function (val) { return val.sourceId });
      if (topRelationIds.length) {
        // 从节点中找出关系节点 找完即退出循环
        topRelationNodes = [];
        filterArray(showNodes, (item) => {
          if (topRelationIds.includes(item.id)) {
            topRelationNodes.push(item);
          }
        }, () => { return topRelationIds.length === topRelationNodes.length });
        if (!topRelationNodes.length) return;
        if (!horizonNodes[layer]) {
          horizonNodes[layer] = {
            lays: [{
              nodes: topRelationNodes,
              target: target,
              // targetKey: layer - 1,
              nodeWidth: topRelationNodes.length * (NODEW + NODEMARG) - NODEMARG
            }],
            layWidth: topRelationNodes.length * (NODEW + NODEMARG) - NODEMARG
          }
        } else {
          horizonNodes[layer].lays.push({
            nodes: topRelationNodes,
            target: target,
            // targetKey: layer - 1,
            nodeWidth: topRelationNodes.length * (NODEW + NODEMARG) - NODEMARG
          });
          horizonNodes[layer].layWidth += (topRelationNodes.length * (NODEW + NODEMARG) - NODEMARG + NODESMARG);
        }
        topRelationNodes.forEach(function (item) {
          dealNodeStruction(item, nodeData, type, layer + 1, center);
        });
      }
    }
  }

  function showTooltip(point, node, scale) {
    const tooltip = document.getElementById('tooltip');
    document.getElementById('canvas').style.cursor = 'pointer';
    tooltip.innerHTML = node.text;
    tooltip.style.display = 'block';
    const x = point.x * scale;
    const y = point.y * scale;
    if (canvW - x <= 120) {
      tooltip.style.left = 'auto';
      tooltip.style.right = 40 + 'px';
    } else {
      tooltip.style.right = 'auto';
      tooltip.style.left = x + 20 + 'px';
    }
    if (canvH - y <= 60) {
      tooltip.style.top = 'auto';
      tooltip.style.bottom = 50 + 'px';
    } else {
      tooltip.style.bottom = 'auto';
      tooltip.style.top = y + 20 + 'px';
    }
  }

  // 弹窗显示详情
  function showDetailModal(point, node, scale) {
    const keys = Object.keys(node.detail);
    if (keys.length) {
      const modal = document.getElementById('node-detail');
      const modalLayer = document.querySelectorAll('.modal-layer')[0];
      modal.style.display = 'block';
      modalLayer.style.display = 'block';

      modal.children[1].innerHTML = '名称：' + node.text;

      setTimeout(function () {
        modal.className = 'modal show';
        modalLayer.className = 'modal-layer show';
      }, 0);
      modal.children[0].children[0].onclick = null;
      modal.children[0].children[0].onclick = () => {
        modal.className = 'modal';
        modal.style.display = 'none';
        modalLayer.className = 'modal-layer';
        modalLayer.style.display = 'none';
      };
    }
  }

  function expandDetail(point, node, scale) {
    // update node
    showNodes = updateLayerData(data.nodes, showNodes, node.nodeInfo, !node.nodeInfo.opened);
    // 重绘
    horizonNodes = {
      0: {
        lays: [{ nodes: [targetNode], nodeWidth: NODEW }],
        layWidth: NODEW
      }
    };// 水平层级节点集合
    dealNodeStruction(targetNode, data, 'up', 1);
    dealNodeStruction(targetNode, data, 'down', -1);
    canvasZD.clearRect();
    draw();
  }

  // 指针在节点中的检测
  function pointInPath(e, scale, cb, elseCb) {
    const point = {
      x: e.offsetX / scale,
      y: e.offsetY / scale
    };
    for (let i = 0, l = allNodeDraws.length; i < l; i++) {
      const min = {
        x: allNodeDraws[i].posX,
        y: allNodeDraws[i].posY
      };
      const max = {
        x: min.x + allNodeDraws[i].width,
        y: min.y + allNodeDraws[i].height,
      };
      if (point.x > min.x && point.x < max.x && point.y > min.y && point.y < max.y) {
        cb && cb(point, allNodeDraws[i], scale);
        return true;
      } else {
        elseCb && elseCb();
      }
    }
    return false;
  }
  // 指针在展开btn中的检测
  function pointInExpand(e, scale, cb, elseCb) {
    const point = {
      x: e.offsetX / scale,
      y: e.offsetY / scale
    };
    for (let i = 0, l = allNodeDraws.length; i < l; i++) {
      const center = allNodeDraws[i].expBtnPoint;
      if (!center) continue;
      const dis = Math.sqrt(Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2));
      if (dis < allNodeDraws[i].expBtnRadius) {
        cb && cb(point, allNodeDraws[i], scale);
        return true;
      } else {
        elseCb && elseCb();
      }
    }
    return false;
  }

  // 获取层级数据
  // dnodes原始所有所有数据，num层级数
  function getLayerData(dnodes, num) {
    num = num || 2;
    const targetId = targetNode.id;
    const nodeIds = dnodes.map(function (item) { return item.id });
    const result = [dnodes[nodeIds.indexOf(targetId)]];
    // 向下遍历
    loopFindNode(dnodes, targetId,
      (n, id, ls) => {
        const childs = dnodes[nodeIds.indexOf(id)].to;
        return (n.to && (ls < num && childs.indexOf(n.id) >= 0))
      }, (n, ls) => {
        if (ls < num) n.opened = true;
        result.push(n);
      }, 0);
    // 向上遍历
    loopFindNode(dnodes, targetId,
      (n, id, ls) => {
        // 判断条件，如果n的子集包含目标id，则说明n是id节点的父
        // ls 层级数 num限制数据
        return (n.to && (ls < num && n.to.indexOf(id) >= 0))
      }, (n, ls) => {
        if (ls < num) n.opened = true;
        result.push(n);
      }, 0);

    // // 抽象出递归遍历的方法 loopFindNode 替代以下方法
    // const findChild = (id, ls) => {
    //   const childs = dnodes[nodeIds.indexOf(id)].to;
    //   for (let i = 0, l = dnodes.length; i < l; i++) {
    //     if (ls < num && childs.indexOf(dnodes[i].id) >= 0) {
    //       result.push(dnodes[i]);
    //       findChild(dnodes[i].id, ls + 1);
    //     }
    //   }
    // }

    // const findTop = (id, ls) => {
    //   for (let i = 0, l = dnodes.length; i < l; i++) {
    //     if (ls < num && dnodes[i].to.indexOf(id) >= 0) {
    //       result.push(dnodes[i]);
    //       findTop(dnodes[i].id, ls + 1);
    //     }
    //   }
    // }

    // findChild(targetId, 0); // 从0开始，因为层数不包含研究对象
    // findTop(targetId, 0); // 从0开始，因为层数不包含研究对象
    return result
  }
  // 更新层级数据
  // dnodes 所有节点，oldNodes 旧节点数，changeId 发生变化的节点，openIt 是否打开它
  function updateLayerData(dnodes, oldNodes, change, openIt) {
    let result = [];
    if (openIt) {
      result = unSpliceNode(dnodes, oldNodes, change, openIt);
    } else {
      result = spliceNode(oldNodes, change, openIt);
    }
    return result;
  }

  // 收缩
  function spliceNode(oNodes, node, openIt) {
    const result = [];
    let hideIds = [];
    if (node.type === 2) {
      loopFindNode(oNodes, node.id,
        (n, id) => {
          // 判断条件，如果n的子集包含目标id，则说明n是id节点的父
          return (n.to && n.to.indexOf(id) >= 0)
        }, (n) => {
          hideIds.push(n.id)
        });
    } else {
      const findChildIds = (id) => {
        oNodes.forEach(element => {
          if (element.id === id && element.to && element.to.length) {
            hideIds = hideIds.concat(element.to);
            element.to.forEach(item => {
              findChildIds(item);
            })
          }
        });
      }
      findChildIds(node.id);
    }
    oNodes.forEach(ele => {
      if (hideIds.indexOf(ele.id) < 0) {
        if (node.id === ele.id) {
          ele.opened = openIt;
        }
        result.push(ele);
      }
    })
    return result;
  }

  // 展开
  function unSpliceNode(nodes, oNodes, node, openIt) {
    const result = [];
    let i, l;
    if (node.type === 2) {
      for (i = 0, l = nodes.length; i < l; i++) {
        if (nodes[i].to.indexOf(node.id) >= 0) {
          nodes[i].opened = !openIt; // 修改展开的子节点expandBtn应该为关闭状态
          result.push(nodes[i]);
        }
      }
    } else {
      for (i = 0, l = nodes.length; i < l; i++) {
        if (node.to.indexOf(nodes[i].id) >= 0) {
          nodes[i].opened = !openIt; // 修改展开的子节点expandBtn应该为关闭状态
          result.push(nodes[i]);
        }
        if (result.length === node.to.length) {
          break;
        }
      }
    }
    // 修改open状态
    for (i = 0, l = oNodes.length; i < l; i++) {
      if (node.id === oNodes[i].id) {
        oNodes[i].opened = openIt;
        break;
      }
    }
    return oNodes.concat(result);
  }

  // 抽象出递归遍历的方法
  function loopFindNode(nodes, targetId, condiFunc, trueFunc, s, a) {
    const finds = (id, la) => {
      for (let i = 0, l = nodes.length; i < l; i++) {
        if (condiFunc(nodes[i], id, la)) {
          trueFunc(nodes[i], la + 1);
          finds(nodes[i].id, la !== undefined ? la + 1 : undefined);
        }
      }
    }
    finds(targetId, s !== undefined ? s : undefined);
  }

}

