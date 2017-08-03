// 更过属性及示例查看 http://192.168.133.118:8000/CLodopDemos/PrintSampIndex.html
/**
 * 打印
 * 
 * @export
 * @param {string} title     打印任务名称
 * @param {string} content   打印内容
 * @param {boolean} preview  是否预览
 */
export function print(title: string, content: string, preview: boolean) {
  let w = window as any;
  let lodop = w.CLODOP;
  lodop.PRINT_INITA(title);
  lodop.ADD_PRINT_HTM(10, 10, "100%", "100%", content);
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