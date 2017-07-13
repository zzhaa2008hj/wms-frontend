export class WorkStatistics {
  id: string;

  workOrderCategory: number;

  businessId: string;

  batchNumber: string;

  workOrderSum: number;

  quantity: number;

  number: number;

  unit: string;

  remark: string;

  orgId: string;
}
export class WorkOrder {
  id: string;

  workOrderCategory: number;

  businessId: string;

  plateNumber: string;

  driverName: string;

  driverIdentityNumber: string;

  phoneNumber: string;

  workOrderNumber: string;

  batchNumber: string;

  workDate: Date;

  remark: string;

  orgId: string;
}

export class WorkOrderItem{
  id: string ;

  batchNumber: string ;

  workAreaId: string ;

  workId: string ;

  workName: string ;

  workNumber: number ;

  customerId: string ;

  customerName: string ;

  remark: string ;

  orgId: string ;
}

export class WorkOrderArea{
  id: string ;

  workOrderId: string ;

  quantity: number ;

  number: number ;

  unit: string ;

  warehouseId: string ;

  warehouseName: string ;

  containerType: number ;

  containerNumber: string ;

  remark: string ;

  orgId: string ;

  sign: string;

  workOrderItem: WorkOrderItem[];
}