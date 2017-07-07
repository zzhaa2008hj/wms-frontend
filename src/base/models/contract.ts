export interface Contract {
  id: string;
  /**
   * 1：客户仓储；2：装卸单位；3：库区租赁
   */
  contractType: number;
  
  contractTypeStr: string;

  customerId: string;

  customerName: string;

  contractNumber: string;

  contractName: string;

  contractAmount: number;

  startTime: Date;
  startTimeStr: string;

  endTime: Date;
  endTimeStr: string;

  signer: string;

  signDate: Date;
  signDateStr: string;

  auditorId: string;

  auditorName: string;

  auditorTime: Date;

  status: number;
  statusTitle: string;

  remark: string;

  orgId: string;

}