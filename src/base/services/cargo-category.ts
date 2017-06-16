import { autoinject } from "aurelia-dependency-injection";
import { extractResult, RestClient } from "../../utils";
import { WorkInfo } from "../models/workInfo";
/**
 * Created by Hui on 2017/6/15.
 */
@autoinject
export class CargoCategoryService {
  constructor(private http: RestClient) {
  }

  async listCargoCategory(): Promise<WorkInfo[]> {
    let url = `/base/cargoCategory/list`;
    let res = await this.http.createRequest(url).asGet().send();
    return res.content;
  }

  async saveCargoCategory(workInfo: WorkInfo): Promise<void> {
    let url = `/base/cargoCategory`;
    let res = await this.http.createRequest(url).withContent(workInfo).asPost().send();
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
}