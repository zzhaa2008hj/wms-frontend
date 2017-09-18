import { autoinject } from "aurelia-dependency-injection";
import { dateConverter, Query, handleResult, RestClient } from "@app/utils";
import { InstockHeapInfo, OrderItem, TallyItem } from '@app/instock/models/order-item';

/**
 * 查询条件
 */
export interface OrderItemCriteria {
  infoId?: string;
  searchName?: string;
  batchNumber?: string;
}

@autoinject
export class OrderItemService {
  constructor(private http: RestClient) {
  }

  queryOrderItems(criteria?: OrderItemCriteria): Query<OrderItem> {
    return this.http.query(`instock/instockOrderItem/page`, criteria);
  }

  //判断是否能生成理货报告
  getJudge(flowIds: string[]): Promise<void> {
    return this.http.post(`/instock/instockOrderItem/ids`, flowIds).then(handleResult);
  }

  //获取将要生成的理货报告
  async getOrderItems(flowIds: string[]): Promise<OrderItem[]> {
    console.log('flowIds', flowIds);
    let res = await this.http.post(`/instock/instockOrderItem/items`, flowIds);
    console.log('res.content', res.content);
    return res.content;
  }

  //生成理貨報告
  saveOrderItem(orderItems: OrderItem[]): Promise<void> {
    return this.http.post(`/instock/instockOrderItem`, orderItems).then(handleResult);
  }

  async getOrderItem(id: string): Promise<OrderItem> {
    let res = await this.http.get(`/instock/instockOrderItem/${id}`);
    return res.content;
  }
}

@autoinject()
export class HeapInfoService {
  constructor(private http: RestClient) {
  }

  listHeapInfoes(orderItemId: string): Promise<InstockHeapInfo[]> {
    return this.http.get(`instock/heap-info/${orderItemId}`).then(res => {
      let orderItems = res.content;
      orderItems.map(dateConverter("instockDate"));
      return orderItems;
    });
  }
}

@autoinject
export class TallyItemService {
  constructor(private http: RestClient) {
  }

  listTallyItems(instockOrderItemId: string): Promise<Array<TallyItem>> {
    return this.http.get(`instock/instockTallyItem/list/${instockOrderItemId}`)
      .then(res => res.content.map(dateConverter("instockDate")));
  }
}