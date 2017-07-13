import { autoinject } from "aurelia-dependency-injection";
import { fixDate, handleResult, Query, RestClient } from "@app/utils";
import { CargoInfo, CargoItem } from "@app/base/models/cargo-info";
import { Order } from "@app/outstock/models/order";

/**
 * 查询条件
 */
export interface OrderCriteria {
  batchNumber?: string;
  agentName?: string;
  customerName?: string;
  beginDate?: string;
  endDate?: string;
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

  async listBaseCargoInfosByInstock(): Promise<Array<CargoInfo>> {
    let res = await this.http.get(`/base/cargoInfo/list`);
    return res.content;
  }

  async listBaseCargoItems(cargoInfoId: string): Promise<CargoItem[]> {
    let res = await this.http.get(`/instock/cargo-flow/${cargoInfoId}/baseCargoItemList`);
    return res.content;
  }

  saveOrder(order: Order): Promise<void> {
    return this.http.post(`/outstock/order`, order).then(handleResult);
  }

  async getOrderById(id: string): Promise<Order> {
    let res = await this.http.get(`/outstock/order/${id}`);
    return res.content;
  }

  updateOrder(order: Order): Promise<void> {
    return this.http.put(`/outstock/order/${order.id}`, order).then(handleResult);
  }
}

@autoinject
export class OrderItemService {
  // constructor(private http: RestClient) {
  // }


}

@autoinject
export class VehicleService {
  // constructor(private http: RestClient) {
  // }


}