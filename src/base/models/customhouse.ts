/**
 * 海关放行单
 */
export interface CustomhouseClearance {
  id: string;

  category: number; //类别

  instockFlowId: string; //入库流水主键

  outstockOrderId: string; //出库单主键

  customhouseFlowNumber: string; //流转单号

  customhouseRecordNumber: string; //备案号

  clearanceStatus: number; //放行状态 1 未放行 2 已放行

  categoryName?: string;
  clearanceStatusName?: string;
}

export interface CustomhouseClearanceVo {
  type: number; // 入库/出库

  flowId: string; //入库流水主键/出库

  customhouseNumber: string; //流转单号/备案号

  clearanceStatus: number; //放行状态 1 未放行 2 已放行
}