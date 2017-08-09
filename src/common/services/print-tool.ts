// 更过属性及示例查看 http://192.168.133.118:8000/CLodopDemos/PrintSampIndex.html
/**
 * 打印
 * 
 * @export
 * @param {string} title     打印任务名称
 * @param {string} content   打印内容
 * @param {boolean} preview  是否预览
 */
export function print(title: string, content: string, preview: boolean, orient?: number) {
  let w = window as any;
  let lodop = w.CLODOP;
  lodop.PRINT_INITA(title);
  lodop.ADD_PRINT_HTM(10, 10, "100%", "100%", content);
  // 设置纸张打印方向：1---纵向打印，固定纸张； 2---横向打印，固定纸张；  3---纵向打印，宽度固定，高度按打印内容的高度自适应；0---方向不定，由操作者自行选择或按打印机缺省设置。
  if (orient) {
    lodop.SET_PRINT_PAGESIZE(orient);
  }
  //lodop.SET_PRINT_MODE("CATCH_PRINT_STATUS", true);
  if (preview) {
    lodop.PREVIEW();
  } else {
    lodop.PRINT();
  }
}

/**
 * 关闭窗口
 * 
 * @export
 */
export function closePrint() {
  let w = window as any;
  let lodop = w.CLODOP;
  lodop.PreviewBox.closeit();
}

/**
 * 检查打印状态
 * 
 * @export
 * @param {string} jobCode 
 * @returns {string} 
 */
export function checkPrintStatus(jobCode: string): string {
  let w = window as any;
  let lodop = w.CLODOP;
  return lodop.GET_VALUE("PRINT_STATUS_OK", jobCode);
}

export function addHeader(content: string): string {
  let header = '<!DOCTYPE html><html><head></head><body>';
  let footer = '</body>';
  return header + content + footer;
}