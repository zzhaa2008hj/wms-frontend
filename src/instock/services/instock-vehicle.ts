import { autoinject } from "aurelia-dependency-injection";
import { RestClient } from "@app/utils";
import { InstockVehicle } from "@app/instock/models/instock-vehicle";
/**
 * 查询条件
 */
export interface InstockVehicleCriteria {
  searchName?: string;
}

@autoinject
export class InstockVehicleService {
  constructor(private http: RestClient) {
  }

  listInstockVehicles(goodsId: string): Promise<InstockVehicle[]> {
    return this.http.get(`instock/vehicle/list/${goodsId}`).then(res => res.content);
  }

}