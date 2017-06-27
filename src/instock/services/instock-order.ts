import { autoinject } from "aurelia-dependency-injection";
import { Query, RestClient, handleResult } from "@app/utils";
import { InstockOrder } from "@app/instock/models/instock-order";
/**
 * 入库单
 */
@autoinject
export class InstockOrderService {
  constructor(private http: RestClient) {
  }
  /**
   * 分页查询
   */
  queryInstockOrders(keywords?: string): Query<InstockOrder> {
    return this.http.query('instock/order/page', { keywords });
  }

  /**
   * 获取单个
   */
  async getInstockOrder(id: string): Promise<InstockOrder> {
    let res = await this.http.get(`/instock/order/${id}`);
    return res.content;
  }

  /**
   * 生成入库单
   */
  createInstockOrder(id: string): Promise<void> {
    return this.http.post(`/instock/order/${id}`, {}).then(handleResult);
  }
}