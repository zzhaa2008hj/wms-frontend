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
  orderQuantity: number;
  orderNumber: number;
  unit: string;
  lastBatch: string;
  contactPerson: string;
  contactNumber: string;
  status: number;
  stage: number;
  remark: string;
  orgId: string;

  //车辆信息
  vehicles: Vehicle[];
}
export interface InstockCargoItem {
  id: string;
  instockFlowId: string;
  batchNumber: string;
  instockFlowNumber: string;
  cargoItemId: string;
  orderQuantity: number;
  orderNumber: number;
  actualQuantity: number;
  actualNumber: number;
  unit: string;
  containerNumber: string;
  remark: string;
  orgId: string;
}
export interface Vehicle {
  instockGoodsId: string;
  plateNumber: string;
  driverName: string;
  driverIdentityNumber: string;
  phoneNumber: string;
  remark: string;
  orgId: string;

  //入库货物信息
  cargoItems: InstockCargoItem[];
}