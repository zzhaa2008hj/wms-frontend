import { ValidationRules } from 'aurelia-validation';
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

  clearanceStatus: boolean; //放行状态

  categoryName?: string;
  clearanceStatusName?: string;
}

export interface CustomhouseClearanceVo {
  type: number; // 入库/出库

  flowId: string; //入库流水主键/出库

  customhouseNumber: string; //流转单号/备案号

  clearanceStatus: boolean; //放行状态
}

export const validationRules = ValidationRules
  .ensure((e: CustomhouseClearanceVo)  => e.customhouseNumber)
  .displayName('流转单号/备案号')
  .required().withMessage(`\${$displayName} 不能为空`)
  .rules;