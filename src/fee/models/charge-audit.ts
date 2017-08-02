export interface ChargeAuditList {
  id: string;
  chargeInfoId: string;
  batchNumber: string;
  billLadingNumber: string;
  containerQuantity: number;
  warehousingAmount: number;
  loadingAmount: number;
  otherAmount: number;
  sumAmount: number;
  invoiceType: number;
  invoiceStatus: number;
  invoiceNumber: string;
  paymentUnit: string;
  paymentDate: Date;
  paymentStatus: number;
  receivableAmount: number;
  receivedAmount: number;
  remark: string;
  orgId: string;
}
export interface ChargeAuditItem {

}