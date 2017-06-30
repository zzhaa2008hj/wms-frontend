import { Query, RestClient } from "@app/utils";
import { CargoItem } from "@app/instock/models/cargo-item";
import { autoinject } from "aurelia-dependency-injection";

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

  queryCargoItems(criteria: CargoItemCriteria): Query<CargoItem> {
    return this.http.query(`/instock/cargo-item/page`, criteria);
  }

  getCargoItemsByFlowId(flowId: string): Promise<CargoItem[]> {
    return this.http.get(`/instock/cargo-item/list/${flowId}`).then(res => res.content);
  }

}