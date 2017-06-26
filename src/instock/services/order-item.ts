import { autoinject } from "aurelia-dependency-injection";
import { dateConverter, Query, RestClient } from "@app/utils";
import { InstockHeapInfo, OrderItem } from "@app/instock/models/order-item";

/**
 * 查询条件
 */
export interface OrderItemCriteria {
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

}

@autoinject()
export class HeapInfoService {
  constructor(private http: RestClient) {
  }

  listHeapInfoes(orderItemId: string): Promise<InstockHeapInfo []> {
    return this.http.get(`instock/heap-info/${orderItemId}`).then(res => {
      let orderItems = res.content;
      orderItems.map(dateConverter("instockDate"));
      return orderItems;
    });
  }
}