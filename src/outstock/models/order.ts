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

