export interface PositionTransferInfo {
  id: string;
  cargoInfoId: string;
  batchNumber: string;
  transferNumber: string;
  demandFrom: number;
  agentId: string;
  agentName: string;
  customerId: string;
  customerName: string;
  status: number;
  lastStage: number;
  stage: number;
  auditorId: string;
  auditorName: string;
  auditTime: Date;
  remark: string;
  orgId: string;
  createTime: Date;
}