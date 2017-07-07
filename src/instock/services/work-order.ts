import { autoinject } from "aurelia-dependency-injection";
import { dateConverter, handleResult, Query, RestClient, fixDate } from "@app/utils";
import { WorkOrder, WorkOrderItem } from "@app/instock/models/work";
/**
 * 查询条件
 */
export interface WorkOrderCriteria {
  searchName?: string;
  businessId?: string;
  flowId?: string;
}

export interface WorkOrderAndItems {
  warehouseWorkOrder?: WorkOrder;
  list?: WorkOrderItem[];
}

@autoinject
export class WorkOrderService {
  constructor(private http: RestClient) {
  }

  queryWorkOders(criteria: WorkOrderCriteria): Query<WorkOrder> {
    return this.http.query<WorkOrder>(`/instock/warehouseWorkOrder/pageByFlowId`, criteria)
      .map(c => fixDate(c, "workDate"));
  }

  queryWorkOrdersByCargo(criteria:WorkOrderCriteria):Query<WorkOrder>{
    return this.http.query<WorkOrder>(`/instock/warehouseWorkOrder/page`, criteria)
      .map(c => fixDate(c, "workDate"));
  }

  getWorkOders(businessId: string): Promise<WorkOrder[]> {
    return this.http.get(`/instock/warehouseWorkOrder/list/${businessId}`)
      .then(res => res.content.map(dateConverter("workDate")));
  }

  saveWorkOrder(workOrder: WorkOrder): Promise<void> {
    return this.http.post(`/instock/warehouseWorkOrder`, workOrder).then(handleResult);
  }

  saveWorkOrderAndItems(workOrderAndItems: WorkOrderAndItems): Promise<void> {
    return this.http.post(`/instock/warehouseWorkOrder/saveWorkAndItems`, workOrderAndItems).then(handleResult);
  }
}

@autoinject
export class WorkOderItemService {
  constructor(private http: RestClient) {
  }

  getWorkOrderItems(workOrderId: string): Promise<WorkOrderItem[]> {
    return this.http.get(`/instock/warehouseWorkOrderItem/list/${workOrderId}`).then(res => res.content);
  }

  saveWorkOrderItem(workOrderItem: WorkOrderItem): Promise<void> {
    return this.http.post(`/instock/warehouseWorkOrderItem`, workOrderItem).then(handleResult);
  }
}