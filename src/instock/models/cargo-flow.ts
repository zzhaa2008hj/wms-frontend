import { ValidationRules } from 'aurelia-validation';
import { AttachmentMap } from '@app/common/models/attachment';
import { InstockVehicle } from "@app/instock/models/instock-vehicle";
/**
 * Created by Hui on 2017/6/19.
 */
export interface CargoFlow {
  id: string;
  cargoInfoId: string;
  agentId: string;
  agentName: string;
  customerId: string;
  customerName: string;
  batchNumber: string;
  instockFlowNumber: string;
  instockDate: Date;
  instockDateStr: string;
  orderQuantity: number;
  orderNumber: number;
  unit: string;
  unitStr: string;
  lastBatch: number;
  contactPerson: string;
  contactNumber: string;
  status: number;
  statusStr: string;
  stage: number;
  instockStageName: string;
  remark: string;
  orgId: string;
  //入库单号
  instockOrderId: string;

  createTime: Date;
  createTimeStr: string;
  createAccount: string;
  createAccountId: string ;


  //入库货物信息
  cargoItems: InstockCargoItem[];
  // 上一阶段
  lastStage: number;
  instockLastStageName: string;

  attachments: AttachmentMap[];

  oldInstockFlowNumber: string;

  /**
   * 录入方式  1/null:正常录入 2：补录
   */
  enteringMode: number;

}
export interface InstockCargoItem {
  //唯一性标识
  sign?: string;

  id: string;
  instockFlowId: string;
  batchNumber: string;
  instockDate: Date;
  instockFlowNumber: string;
  cargoItemId: string;
  orderQuantity: number;
  orderNumber: number;
  actualQuantity: number;
  actualNumber: number;
  unit: string;
  unitStr: string;
  containerNumber: string;
  remark: string;
  orgId: string;
  cargoName: string;
  cargoCategoryName: string;
  cargoSubCatergoryName: string;

  freeDays: number;

  //车辆信息
  vehicles: InstockVehicle[];

  // 下标
  index: number;
}

export const cargoFlowValidationRules = ValidationRules
  .ensure((cargoFlow: CargoFlow) => cargoFlow.contactPerson)
  .displayName('联系人')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((cargoFlow: CargoFlow) => cargoFlow.instockFlowNumber)
  .displayName('入库流水单号')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((cargoFlow: CargoFlow) => cargoFlow.instockDate)
  .displayName('入库流水时间')
  .satisfies((instockDate, cargoFlow) => {
    if (cargoFlow.enteringMode == 2 && !instockDate) {
      return false;
    } else {
      return true;
    }
  })
  .withMessage(`\${$displayName} 不能为空`)

  .ensure((cargoFlow: CargoFlow) => cargoFlow.contactNumber)
  .displayName('联系电话')
  .required().withMessage(`\${$displayName} 不能为空`)
  .satisfies(x => /^[1][34578][0-9]{9}$/.test(x)).withMessage(` 请输入正确的11位手机号码 e.g.139 0000 0000`)

  .ensure((cargoFlow: CargoFlow) => cargoFlow.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;