import { Query, RestClient } from "@app/utils";
import { autoinject } from "aurelia-dependency-injection";
import { InstockCargoItem } from "@app/instock/models/cargo-flow";

/**
 * 查询条件
 */
export interface CargoItemCriteria {
  searchName?: string;
  flowId?: string;
}

@autoinject
export class CargoItemService {
  constructor(private http: RestClient) {
  }

  queryCargoItems(criteria: CargoItemCriteria): Query<InstockCargoItem> {
    return this.http.query(`/instock/cargo-item/page`, criteria);
  }

  getCargoItemsByFlowId(flowId: string): Promise<InstockCargoItem[]> {
    return this.http.get(`/instock/cargo-item/list/${flowId}`).then(res => res.content);
  }

  //货物明细表
  getBaseCargoItemById(cargoItemId: string): Promise<InstockCargoItem> {
    return this.http.get(`/instock/cargo-item/${cargoItemId}/base`).then(res => res.content);
  }
}