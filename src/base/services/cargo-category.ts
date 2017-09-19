import { autoinject } from "aurelia-dependency-injection";
import { handleResult, RestClient } from "@app/utils";
import { CargoCategory } from "@app/base/models/cargo-category";

/**
 * Created by Hui on 2017/6/15.
 */
@autoinject
export class CargoCategoryService {
  constructor(private http: RestClient) {
  }

  async listCargoCategory(status?: boolean): Promise<CargoCategory[]> {
    let url = `/base/cargoCategory/list`;
    let res = await this.http.createRequest(url).withParams({ status: status }).asGet().send();
    return res.content;
  }

  saveCargoCategory(cargoCategory: CargoCategory): Promise<void> {
    return this.http.post(`/base/cargoCategory`, cargoCategory).then(handleResult);
  }

  updateState(id: string): Promise<void> {
    return this.http.put(`/base/cargoCategory/${id}/state`, null).then(handleResult);
  }

  updateCargoCategory(cargoCategory: CargoCategory): Promise<void> {
    return this.http.put(`/base/cargoCategory/${cargoCategory.id}`, cargoCategory).then(handleResult);
  }

  deleteCargoCategory(id: string): Promise<void> {
    return this.http.delete(`/base/cargoCategory/${id}`).then(handleResult);
  }

  getCargoCategory(id: string): Promise<CargoCategory> {
    return this.http.get(`/base/cargoCategory/${id}`).then(res => res.content);
  }
}