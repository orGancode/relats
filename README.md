# relats
## 预览
### 缩放、拖拽
![shot1](https://github.com/orGancode/relats/blob/master/static/zoom.gif)
### 悬浮、点击
![shot1](https://github.com/orGancode/relats/blob/master/static/hover.gif)
### 展开、收缩
![shot1](https://github.com/orGancode/relats/blob/master/static/expand.gif)
## 使用
### step 1、 安装
> npm install
### step 2、 打包
> 运行开发 npm run start
> 运行打包 npm run build
### step 3、 访问
> http://localhost:8080

## 介绍
![shot1](https://github.com/orGancode/relats/blob/master/static/shot1.jpg)
### 组件
- 绑定缩放&拖拽事件 BindZoomDrag
- 线条 LinkLine
- 节点 BlockNode
### 数据入口
```
  [
  {id: 1, name: '股东1', type: 2, isPerson: true, detailJson: '{"cc": "32.5%"}', to: [7] },
  { id: 2, name: '我是股东名字很长很长', type: 2, isPerson: true, detailJson: '{"cc": "19.6%"}', to: [8] },
  { id: 3, name: '高管3', type: 2, isPerson: true, detailJson: '{"cc": "10%"}', to: [9] },
  { id: 4, name: '高管4', type: 2, isPerson: true, detailJson: '{"cc": "16.3%"}', to: [9] },
  ...]
```
