import { autoinject } from "aurelia-dependency-injection";
import { extractResult, RestClient } from "../../utils";
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
    let url = `/base/cargoCategory`;
    let res = await this.http.createRequest(url).withContent(cargoCategory).asPost().send();
    return extractResult(res.content);
  }

  async updateState(id: string): Promise<void> {
    let url = `/base/cargoCategory/${id}`;
    let res = await this.http.createRequest(url).asPut().send();
    return extractResult(res.content);
  }

  async updateCargoCategory(workInfo: any): Promise<void> {
    let url = `/base/cargoCategory`;
    let res = await this.http.createRequest(url).withContent(workInfo).asPut().send();
    return extractResult(res.content);
  }

  async deleteCargoCategory(id: string) {
    let url = `/base/cargoCategory/${id}`;
    let res = await this.http.createRequest(url).asDelete().send();
    return extractResult(res.content);
  }
}