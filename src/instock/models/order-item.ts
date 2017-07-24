export interface OrderItem {
  id: string;

  instockOrderId: string;

  cargoItemId: string;

  agentId: string;

  agentName: string;

  customerId: string;

  customerName: string;

  batchNumber: string;

  cargoName: string;

  cargoCategoryId: string;

  cargoCategoryName: string;

  cargoSubCategoryName: string;

  cargoType: number;

  instockQuantity: number;

  instockNumber: number;

  unit: string;

  remark: string;

  orgId: string;

  createTime: Date;
  createTimeStr: string;

  createAccount: string;
}

export interface TallyItem {
  id: string;
  instockOrderItemId: string;
  instockDate: string;
  cargoCategoryName: string;
  cargoSubCategoryName: string;
  tallyQuantity:  number;
  tallyNumber: number;
  unit: string;
  remark: string;
  index: number;
}

export interface InstockHeapInfo {
  instockDate: Date;

  warehouseName: string;

  storageQuantity: number;

  storageNumber: number;

  containerNumber: string;

  unit: string;

  instockOrderItemId: string;
}