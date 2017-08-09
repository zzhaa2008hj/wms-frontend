
export interface DailyInventory {
  customerName: string;

  batchNumber: string;

  cargoCategoryId: string;

  cargoCategoryName: string;

  cargoName: string;

  instockNumber: number;

  instockQuantity: number;

  unit: string;

  outstockNumber: number;

  outstockQuantity: number;

  containerType: string;

  containerNumber: string;

  warehouseKeeper: string;

  workCustomerName: string;

  warehouseName: string;

  createTime: Date;
}