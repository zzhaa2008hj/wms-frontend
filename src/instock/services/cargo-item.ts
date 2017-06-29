import { RestClient } from "@app/utils";
import { CargoItem } from "@app/instock/models/cargo-item";
export class CargoItemService {
  constructor(private http: RestClient) {
  }

  getCargoItemsByFlowId(flowId: string): Promise<CargoItem[]> {
    return this.http.get(`instock/cargo-itemlist/${flowId}`).then(res => res.content);
  }
}