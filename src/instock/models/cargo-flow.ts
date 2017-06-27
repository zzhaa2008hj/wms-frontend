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
  lastBatch: number;
  contactPerson: string;
  contactNumber: string;
  status: number;
  stage: number;
  remark: string;
  orgId: string;
}