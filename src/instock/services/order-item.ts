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

  //生成理貨報告
  saveOrderItem(ids: string[]): Promise<void> {
    return this.http.post(`/instock/instockOrderItem`, ids).then(handleResult);
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