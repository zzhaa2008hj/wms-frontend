export interface PositionTransferRate {
  id: string;

  orgId: string;

  remark: string;
  //批次号
  batchNumber: string;

  //费用类型
  rateType: number;

  //费用类别
  rateCategory: number;

  //作业内容主键
  workId: string;

  //作业内容
  workName: string;

  //货位转移明细主键
  transferId: string;

  //计量方式
  pricingMode: number;

  //计量单位
  unit: string;

  //单价
  price: number;

  //库区类别
  warehouseCategory: number;
}

export interface PositionTransferRateItem {
  id: string;

  orgId: string;

  remark: string;

  //货位转移费率表主键
  transferRateId: string;

  //阶梯号
  stepNum: number;

  //开始值
  stepStart: number;

  //结束值
  stepEnd: number;

  //阶梯价
  stepPrice: number;

  //单位
  unit: string;
}