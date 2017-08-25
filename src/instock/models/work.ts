export class WorkStatistics {
  id: string;

  workOrderCategory: number;

  workOrderCategoryStr: string;

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

  workOrderCategoryName : string;
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

  unit: string;
  unitStr: string;
}

export class WorkOrderDetail{
    workName: string ;
    customerName: string ;
    workNumber: number ;
    warehouseName: string ;
    quantity: number ;
    number: number ;
    unit: string ;
    containerNumber: string ;
    plateNumber: string ;
    driverName: string ;
    driverIdentityNumber: string ;
    phoneNumber: string ;
    workOrderNumber: string ;
    workDate: Date ;
    workOrderCategory: number ;
    cargoName: string ;
    cargoCategoryName: string ;
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