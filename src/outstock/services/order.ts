import { autoinject } from "aurelia-dependency-injection";
import { fixDate, handleResult, Query, RestClient } from "@app/utils";
import { CargoItem } from "@app/base/models/cargo-info";
import { Order, OrderItem } from '@app/outstock/models/order';
import { ValidVo } from "@app/outstock/models/validVo";
import { WorkStatistics } from "@app/instock/models/work";
import { AttachmentMap } from "@app/common/models/attachment";

/**
 * 查询条件
 */
export interface OrderCriteria {
  batchNumber?: string;
  agentName?: string;
  customerName?: string;
  beginDate?: string;
  endDate?: string;
  infoId?: string;
}

@autoinject
export class OrderService {
  constructor(private http: RestClient) {
  }

  queryOrders(criteria: OrderCriteria): Query<Order> {
    return this.http.query<Order>(`/outstock/order/page`, criteria).map(order => fixDate(order, 'outstockDate'));
  }

  delete(id: string): Promise<void> {
    return this.http.delete(`/outstock/order/${id}`).then(handleResult);
  }

  async listBaseCargoItems(cargoInfoId: string): Promise<CargoItem[]> {
    let res = await this.http.get(`/instock/cargo-flow/${cargoInfoId}/baseCargoItemList`);
    return res.content;
  }

  saveOrder(order: Order): Promise<void> {
    return this.http.post(`/outstock/order`, order).then(handleResult);
  }

  async getOrderByIdAndType(id: string, type: number): Promise<Order> {
    let res = await this.http.createRequest(`/outstock/order/${id}`).withParams({ type }).asGet().send();
    return res.content;
  }

  async getOrderById(id: string): Promise<Order> {
    let res = await this.http.get(`/outstock/order/${id}`);
    return res.content;
  }

  updateOrder(order: Order): Promise<void> {
    return this.http.put(`/outstock/order/${order.id}`, order).then(handleResult);
  }

  /**
   * 商务审核
   */
  auditBusiness(id: string, verifyStatus: number, workStatistics?: WorkStatistics): Promise<void> {
    return this.http.put(`/outstock/order/audit/${id}?verifyStatus=${verifyStatus}`, workStatistics).then(handleResult);
  }

  /**
   * 费收审核
   */
  auditFee(id: string, status: number): Promise<void> {
    return this.http.put(`/outstock/order/${id}/fee/${status}`, null).then(handleResult);
  }

  async getChangeHistory(id: string) {
    let res = await this.http.get(`/outstock/order/${id}/changeHistory`);
    return res.content;
  }

  createOutstockOrder(id: string): Promise<void> {
    return this.http.post(`/outstock/order/createOutstockOrder/${id}`, null).then(handleResult);
  }

  queryOrdersByOrderType(type: number, keywords: string): Query<Order> {
    return this.http.query<Order>(`/outstock/order/page/${type}/orderType`, { keywords })
      .map(order => fixDate(order, 'outstockDate'));
  }

  async getOutstockOrderView(id: string) {
    let res = await this.http.get(`/outstock/order/${id}/orderView`);
    return res.content;
  }

  /**
   * 商务确认
   */
  businessConfirm(id: string): Promise<void> {
    return this.http.put(`/outstock/order/${id}/business/confirm`, null).then(handleResult);
  }

  /**
   * 副总审批
   */
  approve(id: string, verifyStatus: number): Promise<void> {
    return this.http.put(`/outstock/order/approve/${id}?verifyStatus=${verifyStatus}`, null).then(handleResult);
  }

  updateStage(id: string, stage: number): Promise<void> {
    return this.http.put(`/outstock/order/${id}/changeStage/${stage}`, '').then(handleResult);
  }

  uploadInfo(id: string, stage: number, list: AttachmentMap[]): Promise<void> {
    return this.http.put(`/outstock/order/${id}/uploadInfo/${stage}`, list).then(handleResult);
  }


  async viewWorkOrder(id: string): Promise<Order> {
    let res = await this.http.get(`/outstock/order/${id}/outstockWorkOrder`);
    return res.content;
  }

  async getValidOutstockNum(cargoInfoId: string): Promise<ValidVo[]> {
    let res = await this.http.get(`/outstock/order/quantity/${cargoInfoId}`);
    return res.content;
  }

  async getItemsAndWorkOrders(orderId: string): Promise<Order> {
    let res = await this.http.get(`/outstock/order/${orderId}/work-order`);
    return res.content;
  }

}

@autoinject
export class OrderItemService {
  constructor(private http: RestClient) {
  }

  /**
   * 根据货物ID查明细
   */
  async getItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    let res = await this.http.get(`/outstock/order/${orderId}/item`);
    return res.content;
  }

  async getItemsByOrderIdAndType(orderId: string, type?: number): Promise<OrderItem[]> {
    let res = await this.http.get(`/outstock/order/${orderId}/items?type=${type}`);
    return res.content;
  }
}