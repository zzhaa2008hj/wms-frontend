import { autoinject } from "aurelia-dependency-injection";
import { Query, RestClient } from "@app/utils";
import { WorkOrder, WorkOrderItem } from "@app/instock/models/work";
/**
 * 查询条件
 */
export interface WorkOrderCriteria {
  searchName?: string;
}

@autoinject
export class WorkOrderService {
  constructor(private http: RestClient) {
  }

  queryWorkOders(criteria: WorkOrderCriteria): Query<WorkOrder> {
    return this.http.query(`/instock/warehouseWorkOrder/page`, criteria);
  }

  getWorkOders(businessId: string): Promise<WorkOrder []> {
    return this.http.get(`/instock/warehouseWorkOrder/list/${businessId}`).then(res => res.content);
  }
}

@autoinject
export class WorkOderItemService {
  constructor(private http: RestClient) {
  }

  getWorkOrderItems(workOrderId: string): Promise<WorkOrderItem[]> {
    return this.http.get(`/instock/warehouseWorkOrderItem/list/${workOrderId}`).then(res => res.content);
  }
}