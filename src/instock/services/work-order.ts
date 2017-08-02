import { autoinject } from "aurelia-dependency-injection";
import { handleResult, Query, RestClient, fixDate } from "@app/utils";
import { WorkOrder, WorkOrderItem, WorkOrderArea, WorkOrderDetail } from "@app/instock/models/work";
import { ConstantValues } from '@app/common/models/constant-values';
import { Organization } from '@app/base/models/organization';
/**
 * 查询条件
 */
export interface WorkOrderCriteria {
  searchName?: string;
  businessId?: string;
  flowId?: string;
  type?: number;
}

export interface WorkOrderAndItems {
  warehouseWorkOrder?: WorkOrder;
  list?: WorkOrderArea[];
}

@autoinject
export class WorkOrderService {
  constructor(private http: RestClient) {
  }

  queryWorkOders(criteria: WorkOrderCriteria): Query<WorkOrder> {
    return this.http.query<WorkOrder>(`/base/warehouseWorkOrder/pageByBusinessId`, criteria)
      .map(c => fixDate(c, "workDate"));
  }

  queryWorkOrdersByCargo(criteria: WorkOrderCriteria): Query<WorkOrder> {
    return this.http.query<WorkOrder>(`/base/warehouseWorkOrder/page`, criteria)
      .map(c => fixDate(c, "workDate"));
  }

  async getWorkOders(businessId: string): Promise<WorkOrder[]> {
    return this.http.get(`/base/warehouseWorkOrder/list/${businessId}`)
      .then(res => res.content.map((work) => {
        work.workOrderCategoryName = ConstantValues.WorkInfoCategory.find(r => r.value == work.workOrderCategory).text;
        work.workDate = new Date(work.workDate);
        return work;
      }));
  }

  getWorkOrderById(id: string): Promise<WorkOrder> {
    return this.http.get(`/base/warehouseWorkOrder/${id}`).then(res => {
      let workOrder = res.content;
      fixDate(workOrder, 'workDate');
      return workOrder;
    });
  }

  saveWorkOrder(workOrder: WorkOrder): Promise<void> {
    return this.http.post(`/base/warehouseWorkOrder`, workOrder).then(handleResult);
  }

  saveWorkOrderAndItems(workOrderAndItems: WorkOrderAndItems): Promise<void> {
    return this.http.post(`/base/warehouseWorkOrder/saveWorkAndItems`, workOrderAndItems).then(handleResult);
  }

  updateWorkOrderAndItems(workOrderAndItems: WorkOrderAndItems): Promise<void> {
    return this.http.put(`/base/warehouseWorkOrder/update`, workOrderAndItems).then(handleResult);
  }

  removeWorkOrder(id: string): Promise<void> {
    return this.http.put(`/base/warehouseWorkOrder/${id}`, '').then(handleResult);
  }

  listCustomersForWork(): Promise<Organization[]> {
    return this.http.get(`/base/customer/listForWork`).then(res => res.content);
  }
}

@autoinject
export class WorkOrderItemService {
  constructor(private http: RestClient) {
  }

  getWorkOrderItems(workAreaId: string): Promise<WorkOrderItem[]> {
    return this.http.get(`/base/warehouseWorkOrderItem/list/${workAreaId}`).then(res => res.content);
  }

  saveWorkOrderItem(workOrderItem: WorkOrderItem): Promise<void> {
    return this.http.post(`/base/warehouseWorkOrderItem`, workOrderItem).then(handleResult);
  }
  /**
   * 根据作业区域ID获取作业内容
   * @param workAreaId 
   */
  getWorkOrderItemList(workAreaId: string): Promise<WorkOrderItem[]> {
    return this.http.get(`/base/warehouseWorkOrderItem/${workAreaId}/list`).then(res => res.content);
  }

  removeWorkOrderItem(id: string): Promise<void> {
    return this.http.put(`/base/warehouseWorkOrderItem/${id}`, '').then(handleResult);
  }

  getWorkDetails(flowId: string): Promise<WorkOrderDetail[]>{
    return this.http.get(`/base/warehouseWorkOrderItem/${flowId}/detail`)
    .then(res => {
      let details = res.content;
      details.map(details => fixDate(details,"workDate"))
      return details;
    });
  }

  getOutstockWorkDetails(outstockOrderId: string): Promise<WorkOrderDetail[]>{
    return this.http.get(`/base/warehouseWorkOrderItem/${outstockOrderId}/outstockDetail`)
    .then(res => {
      let details = res.content;
      details.map(details => fixDate(details,"workDate"))
      return details;
    });
  }
}

@autoinject
export class WorkOrderAreaService {
  constructor(private http: RestClient) {
  }
  /**
   * 根据作业ID获取作业区域
   */
  getWorkOrderAreas(workOrderId: string): Promise<WorkOrderArea[]> {
    return this.http.get(`/base/workArea/${workOrderId}`).then(res => res.content);
  }

  removeWorkOrderItem(id: string): Promise<void> {
    return this.http.put(`/base/warehouseWorkOrderItem/${id}`, '').then(handleResult);
  }
}