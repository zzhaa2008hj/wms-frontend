export interface OrderItem {
  id: string;

  instockOrderId: string ;

  cargoItemId: string ;

  agentId: string ;

  agentName: string ;

  customerId: string ;

  customerName: string ;

  batchNumber: string ;

  cargoName: string ;

  cargoCategoryId: string ;

  cargoCategoryName: string ;

  cargoSubCategoryName: string ;

  cargoType: number ;

  instockQuantity: number ;

  instockNumber: number ;

  unit: string ;

  remark: string ;

  orgId: string ;
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