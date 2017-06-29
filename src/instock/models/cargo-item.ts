export interface CargoItem {
  id: string;

  instockFlowId: string;

  batchNumber: string;

  instockFlowNumber: string;

  instockDate: Date;

  cargoItemId: string;

  orderQuantity: number;

  orderNumber: number;

  unit: string;

  containerNumber: string;

  remark: string;

  orgId: string;
}