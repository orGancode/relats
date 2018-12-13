// type 1 主要对象 2 股东 3 子公司 4 子公司
const nodes = [
  { id: 1, name: '股东1', type: 2, isPerson: true, detailJson: '{"cc": "32.5%"}', to: [7] },
  { id: 2, name: '我是股东名字很长很长', type: 2, isPerson: true, detailJson: '{"cc": "19.6%"}', to: [8] },
  { id: 3, name: '高管3', type: 2, isPerson: true, detailJson: '{"cc": "10%"}', to: [9] },
  { id: 4, name: '高管4', type: 2, isPerson: true, detailJson: '{"cc": "16.3%"}', to: [9] },
  { id: 5, name: '股东公司1', type: 2, isPerson: false, detailJson: '{"cc": "42.5%"}', to: [9] },
  { id: 6, name: '股东公司2', type: 2, isPerson: false, detailJson: '{"cc": "62.15%"}', to: [21] },
  { id: 7, name: '股东公司3', type: 2, isPerson: false, hasParents: true, detailJson: '{"cc": "26%"}', to: [21] },
  { id: 21, name: '股东公司13', type: 2, isPerson: false, hasParents: true, detailJson: '{"cc": "26%"}', to: [10] },
  { id: 8, name: '股东公司4', type: 2, isPerson: false, hasParents: true, detailJson: '{"cc": "14%"}', to: [11] },
  { id: 9, name: '股东公司股东公司股东公司股东公司股东公司5', type: 2, isPerson: false, hasParents: true, detailJson: '{"cc": "8.8%"}', to: [11] },
  { id: 10, name: '股东公司6', type: 2, isPerson: false, hasParents: true, detailJson: '{"cc": "12.5%"}', to: [13] },
  { id: 11, name: '股东公司7', type: 2, isPerson: false, hasParents: true, detailJson: '{"cc": "12.5%"}', to: [13] },
  { id: 12, name: '股东公司8', type: 2, isPerson: false, detailJson: '{"cc": "29.55%"}', to: [13] },
  { id: 13, name: '主要对象', type: 1, isPerson: false, detailJson: '{"marketTag": "注"}', to: [14, 15] },
  { id: 14, name: '子公司1', type: 3, isPerson: false, detailJson: '{"cc": "100%"}', to: [16, 17] },
  { id: 15, name: '子公司2', type: 3, isPerson: false, detailJson: '{"cc": "100%"}', to: [18] },
  { id: 16, name: '子公司3', type: 3, isPerson: false, detailJson: '{"cc": "100%"}', to: [] },
  { id: 17, name: '子子公司4', type: 4, isPerson: false, detailJson: '{"cc": "100%"}', to: [] },
  { id: 18, name: '子公司5', type: 3, isPerson: false, detailJson: '{"cc": "100%"}', to: [19, 20] },
  { id: 19, name: '子子公司1', type: 4, isPerson: false, detailJson: '{"cc": "100%"}', to: [] },
  { id: 20, name: '子子公司2', type: 4, isPerson: false, detailJson: '{"cc": "100%"}', to: [] }
]

let links = [];

nodes.forEach((item) => {
  links = links.concat(item.to.map(val => ({ sourceId: item.id, targetId: val })));
});

export default {
  nodes,
  links
}

