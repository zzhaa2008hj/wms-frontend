export interface Organization {
  id: string ;
  /**
   * 1：客户仓储；2：装卸单位；3：库区租赁
   */
  contractType: number ;

  customerId: string;

  customerName: string;

  contractNumber: string;

  contractName: string;

  contractAmount: number;

  startTime: Date;

  endTime: Date;

  signer: string;

  signDate: Date;

  auditorId: string;

  auditorName: string;

  auditorTime: Date;

  status: number;

  remark: string;

  orgId: string;
}