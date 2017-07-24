import { autoinject } from "aurelia-dependency-injection";
import { handleResult, Query, RestClient } from "@app/utils";
import { OutstockInventory, OutstockInventoryVo } from "@app/outstock/models/inventory";

@autoinject
export class OutstockInventoryService {
  constructor(private http: RestClient) {
  }
  /**
   * 分页查询
   */
  queryOutstockInventorys(batchNumber: string): Query<OutstockInventory> {
    return this.http.query<OutstockInventory>(`/outstock/inventory/page`, { batchNumber });
  }

  /**
   * 获取单个
   * @param id 
   */
  getOutstockInventory(id: string): Promise<OutstockInventoryVo> {
    return this.http.get(`/outstock/inventory/${id}`).then(res => res.content);
  }

  /**
   * 生成出库清单
   */
  createOutstockInventory(batchNumber: string): Promise<void> {
    return this.http.post(`/outstock/inventory/${batchNumber}`, null).then(handleResult);
  }
}