import { ValidationRules } from 'aurelia-validation';
import { AttachmentMap } from '@app/common/models/attachment';

export interface Order {
  id: string;
  cargoInfoId: string;
  agentId: string;
  agentName: string;
  customerId: string;
  customerName: string;
  batchNumber: string;
  outstockOrderNumber: string;
  outstockDate: Date;
  lastBatch: number;
  contactPerson: string;
  contactNumber: string;
  status: number;
  statusStr: string;
  paymentUnit: string;
  quantitySum: number;
  numberSum: number;
  unit: string;
  unitStr: string;
  lastStage: number;
  stage: number;
  auditorId: string;
  auditorName: string;
  auditTime: Date;
  takeDeliveryNum: string;
  remark: string;
  orgId: string;

  //出库车辆信息
  outstockVehicles: Vehicle[];

  //出库货物信息
  outstockOrderItems: OrderItem[];

  outstockDateStr: string;
  stageTitle: string;
  outstockStageName: string;

  cargoType: number;

  clearanceStatus: boolean;

  createTime: Date;
  createTimeStr: string;
  createAccountId: string;
  modifyAccountId: string;

  outstockLastStageName: string;

  attachments: AttachmentMap[];

}

export interface OrderItem {
  sign?: string;

  id: string;
  batchNumber: string;
  outstockOrderid: string;
  outstockOrderNumber: string;
  outstockOrderType: number;
  cargoItemId: string;
  cargoName: string;
  cargoCategoryName: string;
  cargoSubCategoryName: string;
  cargoType: number;
  warehouseId: string;
  warehouseName: string;
  orderQuantity: number;
  orderNumber: number;
  outstockQuantity: number;
  outstockNumber: number;
  pricingMode: number;
  unit: string;
  unitStr: string;
  price: number;
  containerNumber: string;
  remark: string;
  orgId: string;

  // 下标
  index: number;

  //可出库数量和件数
  canQuantity: number;
  canNumber: number;

  // 作业数量
  workOrderQuantity: number;
  // 作业件数
  workOrderNumber: number;
}

export interface Vehicle {
  //唯一性标识
  sign?: string;

  id: string;
  outstockOrderId: string;
  outstockOrderNumber: string;
  plateNumber: string;
  driverName: string;
  driverIdentityNumber: string;
  phoneNumber: string;
  remark: string;
  orgId: string;
}

export const orderValidationRules = ValidationRules
  .ensure((order: Order) => order.contactPerson)
  .displayName('联系人')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((order: Order) => order.batchNumber)
  .required().withMessage(`请选择批次`)

  .ensure((order: Order) => order.outstockOrderNumber)
  .displayName('出库单号')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((order: Order) => order.paymentUnit)
  .displayName('付款单位')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((order: Order) => order.contactNumber)
  .displayName('联系电话')
  .required().withMessage(`\${$displayName} 不能为空`)
  .satisfies(x => /^[1][34578][0-9]{9}$/.test(x)).withMessage(` 请输入正确的11位手机号码 e.g.139 0000 0000`)

  .ensure((order: Order) => order.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;

export const vehicleValidationRules = ValidationRules
  .ensure((vehicle: Vehicle) => vehicle.plateNumber)
  .displayName('车牌号')
  .required().withMessage(`\${$displayName} 不能为空`)
  .satisfies(x => /([冀豫云辽黑湘皖鲁苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼渝京津沪新京军空海北沈兰济南广成使领A-Z]{1}[a-zA-Z0-9]{5,6}[a-zA-Z0-9挂学警港澳]{1})$/
    .test(x)).withMessage(` 请输入正确车牌号`)

  .ensure((vehicle: Vehicle) => vehicle.driverName)
  .displayName('司机名称')
  .required().withMessage(`\${$displayName} 不能为空`)
  .satisfies(x => /^([\u4e00-\u9fa5]{1,20}|[a-zA-Z\.\s]{1,20})$/.test(x)).withMessage(` 请输入正确的姓名`)

  .ensure((vehicle: Vehicle) => vehicle.driverIdentityNumber)
  .displayName('身份证号')
  .satisfies(x => {
    if (!x) return true;
    return /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$)/.test(x);
  }).withMessage(` 请输入正确的18位身份证号`)

  .ensure((vehicle: Vehicle) => vehicle.phoneNumber)
  .displayName('电话')
  .satisfies(x => {
    if (!x) return true;
    return /^[1][34578][0-9]{9}$/.test(x);
  }).withMessage(` 请输入正确的11位手机号码 e.g.139 0000 0000`)
  .rules;

