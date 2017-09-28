export interface CargoownershipTransfer {
  id: string;
  orgId: string;
  remark: string;

  // 客户货物主键
  cargoInfoId: string;

  // 原批次号
  originalBatchNumber: string;

  // 原代理商主键
  originalAgentId: string;

  // 原代理商名称
  originalAgentName: string;

  // 原客户主键
  originalCustomerId: string;

  // 原客户名称
  originalCustomerName: string;

  // 新批次号
  newBatchNumber: string;

  // 新代理商主键
  newAgentId: string;

  // 新代理商名称
  newAgentName: string;

  // 新客户主键
  newCustomerId: string;

  // 新客户名称
  newCustomerName: string;

  // 转移日期
  transferDate: Date;

  // 仓储费结算至日期
  storageEndDate: Date;

  // 出库费承担方主键
  outstockChargePayerId: string;

  // 出库费承担方名称
  outstockChargePayerName: string;

  // 业务状态
  status: number;

  // 上一阶段号
  lastStage: number;

  // 当前阶段号
  stage: number;

  // 审核人主键
  auditorId: string;

  // 审核人名称
  auditorName: string;

  // 审核时间
  auditTime: Date;

  stageName: string;
  lastStageName: string;
}

//货权转移 货物信息
export interface CargoownershipTransferItem {
  //主键
  id: string ;
  //批次号
  batchNumber: string ;
// 货权转移id
  cargoownershipTransferId: string ;
//货物id
  cargoItemId: string;
  //货物名称
  cargoName: string;
  //货物类别id
  cargoCategoryId: string;
  //货物 类别名称
  cargoCategoryName: string;
  //品牌名称
  cargoSubCategoryName: string;
  // 指令数量
  orderQuantity: number;
  // 指令件数
  orderNumber: number;
  //单位
  unit: string;
  unitStr: string;


}

export interface CargoOwnershipTransferRate {
  batchNumber: string ;
  // 费用类型 出入库、移库等
  rateType: number ;
  rateTypeStr: string;

  // 费用类别 仓储费、装卸费等
  rateCategory: number ;
  // 作业ID
  workId: string ;
  // 作业名称
  workName: string;
  // 货权转移明细ID
  transferItemId: string;
  // 计价方式
  pricingMode: number;
  // 计价单位
  unit: string;

  unitStr: string;

  // 单价
  price: number;
  // 实际单价
  actualPrice: number;
  // 库区性质 内贸、保税、承包内贸、承包保税
  warehouseType: number;
  warehouseTypeStr: string;

  // 库区类别 场、库
  warehouseCategory: string;
  warehouseCategoryStr: string;

}

export interface CargoOwnershipTranferRateStep {
// 主键
  id: string ;
// 货权费率ID
  transferRateId: string;
  // 序号
  stepNumber: number;
  // 起始数
  stepStart: number;
  // 结尾数
  stepEnd: number;
  // 单价
  stepPrice: number;
  // 实际单价
  actualStepPrice: number;

  /*stepUnit: string;

  stepUnitName: string;

  stepUnitStr: string;*/
}
