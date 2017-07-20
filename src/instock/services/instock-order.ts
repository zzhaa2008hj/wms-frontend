import { autoinject } from "aurelia-dependency-injection";
import { Query, RestClient, handleResult } from "@app/utils";
import { InstockOrder, InstockOrderVo } from "@app/instock/models/instock-order";
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
  queryInstockOrders(param: { infoId?: string, keywords?: string }): Query<InstockOrder> {
    return this.http.query('instock/order/page', param);
  }

  /**
   * 获取单个
   */
  async getInstockOrder(id: string): Promise<InstockOrderVo> {
    let res = await this.http.get(`/instock/order/${id}`);
    return res.content;
  }

  /**
   * 生成入库单
   */
  createInstockOrder(ids: string[]): Promise<void> {
    return this.http.post('/instock/order', ids).then(handleResult);
  }
}