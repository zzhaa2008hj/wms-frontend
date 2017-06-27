export interface VerifyRecord {
  id?: string;
  category: number;
  batchNumber: string;
  businessId: string;
  businessType: number;
  businessTypeStr: string;
  businessName: string;
  stageBeforeVerify: number;
  stageAfterVerify: number;
  verifyStatus: number;
  verifyPerson: string;
  verifyTime: Date;
  verifyTimeStr: string;
  applyPerson: string;
  applyTime: Date;
  applyTimeStr: string;
  remark: string;
  orgId: string;
}

export interface VerifyBusiness {
  batchNumber: string;
  businessId: string;
  businessType: string;
  businessName: string;
  stageBeforeVerify: number;
}