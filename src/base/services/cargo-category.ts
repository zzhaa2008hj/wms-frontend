import { autoinject } from "aurelia-dependency-injection";
import { extractResult, handleResult, RestClient } from "../../utils";
import { CargoCategory } from "../models/cargo-category";
/**
 * Created by Hui on 2017/6/15.
 */
@autoinject
export class CargoCategoryService {
  constructor(private http: RestClient) {
  }

  async listCargoCategory(params?: { status: boolean }): Promise<CargoCategory[]> {
    let url = `/base/cargoCategory/list`;
    let res = await this.http.createRequest(url).withParams(params).asGet().send();
    return res.content;
  }

  saveCargoCategory(cargoCategory: CargoCategory) {
    return this.http.post(`/base/cargoCategory`, cargoCategory).then(handleResult);
  }

  updateState(id: string) {
    return this.http.put(`/base/cargoCategory/${id}/state`, null).then(handleResult);
  }

  updateCargoCategory(cargoCategory: CargoCategory) {
    return this.http.put(`/base/cargoCategory/${cargoCategory.id}`, cargoCategory).then(handleResult);
  }

  deleteCargoCategory(id: string) {
    return this.http.delete(`/base/cargoCategory/${id}`).then(handleResult);
  }
}