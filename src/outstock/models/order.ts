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
  lastStage: number;
  stage: number;
  auditorId: string;
  auditorName: string;
  auditTime: Date;
  takeDeliveryNum: string;
  remark: string;

  //出库车辆信息
  outstockVehicles: Vehicle[];

  //出库货物信息
  outstockOrderItems: OrderItem[];

  outstockDateStr: string;
  stageTitle: string;
}

export interface OrderItem {
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
  price: number;
  containerNumber: string;
  remark: string;
  orgId: string;
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