export interface VerifyRecord {
  id?: string;
  category: string;
  batchNumber: string;
  businessId: string;
  businessName: string;
  stageBeforeVerify: number;
  stageAfterVerify: number;
  verifyStatus: boolean;
  applyPerson: string;
  applyTime: Date;
  verifyPerson: string;
  verifyTime: Date;
  remark: string;
  orgId: string;
}

export interface VerifyBusiness {
  batchNumber: string;
  businessId: string;
  businessName: string;
  stageBeforeVerify: number;
}