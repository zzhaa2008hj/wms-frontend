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

  async saveCargoCategory(cargoCategory: CargoCategory): Promise<void> {
    return await this.http.post(`/base/cargoCategory`, cargoCategory).then(handleResult);
  }

  async updateState(id: string): Promise<void> {
    return await this.http.put(`/base/cargoCategory/${id}`, null).then(handleResult);
  }

  async updateCargoCategory(cargoCategory: CargoCategory): Promise<void> {
    return await this.http.put(`/base/cargoCategory/${cargoCategory.id}`, cargoCategory).then(handleResult);
  }

  async deleteCargoCategory(id: string) {
    return await this.http.delete(`/base/cargoCategory/${id}`, ).then(handleResult);
  }
}