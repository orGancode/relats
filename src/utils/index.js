export function addMouseWheelHandler(dom, handler) {
  if (document.addEventListener) {
    dom.addEventListener('mousewheel', handler, false); //IE9, Chrome, Safari, Oper
    dom.addEventListener('wheel', handler, false); //Firefox
    dom.addEventListener('DOMMouseScroll', handler, false); //Old Firefox
  } else {
    dom.attachEvent('onmousewheel', handler); //IE 6/7/8
  }
}
export function stopDefault(e) {
  //W3C
  if (e && e.preventDefault)
    e.preventDefault();
  //IE
  else
    window.event.returnValue = false;
  return false;
}
export function colorMap(type) {
  let baseColor = '';
  switch (type) {
    case 1: baseColor = 'rgb(155, 156, 225)'; break;
    case 2: baseColor = 'rgb(5, 128, 141)'; break;
    case 3: baseColor = 'rgb(203, 113, 240)'; break;
    case 4: baseColor = 'rgb(100, 169, 246)'; break;
    default:
  }
  return {
    bgc: baseColor.replace(/^rgb\((.*)\)$/, 'rgba($1, 0.3)'),
    bdc: baseColor.replace(/^rgb\((.*)\)$/, 'rgba($1, 0.8)'),
    co: baseColor
  }
}
export function orderToCenter(arr) {
  let ci = Math.floor(arr.length / 2);
  let brr = [];
  for (let i = 0; i < (ci + 1); i++) {
    let lefti = ci - i;
    let righti = ci + i;
    if (lefti >= 0 && (arr[lefti] !== undefined)) brr.push(arr[lefti]);
    if (righti !== lefti && (arr[righti] !== undefined)) brr.push(arr[righti]);
  }
  return brr;
}

export function filterArray(array, condition, breakFunction) {
  if (!(array instanceof Array)) return array;
  if (!(condition instanceof Function)) return array;
  let res = [];
  for (let i = 0, l = array.length; i < l; i++) {
    if (condition(array[i], i)) res.push(array[i]);
    if ((breakFunction instanceof Function) && breakFunction(res)) break;
  }
  return res;
}
