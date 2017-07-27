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

  //入库货物信息
  cargoItems: InstockCargoItem[];
  // 上一阶段
  lastStage: number;
  instockLastStageName: string;
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
  vehicles: Vehicle[];

  // 下标
  index: number;
}

export interface Vehicle {
  //唯一性标识
  sign?: string;

  id: string;
  instockGoodsId: string;
  plateNumber: string;
  driverName: string;
  driverIdentityNumber: string;
  phoneNumber: string;
  remark: string;
  orgId: string;
  cargoName: string;
}